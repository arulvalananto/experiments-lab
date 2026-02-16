# Terraform Fundamentals

Core concepts form the foundation of Infrastructure as Code with Terraform.

## 1. Provider

A provider is an API plugin that enables Terraform to communicate with external platforms.

**Supported Platforms:**

- AWS
- Docker
- Kubernetes
- Azure

**Example:**

```hcl
provider "aws" {
  region = "ap-south-1"
}
```

Without a provider, Terraform cannot interact with any infrastructure platform.

---

## 2. Resource

A resource represents an infrastructure object that Terraform manages.

**Example:**

```hcl
resource "aws_instance" "my_server" {
  ami           = "ami-xxxx"
  instance_type = "t2.micro"
}
```

**Syntax:**

```hcl
resource "<TYPE>" "<LOCAL_NAME>"
```

---

## 3. State File

Terraform maintains a critical state file that tracks infrastructure state.

**State File Location:**

```hcl
terraform.tfstate
```

**Tracks:**

- Resources created by Terraform
- Resource IDs
- Dependencies between resources

The state file is essential—without it, Terraform cannot track what it has created. This is one of the most commonly misunderstood concepts in Terraform interviews.

---

## 4. terraform init

Initializes a Terraform working directory.

**Functions:**

- Downloads provider plugins
- Sets up backend configuration
- Prepares the working directory

Run this command once per project.

---

## 5. terraform plan

Generates an execution plan showing proposed changes.

**Shows:**

- Resources to be created
- Resources to be changed
- Resources to be destroyed

Provides a safe preview before making any actual changes.

---

## 6. terraform apply

Applies the changes defined in your configuration.

Provisions or modifies actual infrastructure resources.

---

## 7. terraform destroy

Removes all infrastructure defined in the configuration.

Important for cost management and cleanup.
