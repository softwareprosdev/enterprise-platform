# Production Environment Configuration

terraform {
  required_version = ">= 1.5.0"

  # Configure remote state for production
  # backend "s3" {
  #   bucket         = "enterprise-terraform-state-prod"
  #   key            = "prod/terraform.tfstate"
  #   region         = "us-east-1"
  #   encrypt        = true
  #   dynamodb_table = "enterprise-terraform-locks"
  # }
}

module "infrastructure" {
  source = "../../"

  environment = "prod"
  aws_region  = "us-east-1"

  # Networking
  vpc_cidr = "10.0.0.0/16"

  # Database - production-ready instances
  db_instance_class    = "db.r6g.large"
  db_allocated_storage = 100
  db_name              = "enterprise"
  db_username          = var.db_username
  db_password          = var.db_password

  # Redis - multi-node cluster for production
  redis_node_type  = "cache.r6g.large"
  redis_num_nodes  = 3

  # ECS - production resources with scaling
  api_image         = var.api_image
  web_image         = var.web_image
  api_cpu           = 1024
  api_memory        = 2048
  web_cpu           = 512
  web_memory        = 1024
  api_desired_count = 3
  web_desired_count = 3

  # Security
  certificate_arn = var.certificate_arn
  auth_secret     = var.auth_secret
}

variable "db_username" {
  type      = string
  sensitive = true
}

variable "db_password" {
  type      = string
  sensitive = true
}

variable "api_image" {
  type = string
}

variable "web_image" {
  type = string
}

variable "certificate_arn" {
  type = string
}

variable "auth_secret" {
  type      = string
  sensitive = true
}

output "alb_dns_name" {
  value = module.infrastructure.alb_dns_name
}

output "ecr_api_repository_url" {
  value = module.infrastructure.ecr_api_repository_url
}

output "ecr_web_repository_url" {
  value = module.infrastructure.ecr_web_repository_url
}
