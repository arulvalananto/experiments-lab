# Environment Separation (dev / stage)

This is variable-based separation.

## Variables

```tf
# dev.tfvars
bucket_name         = "my-local-bucket"
dynamodb_table_name = "my-local-table"
environment         = "dev"
```

```tf
# stage.tfvars
bucket_name         = "my-local-bucket"
dynamodb_table_name = "my-local-table"
environment         = "stage"
```
