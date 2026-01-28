# Enterprise Platform - Terraform Outputs

output "vpc_id" {
  description = "VPC ID"
  value       = module.vpc.vpc_id
}

output "public_subnet_ids" {
  description = "Public subnet IDs"
  value       = module.vpc.public_subnet_ids
}

output "private_subnet_ids" {
  description = "Private subnet IDs"
  value       = module.vpc.private_subnet_ids
}

output "alb_dns_name" {
  description = "ALB DNS name"
  value       = module.alb.dns_name
}

output "alb_zone_id" {
  description = "ALB hosted zone ID"
  value       = module.alb.zone_id
}

output "rds_endpoint" {
  description = "RDS endpoint"
  value       = module.rds.endpoint
  sensitive   = true
}

output "redis_endpoint" {
  description = "ElastiCache Redis endpoint"
  value       = module.elasticache.endpoint
}

output "ecs_cluster_name" {
  description = "ECS cluster name"
  value       = module.ecs.cluster_name
}

output "ecs_api_service_name" {
  description = "ECS API service name"
  value       = module.ecs.api_service_name
}

output "ecs_web_service_name" {
  description = "ECS Web service name"
  value       = module.ecs.web_service_name
}

output "assets_bucket_name" {
  description = "S3 bucket name for assets"
  value       = module.s3.bucket_name
}

output "assets_bucket_domain" {
  description = "S3 bucket domain for assets"
  value       = module.s3.bucket_domain
}

output "ecr_api_repository_url" {
  description = "ECR repository URL for API"
  value       = module.ecs.ecr_api_repository_url
}

output "ecr_web_repository_url" {
  description = "ECR repository URL for Web"
  value       = module.ecs.ecr_web_repository_url
}
