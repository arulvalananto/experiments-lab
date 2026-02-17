# Terraform LocalStack Project

## Overview

This project demonstrates Infrastructure as Code using Terraform with LocalStack, a fully functional local AWS cloud emulator. It allows you to develop and test AWS infrastructure locally without incurring cloud costs.

## What It Does

The project provisions and manages:

- **S3 Buckets**: Creates environment-specific S3 buckets with sample objects
- **DynamoDB Tables**: Provisions DynamoDB tables with pay-per-request billing
- **State Management**: Uses MinIO (S3-compatible storage) as the Terraform backend for state persistence

## Key Features

- **Modular Architecture**: Reusable storage module encapsulates S3 and DynamoDB resource definitions
- **Multi-Environment Support**: Separate variable files for `dev`, `stage`, and production environments
- **LocalStack Integration**: Configured to work with LocalStack endpoints on localhost (port 4566)
- **MinIO Backend**: Uses local MinIO instance (port 9000) for terraform state storage

## Project Structure

```code
├── main.tf              # Primary configuration with provider setup and module reference
├── variables.tf         # Input variable definitions
├── outputs.tf           # Output values for resources
├── dev.tfvars          # Development environment variables
├── stage.tfvars        # Staging environment variables
├── terraform.tfvars    # Default/production environment variables
└── modules/
    └── storage/         # Reusable storage module
        ├── main.tf      # S3 and DynamoDB resource definitions
        ├── variables.tf # Module input variables
        └── outputs.tf   # Module output values
```

## Environment Variables

- `bucket_name`: S3 bucket name (environment suffix added automatically)
- `dynamodb_table_name`: DynamoDB table name (environment suffix added automatically)
- `environment`: Environment identifier (dev, stage, prod)

## Prerequisites

- Terraform >= 1.0
- LocalStack running locally
- MinIO running for backend state storage
