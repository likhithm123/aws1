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

# ── RDS PostgreSQL Instance ───────────────────────────────────
resource "aws_db_instance" "postgres" {
  identifier        = "${var.project_name}-postgres"
  engine            = "postgres"
  engine_version    = "16.3"
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

  backup_retention_period   = 7 # Free backup storage up to 20 GB included
  deletion_protection       = false
  skip_final_snapshot       = true
  auto_minor_version_upgrade = true

  tags = {
    Name = "${var.project_name}-postgres-rds"
  }
}
