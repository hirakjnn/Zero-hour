# AWS Tools Used in Zero Hour (VS Code Web IDE)

This document outlines the Amazon Web Services (AWS) tools and services that are utilized—or planned for utilization—in the architecture of this project, along with their specific use cases.

## 1. Amazon Bedrock
- **Where it is used:** Backend (`backend/routes/ai.js`) via the `@aws-sdk/client-bedrock-runtime` package.
- **What it is used for:** It powers the "Socratic AI" Mentor feature in the IDE frontend. The application uses the `Claude 3.5 Sonnet` model hosted on AWS Bedrock. Instead of generating direct code solutions, Bedrock is prompted to analyze the user's running code vs. the expected solution and provide guiding hints.
- **Additional context:** The backend utilizes the Bedrock Runtime to handle prompt streaming (`InvokeModelWithResponseStreamCommand`), enabling real-time typing experiences in the frontend AI chat.

## 2. AWS IAM (Identity and Access Management)
- **Where it is used:** Backend environment configuration.
- **What it is used for:** Handled explicitly through AWS credentials (`AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`). The application depends on IAM roles and policies to securely grant the backend server permissions to invoke models on Amazon Bedrock.

## 3. Amazon EC2 (Elastic Compute Cloud)
- **Where it is used:** Referenced in error handling within the backend (`backend/routes/ai.js`).
- **What it is used for:** The application is built with the assumption that the backend might be deployed on an EC2 instance. Error handling specifically indicates ensuring that the EC2 instance has an attached IAM role that permits Bedrock access.

## 4. AWS Fargate (Planned/Conceptual Infrastructure)
- **Where it is used:** Architecture planning (`ZERO_HOUR_EXPLAINED.md`).
- **What it is used for:** Slated as the primary orchestrator for the Minimum Viable Product (MVP) phase. Fargate will be used to automatically spin up, manage, and tear down isolated Docker containers (user sandboxes) without the need to manage the underlying server instances directly.

## 5. Amazon EKS (Elastic Kubernetes Service) (Planned for Scale)
- **Where it is used:** Architecture planning (`ZERO_HOUR_EXPLAINED.md`).
- **What it is used for:** Mentioned as the ultimate scaling solution for the platform. As the application grows to support thousands of simultaneous student container pods, EKS is planned for highly fine-grained orchestration and load balancing.
