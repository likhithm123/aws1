# ============================================================
# Amazon RDS PostgreSQL 16 (Module 4 — 100% Free Tier)
# ============================================================

# ── RDS Subnet Group (Multi-AZ Network Footprint) ─────────────
resource "aws_db_subnet_group" "rds" {
  name       = "${var.project_name}-db-subnet-group"
  subnet_ids = [aws_subnet.db_1.id, aws_subnet.db_2.id]

  tags = {
    Name = "${var.project_name}-db-subnet-group"
  }
}

# ── Supported PostgreSQL 16 Version in Region ────────────────
data "aws_rds_engine_version" "postgres" {
  engine             = "postgres"
  preferred_versions = ["16.4", "16.2", "16.1"]
}

# ── RDS PostgreSQL Instance ───────────────────────────────────
resource "aws_db_instance" "postgres" {
  identifier        = "${var.project_name}-postgres"
  engine            = "postgres"
  engine_version    = data.aws_rds_engine_version.postgres.version
  instance_class    = "db.t3.micro" # 750 hrs/month Free Tier eligible

  allocated_storage = 20           # 20 GB Free Tier limit
  max_allocated_storage = 20       # Prevents automatic scaling beyond Free Tier
  storage_type      = "gp3"

  db_name  = var.db_name
  username = var.db_username
  password = var.db_password
  port     = 5432

  db_subnet_group_name   = aws_db_subnet_group.rds.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  publicly_accessible    = false

  # High Availability note: Multi-AZ is covered conceptually in Module 4;
  # for strict 100% Free Tier usage, Multi-AZ is disabled (single-AZ).
  multi_az = false

  backup_retention_period   = 0 # 0 avoids FreeTierRestrictionError on Free Tier accounts
  deletion_protection       = false
  skip_final_snapshot       = true
  auto_minor_version_upgrade = true

  tags = {
    Name = "${var.project_name}-postgres-rds"
  }
}

# ── RDS to S3 Bucket Link (IAM Role & Association for S3 Import/Export) ──
resource "aws_iam_role" "rds_s3_role" {
  name = "${var.project_name}-rds-s3-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "rds.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name = "${var.project_name}-rds-s3-role"
  }
}

resource "aws_iam_role_policy" "rds_s3_policy" {
  name = "${var.project_name}-rds-s3-policy"
  role = aws_iam_role.rds_s3_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:ListBucket",
          "s3:AbortMultipartUpload"
        ]
        Resource = [
          aws_s3_bucket.media.arn,
          "${aws_s3_bucket.media.arn}/*"
        ]
      }
    ]
  })
}

resource "aws_db_instance_role_association" "rds_s3_export" {
  db_instance_identifier = aws_db_instance.postgres.identifier
  feature_name           = "s3Export"
  role_arn               = aws_iam_role.rds_s3_role.arn
}

resource "aws_db_instance_role_association" "rds_s3_import" {
  db_instance_identifier = aws_db_instance.postgres.identifier
  feature_name           = "s3Import"
  role_arn               = aws_iam_role.rds_s3_role.arn
}
