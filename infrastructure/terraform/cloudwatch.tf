# ============================================================
# Amazon CloudWatch (Module 5: Monitoring & Alarms)
# 100% Free Tier (10 Alarms + 5 GB Log ingestion free)
# ============================================================

# ── CloudWatch Log Group ──────────────────────────────────────
resource "aws_cloudwatch_log_group" "app_logs" {
  name              = "/aws/ec2/${var.project_name}"
  retention_in_days = 7 # Automatically purges old logs to stay well within 5 GB Free Tier

  tags = {
    Name = "${var.project_name}-app-logs"
  }
}

# ── CloudWatch Alarm: EC2 High CPU Utilization (>80%) ─────────
resource "aws_cloudwatch_metric_alarm" "high_cpu" {
  alarm_name          = "${var.project_name}-high-cpu-alarm"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = 2
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = 300 # 5 minutes
  statistic           = "Average"
  threshold           = 80
  alarm_description   = "Triggered when EC2 CPU utilization exceeds 80% for 10 minutes"
  alarm_actions       = [aws_sns_topic.order_alerts.arn]

  dimensions = {
    InstanceId = aws_instance.app_server.id
  }

  tags = {
    Name = "${var.project_name}-high-cpu-alarm"
  }
}
