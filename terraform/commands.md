# Terraform Important Commands

```bash
terraform init # initialize terraform
terraform plan # generate execution plan
terraform apply # apply changes to infrastructure
terraform destroy # destroy infrastructure
terraform validate # validate configuration files
terraform fmt # format configuration files
```

## Auto-approve Option

```bash
terraform apply -auto-approve
terraform destroy -auto-approve
```

## Using Variable Files

```bash
terraform apply -var-file=dev.tfvars
terraform apply -var-file=stage.tfvars
```
