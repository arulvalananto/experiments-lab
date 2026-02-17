
resource "aws_s3_bucket" "my_bucket" {
  bucket = "${var.bucket_name}-${var.environment}"

  tags = {
    Environment = var.environment
  }
}

resource "aws_s3_object" "my_object" {
  bucket  = aws_s3_bucket.my_bucket.id
  key     = "my-object"
  content = "Hello from ${var.environment}"
}

resource "aws_dynamodb_table" "my_table" {
  name         = "${var.dynamodb_table_name}-${var.environment}"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"

  attribute {
    name = "id"
    type = "S"
  }

  tags = {
    Environment = var.environment
  }
}
