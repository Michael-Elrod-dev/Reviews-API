# Customer Review API

This repository houses the evolved Customer Review API, initially an OpenAPI 3.0 YAML file in Postman, and later materialized into a full-fledged API using AWS API Gateway, Lambda, and DynamoDB.

The API was crafted collaboratively by a team using the AWS Educate program's resources, granting us access to the student version of AWS.

Our API handles the lifecycle of customer reviews for restaurants and drivers. The operations include the ability to create, view, edit, and delete reviews. Moreover, users can manage comments on the reviews, adding an extra layer of interactivity and engagement.

By using AWS API Gateway, we ensure secure and smooth data traffic. Lambda allows us to execute our code without provisioning or managing servers, and DynamoDB, a NoSQL database service, provides fast and predictable performance with seamless scalability.

## Overview

The API provides endpoints for the following operations:

- Retrieving a list of customer reviews
- Retrieving, updating, and deleting individual reviews
- Retrieving and managing reviews for restaurants and drivers
- Adding and managing comments on reviews
- Retrieving and deleting reviews by user
- Checking API health

## API Documentation

The YAML file serves as both the API specification and documentation. You can view and interact with the API documentation by importing the YAML file into an API documentation tool, such as Swagger UI or ReDoc.

To set up Swagger UI:

1. Download and install the [Swagger UI](https://swagger.io/tools/swagger-ui/) distribution.
2. Open the `index.html` file in a web browser.
3. Enter the path to the `index.yaml` file in the "Explore" input field, and press Enter.
4. Explore the API documentation and interact with the API endpoints.

To set up ReDoc:

1. Download and install the [ReDoc](https://github.com/Redocly/redoc) distribution.
2. Open the `index.html` file in a web browser.
3. Update the `spec-url` attribute of the `redoc` element to point to the `index.yaml` file.
4. Explore the API documentation.
