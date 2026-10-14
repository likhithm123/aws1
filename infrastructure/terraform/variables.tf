variable "aws_region" {
  description = "AWS Region to deploy resources"
  type        = string
  default     = "ap-southeast-2"
}

variable "environment" {
  description = "Deployment environment name"
  type        = string
  default     = "production"
}

variable "project_name" {
  description = "Prefix name for all resources"
  type        = string
  default     = "murgdur"
}

variable "budget_alert_email" {
  description = "Email address for AWS Free Tier and $1 budget threshold alerts"
  type        = string
  default     = "admin@murgdur.com"
}

variable "db_username" {
  description = "Master username for RDS PostgreSQL"
  type        = string
  default     = "postgres"
}

variable "db_password" {
  description = "Master password for RDS PostgreSQL (minimum 8 characters)"
  type        = string
  sensitive   = true
  default     = "MurgdurSecure2026!"
}

variable "db_name" {
  description = "Database name for Murgdur"
  type        = string
  default     = "murgdurV2"
}

variable "ec2_instance_type" {
  description = "EC2 instance type eligible for AWS Free Tier (t3.micro or t2.micro)"
  type        = string
  default     = "t3.micro"
}

variable "ec2_key_name" {
  description = "Optional EC2 SSH Key Pair name (leave empty if using AWS Systems Manager Session Manager)"
  type        = string
  default     = ""
}

variable "app_repo_url" {
  description = "Git repository URL to clone on EC2 initialization"
  type        = string
  default     = "https://github.com/your-username/murgdur.git"
}

variable "enable_opensearch" {
  description = "Deploy managed Amazon OpenSearch cluster. Set to false (recommended for limited credits) to save ~$26/month. App will use PostgreSQL search fallback automatically."
  type        = bool
  default     = false
}

variable "monthly_budget_limit" {
  description = "Monthly AWS budget limit in USD to guard credit usage"
  type        = string
  default     = "10.00"
}
