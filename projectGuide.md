# Creator Cards Assessment - Implementation Guide

## Overview

This project is my implementation of the Creator Cards Assessment.

The application provides endpoints for:

- Creating a creator card
- Retrieving a creator card
- Deleting a creator card

The service has been deployed and is publicly accessible on Render.

---

## Live Deployment

**Base URL**

```text
https://creator-card-assessment-m4or.onrender.com
```

### Important Note

This application is deployed on the **Render Free Tier**.

Render free instances automatically spin down after periods of inactivity. When the application receives a new request after being idle, it may take approximately **30–60 seconds** (sometimes around 50 seconds) for the service to wake up before responding.

This behavior is expected and does not indicate an application issue.

---

## API Endpoints

### Create Creator Card

Creates a new creator card.

```http
POST /creator-cards
```

Example:

```http
POST https://creator-card-assessment-m4or.onrender.com/creator-cards
```

---

### Get Creator Card

Retrieves a creator card using its unique slug.

Public Creator Card

Example:

GET /creator-cards/:slug

Live Example:

GET https://creator-card-assessment-m4or.onrender.com/creator-cards/obinna-chuks-r6ozr2

Use this endpoint when the creator card is publicly accessible and does not require an access code.

Private Creator Card

Some creator cards may be protected with an access code.

Example:

GET /creator-cards/:slug?access_code=<access_code>

Live Example:

GET https://creator-card-assessment-m4or.onrender.com/creator-cards/obinna-chuks-r6ozr2?access_code=12345B

In this case, the access_code is passed as a query parameter and is validated before the creator card details are returned.


* Public creator cards can be accessed without an access code.
### Delete Creator Card

Deletes a creator card using its access code.

Example:

```http
DELETE /creator-cards/:accessCode
```

Live Example:

```http
DELETE https://creator-card-assessment-m4or.onrender.com/creator-cards/obinna-chuks-r6ozr2
```

---

## Local Development Setup

### Prerequisites

- Node.js
- npm or yarn
- Git

---

### Clone Repository

```bash
git clone <repository-url>
cd node-template
```

---

### Install Dependencies

Using npm:

```bash
npm install
```

Using yarn:

```bash
yarn install
```

---

### Environment Configuration

Create a `.env` file in the root directory.

Example:

```env
NODE_ENV=development

DB_HOST=
DB_PORT=
DB_NAME=
DB_USER=
DB_PASSWORD=

APP_PORT=3000
```

Populate the variables with the appropriate values for your environment.

---

### Start Development Server

```bash
npm run dev
```

or

```bash
yarn dev
```

---

### Start Production Mode

```bash
npm start
```

or

```bash
yarn start
```

---

## Validation Implementation Notes

One of the primary challenges encountered during development was understanding and navigating the project's validation architecture.

The codebase contains two separate validation-related areas:

```text
validator/
validator-vsl/
```

Initially, it was unclear which validation mechanism should be used for request validation and service-level validation.

After reviewing the existing implementation patterns throughout the project, it became apparent that:

- The project uses a custom validation approach.
- Validation specifications are defined using VSL (Validation Specification Language).
- Existing services rely heavily on validator parsing and validation helpers.
- Following the established project conventions was necessary to ensure consistency with the rest of the codebase.

Understanding how the validator layer interacted with service execution required additional investigation before implementation could proceed confidently.

---

## Additional Challenges

### Project Structure Familiarization

The project uses a custom architecture with abstractions such as:

- Services
- Repositories
- Endpoint handlers
- Custom validators
- Message definitions
- Error code definitions

A significant portion of the implementation effort involved understanding the existing architecture and ensuring that new functionality aligned with the established conventions.

---

### ESLint and Git Hooks

The repository includes:

- Husky
- lint-staged
- ESLint
- Commitlint

These tools enforce:

- Code formatting
- Linting standards
- Conventional commit messages

During development, commits were blocked until all staged files passed linting and commit messages followed the required format.

Example:

```bash
git commit -m "feat: implement creator card endpoints"
```

---

### Deployment Troubleshooting

Deployment to Render required additional investigation due to module resolution issues originating from the project template.

The application was ultimately deployed successfully after resolving missing dependency and runtime issues.

---

## Assumptions Made

- Existing project architecture and conventions were preserved.
- Existing validation and error handling patterns were followed.
- Endpoint implementations were designed to integrate seamlessly with the project's current structure.

---

## Technology Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- ESLint
- Husky
- lint-staged
- Commitlint
- Render

---

## Testing

To run tests:

```bash
npm test
```

---

## Deployment Platform

**Render**

Deployment URL:

```text
https://creator-card-assessment-m4or.onrender.com
```

Free-tier instances may require approximately 30–60 seconds to wake up after inactivity.

---

## Author

**Obinna Chukwunenye**

Software Engineer

GitHub:
https://github.com/Obichris1