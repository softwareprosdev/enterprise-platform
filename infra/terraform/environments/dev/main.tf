# Development Environment Configuration

terraform {
  required_version = ">= 1.5.0"

  backend "local" {
    path = "terraform.tfstate"
  }
}

module "infrastructure" {
  source = "../../"

  environment = "dev"
  aws_region  = "us-east-1"

  # Networking
  vpc_cidr = "10.0.0.0/16"

  # Database - smaller instances for dev
  db_instance_class    = "db.t3.micro"
  db_allocated_storage = 20
  db_name              = "enterprise"
  db_username          = var.db_username
  db_password          = var.db_password

  # Redis - single node for dev
  redis_node_type  = "cache.t3.micro"
  redis_num_nodes  = 1

  # ECS - minimal resources for dev
  api_image         = var.api_image
  web_image         = var.web_image
  api_cpu           = 256
  api_memory        = 512
  web_cpu           = 256
  web_memory        = 512
  api_desired_count = 1
  web_desired_count = 1

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
  type    = string
  default = ""
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
