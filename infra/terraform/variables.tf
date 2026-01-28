# Enterprise Platform - Terraform Variables

# General
variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be dev, staging, or prod."
  }
}

# Networking
variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

# Database
variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.medium"
}

variable "db_allocated_storage" {
  description = "Allocated storage for RDS in GB"
  type        = number
  default     = 20
}

variable "db_name" {
  description = "Database name"
  type        = string
  default     = "enterprise"
}

variable "db_username" {
  description = "Database master username"
  type        = string
  sensitive   = true
}

variable "db_password" {
  description = "Database master password"
  type        = string
  sensitive   = true
}

# Redis
variable "redis_node_type" {
  description = "ElastiCache node type"
  type        = string
  default     = "cache.t3.micro"
}

variable "redis_num_nodes" {
  description = "Number of ElastiCache nodes"
  type        = number
  default     = 1
}

# ECS
variable "api_image" {
  description = "Docker image for API service"
  type        = string
}

variable "web_image" {
  description = "Docker image for Web service"
  type        = string
}

variable "api_cpu" {
  description = "CPU units for API task"
  type        = number
  default     = 512
}

variable "api_memory" {
  description = "Memory (MB) for API task"
  type        = number
  default     = 1024
}

variable "web_cpu" {
  description = "CPU units for Web task"
  type        = number
  default     = 256
}

variable "web_memory" {
  description = "Memory (MB) for Web task"
  type        = number
  default     = 512
}

variable "api_desired_count" {
  description = "Desired count of API tasks"
  type        = number
  default     = 2
}

variable "web_desired_count" {
  description = "Desired count of Web tasks"
  type        = number
  default     = 2
}

# Security
variable "certificate_arn" {
  description = "ACM certificate ARN for HTTPS"
  type        = string
  default     = ""
}

variable "auth_secret" {
  description = "Authentication secret for JWT"
  type        = string
  sensitive   = true
}
