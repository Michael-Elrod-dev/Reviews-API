# Customer Review API

This repository contains an OpenAPI 3.0 YAML file for the Customer Review API. The API handles customer reviews for restaurants and drivers, allowing users to view, create, edit, and delete reviews, as well as manage comments on reviews.

## Overview

The API provides endpoints for the following operations:

- Retrieving a list of customer reviews
- Retrieving, updating, and deleting individual reviews
- Retrieving and managing reviews for restaurants and drivers
- Adding and managing comments on reviews
- Retrieving and deleting reviews by user
- Checking API health

## How to Use

1. Clone the repository.
2. Import the `index.yaml` file into an API development environment, such as Postman or Swagger.
3. Set up a server that implements the API endpoints according to the specification in the YAML file.
4. Test the API endpoints using an API client.

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
