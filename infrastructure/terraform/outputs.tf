# ============================================================
# Terraform Outputs
# ============================================================

output "ec2_public_ip" {
  description = "Static Elastic IP of the Murgdur EC2 App Server"
  value       = aws_eip.app_ip.public_ip
}

output "storefront_url" {
  description = "Next.js Storefront URL"
  value       = "http://${aws_eip.app_ip.public_ip}:3000"
}

output "admin_portal_url" {
  description = "Murgdur Admin Portal URL"
  value       = "http://${aws_eip.app_ip.public_ip}:3000/admin"
}

output "backend_api_url" {
  description = "NestJS Backend API URL"
  value       = "http://${aws_eip.app_ip.public_ip}:3001"
}

output "cloudfront_cdn_url" {
  description = "Amazon CloudFront Media CDN Domain"
  value       = "https://${aws_cloudfront_distribution.media_cdn.domain_name}"
}

output "s3_bucket_name" {
  description = "Amazon S3 Media Bucket Name"
  value       = aws_s3_bucket.media.id
}

output "rds_postgres_endpoint" {
  description = "Amazon RDS PostgreSQL Database Endpoint"
  value       = aws_db_instance.postgres.endpoint
}

output "sqs_order_queue_url" {
  description = "Amazon SQS Order Queue URL"
  value       = aws_sqs_queue.orders.url
}

output "sqs_dlq_url" {
  description = "Amazon SQS Dead Letter Queue URL"
  value       = aws_sqs_queue.orders_dlq.url
}

output "sns_topic_arn" {
  description = "Amazon SNS Order Notifications Topic ARN"
  value       = aws_sns_topic.order_alerts.arn
}

output "cloudwatch_log_group" {
  description = "Amazon CloudWatch Log Group for application logs"
  value       = aws_cloudwatch_log_group.app_logs.name
}

output "ssm_database_url_parameter" {
  description = "SSM Parameter Store Key for Database Connection String"
  value       = aws_ssm_parameter.database_url.name
}

output "opensearch_endpoint" {
  description = "Amazon OpenSearch / Elasticsearch VPC Endpoint (if enabled)"
  value       = var.enable_opensearch ? "https://${aws_opensearch_domain.search[0].endpoint}" : "disabled (using PostgreSQL search fallback to preserve AWS credits)"
}
