const AWS = require("aws-sdk");
AWS.config.update( {
    region: "us-east-1"
});

//constants for paths and tables
const dynamodb = new AWS.DynamoDB.DocumentClient();
const dynamodbTableName = "reviewsapi";

const reviewPath = "/reviews";
const driverPath = "/reviews/driver/{DriverID}";
const restPath = "/reviews/restaurant/{RestaurantID}";
const userPath = "/reviews/user/{UserID}";
const reviewIDPath = "/reviews/{ReviewID}";
const commentPath = "/reviews/{ReviewID}/comment";
const healthPath = "/health"


exports.handler = async function(event) {
    let response;
    // Error handling
    
    if (!event.path) {
        return buildResponse(400, { message: "Invalid request" });
    }
    
    switch(true) {
        // Case for GET /health
        case event.httpMethod === "GET" && event.path === healthPath:
            response = await getHealth();
            break;

        //Cases for /reviews
        //GET for /reviews
        case event.httpMethod == "GET" && event.path == reviewPath:
            response = await getReviews();
            break;
        //DELETE for /reviews
        case event.httpMethod == "DELETE" && event.path == reviewPath:
            response = await deleteReviews();
            break;
        
        //Cases for /reviews/{ReviewID}
        //GET for /reviews/{ReviewID}
        case event.httpMethod == "GET" && event.path.replace(event.pathParameters.ReviewID, "{ReviewID}") == reviewIDPath:
            response = await getReviewID(event.pathParameters.ReviewID);
            break;
        //PATCH for /reviews/{ReviewID}
        case event.httpMethod == "PATCH" && event.path.replace(event.pathParameters.ReviewID, "{ReviewID}") == reviewIDPath:
            response = await patchReviewID(event.pathParameters.ReviewID,JSON.parse(event.body));
            break;
        //DELETE for /reviews/{ReviewID}
        case event.httpMethod == "DELETE" && event.path.replace(event.pathParameters.ReviewID, "{ReviewID}") == reviewIDPath:
            response = await deleteReviewID(event.pathParameters.ReviewID);
            break;

        //Cases for /reviews/{ReviewsID}/comment
        //GET for /reviews/{ReviewsID}/comment
        case event.httpMethod == "GET" && event.path.replace(event.pathParameters.ReviewID, "{ReviewID}") == commentPath:
            response = await getComments(event.pathParameters.ReviewID);
            break;

         //PATCH for /reviews/{ReviewsID}/comment
         case event.httpMethod == "PATCH" && event.path.replace(event.pathParameters.ReviewID, "{ReviewID}") == commentPath:
            response = await patchComment(event.pathParameters.ReviewID, JSON.parse(event.body));
            break;
        //DELETE for /reviews/{ReviewsID}/comment
        case event.httpMethod == "DELETE" && event.path.replace(event.pathParameters.ReviewID, "{ReviewID}") == commentPath:
            response = await deleteComments(event.pathParameters.ReviewID);
            break;

        //Cases for /reviews/user/{UserID}
        // GET for /reviews/user/{UserID}
        case event.httpMethod == "GET" && event.path.replace(event.pathParameters.UserID, "{UserID}") == userPath:
            response = await getReviewsByUserID(event.pathParameters.UserID);
            break;
        // DELETE for /reviews/user/{UserID}
        case event.httpMethod == "DELETE" && event.path.replace(event.pathParameters.UserID, "{UserID}") == userPath:
            response = await deleteReviewsByUserID(event.pathParameters.UserID);
            break;

        //Cases for /reviews/restaurant/{RestaurantID}
        // GET for /reviews/restaurant/{RestaurantID}
        case event.httpMethod == "GET" && event.path.replace(event.pathParameters.RestaurantID, "{RestaurantID}") == restPath:
            response = await getReviewsByRestaurantID(event.pathParameters.RestaurantID, event.queryStringParameters?.Rating);
            break;
        // POST for /reviews/restaurant/{RestaurantID}
        case event.httpMethod == "POST" && event.path.replace(event.pathParameters.RestaurantID, "{RestaurantID}") == restPath:
            response = await postReviewForRestaurant(event.pathParameters.RestaurantID, JSON.parse(event.body));
            break;
        // DELETE for /reviews/restaurant/{RestaurantID}
        case event.httpMethod == "DELETE" && event.path.replace(event.pathParameters.RestaurantID, "{RestaurantID}") == restPath:
            response = await deleteReviewsByRestaurantID(event.pathParameters.RestaurantID);
            break;
        
        //Cases for /reviews/driver/{DriverID}
        //Get for /reviews/driver/{DriverID}
        case event.httpMethod == "GET" && event.path.replace(event.pathParameters.DriverID, "{DriverID}") == driverPath:
            response = await getReviewsByDriverID(event.pathParameters.DriverID, event.queryStringParameters?.driverRating);
            break;
        // POST for /reviews/driver/{DriverID}
        case event.httpMethod == "POST" && event.path.replace(event.pathParameters.DriverID, "{DriverID}") == driverPath:
            response = await postReviewForDriver(event.pathParameters.DriverID, JSON.parse(event.body));
            break;
        // DELETE for /reviews/driver/{DriverID}
        case event.httpMethod == "DELETE" && event.path.replace(event.pathParameters.DriverID, "{DriverID}") == driverPath:
            response = await deleteReviewsByDriverID(event.pathParameters.DriverID);
            break;
        
        // Catch Error
        default:
            response = buildResponse(400, { message: "Invalid request" });
    }
    return response;
}

//PATH: /health
//MEHTOD: GET
async function getHealth() {
    return buildResponse(200, { status: "API is healthy" });
}

//PATH: /reviews
//METHOD: GET
async function getReviews() {
    const params = {
        TableName: dynamodbTableName
    }
    const allReviews = await scanDynamoRecords(params, []);
    const body = {
        reviews: allReviews
    }
    return buildResponse(200, body);
}

//PATH: /reviews
//METHOD: delete /deletes all reviews
async function deleteReviews() {
    
    const allReviewsResponse = await getReviews();

    const allReviews = JSON.parse(allReviewsResponse.body).reviews;
    const deletePromises = allReviews.map(review => {
      const params = {
        TableName: dynamodbTableName,
        Key: {
          "ReviewID": review.ReviewID
        }
      };
      return dynamodb.delete(params).promise();
    });
    await Promise.all(deletePromises);
    return buildResponse(200, { message: "All reviews have been deleted." });
  }

//PATH: /review/ReviewID
//METHOD: Get
async function getReviewID(ReviewID) {
    const params = {
        TableName: dynamodbTableName,
        FilterExpression: "#review_id = :review_id",
        ExpressionAttributeNames: {
            "#review_id": "ReviewID",
        },
        ExpressionAttributeValues: {
            ":review_id": ReviewID,
        }
    }
    const allReviews = await scanDynamoRecords(params, []);
    const body = {
        reviews: allReviews
    }
    return buildResponse(200, body);
}

//Patch: /review/ReviewID
//METHOD: patch/ patches a review using the reviewid pathparamater
async function patchReviewID(ReviewID,updateData){
    
    const { Rating, Review, Published } = updateData;

    const params = {
        TableName: dynamodbTableName,
        Key: {
            "ReviewID": ReviewID
        },
        UpdateExpression: "set Rating = :Rating,  Review = :Review, Published = :Published",
    ExpressionAttributeValues: {
        ":Rating": Rating,
        ":Review": Review,
        ":Published": Published
    },
        ReturnValues: "UPDATED_NEW"
    };
    return await dynamodb.update(params).promise().then((response) => {
        const body = {
          Operation: "UPDATE",
          Message: "SUCCESS",
          UpdatedAttributes: response
        };
        return buildResponse(200, body);
      }, (error) => {
        return buildResponse(400, error);
      });
}

//PATH: /review/ReviewID
//METHOD: delete/ deletes review with the ReviewID
async function deleteReviewID(ReviewID){
    const reviewToDeleteResponse = await getReviewID(ReviewID);

    if (!reviewToDeleteResponse.body || JSON.parse(reviewToDeleteResponse.body).reviews.length === 0) {
       return buildResponse(404, { message: "No review found for the specified review ID number." });
    }

    const reviewsToDelete = JSON.parse(reviewToDeleteResponse.body).reviews;
    const deletePromises = reviewsToDelete.map(review => {
    const params = {
        TableName: dynamodbTableName,
        Key: {
            "ReviewID": review.ReviewID
        }
    }
        return dynamodb.delete(params).promise();
    });
    await Promise.all(deletePromises);
    return buildResponse(200, { message: "Successfully deleted the review associated with the specified review ID number" });

}

//PATH: /review/{ReviewID}/comment
//METHOD: Get
async function getComments(ReviewID) {
    const params = {
        TableName: dynamodbTableName,
        FilterExpression: "#review_id = :review_id",
        ExpressionAttributeNames: {
            "#review_id": "ReviewID",
        },
        ExpressionAttributeValues: {
            ":review_id": ReviewID,
        }
    }
    const allReviews = await scanDynamoRecords(params, []);
    const body = {
        Comment: allReviews[0].Comment
    }
    return buildResponse(200, body);
}

//PATH: /reviews/{ReviewID}/comment
//METHOD: PATCH
async function patchComment(ReviewID, updateData){
    const { comment } = updateData;

    const params = {
        TableName: dynamodbTableName,
        Key: {
            "ReviewID": ReviewID
        },
        UpdateExpression: "set #cmt = :comment",
    ExpressionAttributeValues: {
        ":comment": comment
    },
    ExpressionAttributeNames: {
        "#cmt": "Comment"
    },
        ReturnValues: "UPDATED_NEW"
    };
    return await dynamodb.update(params).promise().then((response) => {
        const body = {
          Operation: "UPDATE",
          Message: "SUCCESS",
          UpdatedAttributes: response
        };
        return buildResponse(200, body);
      }, (error) => {
        return buildResponse(400, error);
      });
}

//PATH: /review/{ReviewID}/comment
//METHOD: delete/ deletes all comments of a user
async function deleteComments(ReviewID){
    const comment = "N/A";

    const params = {
        TableName: dynamodbTableName,
        Key: {
            "ReviewID": ReviewID
        },
        UpdateExpression: "set #cmt = :comment",
    ExpressionAttributeValues: {
        ":comment": comment
    },
    ExpressionAttributeNames: {
        "#cmt": "Comment"
    },
        ReturnValues: "UPDATED_NEW"
    };
    return await dynamodb.update(params).promise().then((response) => {
        const body = {
          Operation: "DELETE",
          Message: "SUCCESS",
          UpdatedAttributes: response
        };
        return buildResponse(200, body);
      }, (error) => {
        return buildResponse(400, error);
      });
}


// PATH: /reviews/user/{UserID}
// METHOD: GET
async function getReviewsByUserID(UserID) {
    const params = {
        TableName: dynamodbTableName,
        FilterExpression: "#user_id = :user_id",
        ExpressionAttributeNames: {
            "#user_id": "UserID",
        },
        ExpressionAttributeValues: {
            ":user_id": UserID,
        }
    }
    const allReviews = await scanDynamoRecords(params, []);
    const body = {
        reviews: allReviews
    }
    return buildResponse(200, body);
}

// PATH: /reviews/user/{UserID}
// METHOD: DELETE
async function deleteReviewsByUserID(userID) {
    const reviewsToDeleteResponse = await getReviewsByUserID(userID);

    if (!reviewsToDeleteResponse.body || JSON.parse(reviewsToDeleteResponse.body).reviews.length === 0) {
        return buildResponse(404, { message: "No reviews found for the specified user ID number." });
    }

    const reviewsToDelete = JSON.parse(reviewsToDeleteResponse.body).reviews;
    const deletePromises = reviewsToDelete.map(review => {
    const params = {
        TableName: dynamodbTableName,
        Key: {
            "ReviewID": review.ReviewID
        }
    }
        return dynamodb.delete(params).promise();
    });
    await Promise.all(deletePromises);
    return buildResponse(200, { message: "Successfully deleted all reviews posted by a specific user associated with the specified user ID number" });
}

// PATH: /reviews/restaurant/{RestaurantID}
// METHOD: GET
async function getReviewsByRestaurantID(restaurantID, restaurantRating) {
    const params = {
        TableName: dynamodbTableName,
        FilterExpression: "#restaurant_id = :restaurant_id" + ((restaurantRating !== undefined && restaurantRating !== null) ? " AND #rating = :restaurant_rating" : ""),
        ExpressionAttributeNames: {
            "#restaurant_id": "RestaurantID",
            ...((restaurantRating !== undefined && restaurantRating !== null) ? { "#rating": "Rating" } : {})
        },
        ExpressionAttributeValues: {
            ":restaurant_id": restaurantID,
            ...((restaurantRating !== undefined && restaurantRating !== null) ? { ":restaurant_rating": restaurantRating } : {})
        }
    };
    const allReviews = await scanDynamoRecords(params, []);
    if (allReviews.length === 0) {
        return buildResponse(404, { message: "No reviews found for the specified restaurant." });
    }
    const body = {
        reviews: allReviews
    }
    return buildResponse(200, body);
}

// PATH: /reviews/restaurant/{RestaurantID}
// METHOD: POST
async function postReviewForRestaurant(restaurantID, reviewData) {
    const { Rating, Review, Comment, ReviewID, UserID, Driver, Restaurant, Published } = reviewData;
    
    if (!Rating || !Review || !ReviewID || !UserID || !Driver || !Restaurant || !Published) {
        return buildResponse(400, { message: "Incorrect or missing required fields in the JSON body." });
    }

    const params = {
        TableName: dynamodbTableName,
        Item: {
            RestaurantID: restaurantID,
            ReviewID: ReviewID,
            Rating: Rating,
            Review: Review,
            Comment: Comment,
            UserID: UserID,
            Driver: Driver,
            Restaurant: Restaurant,
            Published: Published
        }
    }
    await dynamodb.put(params).promise();
    return buildResponse(201, { message: "Successfully added a review for the specified RestaurantID" });
}

// PATH: /reviews/restaurant/{RestaurantID}
// METHOD: DELETE
async function deleteReviewsByRestaurantID(restaurantID) {
        const reviewsToDeleteResponse = await getReviewsByRestaurantID(restaurantID);

    if (!reviewsToDeleteResponse.body || JSON.parse(reviewsToDeleteResponse.body).reviews.length === 0) {
        return buildResponse(404, { message: "No reviews found for the specified Restaurant." });
    }

    const reviewsToDelete = JSON.parse(reviewsToDeleteResponse.body).reviews;
    const deletePromises = reviewsToDelete.map(review => {
    const params = {
        TableName: dynamodbTableName,
        Key: {
            "ReviewID": review.ReviewID
        }
    }
        return dynamodb.delete(params).promise();
    });
    await Promise.all(deletePromises);
    return buildResponse(200, { message: "All reviews for the specified restaurant have been deleted." });
}

// PATH: /reviews/driver/{DriverID}
// METHOD: GET
async function getReviewsByDriverID(driverID, driverRating) {
    const params = {
        TableName: dynamodbTableName,
        FilterExpression: "#driver_id = :driver_id" + (driverRating ? " AND #rating = :driver_rating" : ""),
        ExpressionAttributeNames: {
            "#driver_id": "DriverID",
            ...(driverRating ? { "#rating": "Rating" } : {})
        },
        ExpressionAttributeValues: {
            ":driver_id": driverID,
            ...(driverRating ? { ":driver_rating": parseInt(driverRating) } : {})
        }
    }
    const allReviews = await scanDynamoRecords(params, []);
    const body = {
        reviews: allReviews
    }
    return buildResponse(200, body);
}

// PATH: /reviews/driver/{DriverID}
// METHOD: POST
async function postReviewForDriver(DriverID, reviewData) {
    const { Rating, Review, Comment, ReviewID, UserID, Driver, Restaurant, Published } = reviewData;
    
    if (!Rating || !Review || !ReviewID || !UserID || !Driver || !Restaurant || !Published) {
        return buildResponse(400, { message: "Incorrect or missing required fields in the JSON body." });
    }

    const params = {
        TableName: dynamodbTableName,
        Item: {
            DriverID: DriverID,
            ReviewID: ReviewID,
            Rating: Rating,
            Review: Review,
            Comment: Comment,
            UserID: UserID,
            Driver: Driver,
            Restaurant: Restaurant,
            Published: Published
        }
    }
    await dynamodb.put(params).promise();
    const body = {
      Operation: "SAVE",
      Message: "SUCCESS",
      Item: reviewData
    };
    return buildResponse(200, body);
    //return buildResponse(201, { message: "Successfully added a review for the specified DriverID" });
}

// PATH: /reviews/driver/{DriverID}
// METHOD: DELETE
async function deleteReviewsByDriverID(driverID) {
    const reviewsToDeleteResponse = await getReviewsByDriverID(driverID);

    if (!reviewsToDeleteResponse.body || JSON.parse(reviewsToDeleteResponse.body).reviews.length === 0) {
        return buildResponse(404, { message: "No reviews found for the specified Driver." });
    }

    const reviewsToDelete = JSON.parse(reviewsToDeleteResponse.body).reviews;
    const deletePromises = reviewsToDelete.map(review => {
    const params = {
        TableName: dynamodbTableName,
        Key: {
            "ReviewID": review.ReviewID
        }
    }
        return dynamodb.delete(params).promise();
    });
    await Promise.all(deletePromises);
    return buildResponse(200, { message: "All reviews for the specified driver have been deleted." });
}

async function scanDynamoRecords(scanParams, itemArray) {
    try {
        const dynamoData = await dynamodb.scan(scanParams).promise();
        itemArray = itemArray.concat(dynamoData.Items);
        if (dynamoData.LastEvaluatedKey) {
            scanParams.ExclusiveStartKey = dynamoData.LastEvaluatedKey;
            return await scanDynamoRecords(scanParams, itemArray);
        }
        return itemArray;
    } catch (error) {
        console.error('Do your custom error handling here. I am just gonna log it:', error);
    }
}

//a global function that every response should call!
function buildResponse(statusCode, body) {
    return {
        statusCode: statusCode,
        headers: {
        "Content-type": "application/json"
        },
    body: JSON.stringify(body)
    }
}