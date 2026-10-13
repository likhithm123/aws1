# AWS Cloud Production Deployment Guide

A complete, step-by-step guide to provisioning and deploying the **Murgdur Luxury Fashion E-Commerce Platform** on **Amazon Web Services (AWS)** from scratch.

---

## 1. Cloud Architecture Overview

The entire platform is hosted natively on AWS services:

| Layer | AWS Service | Purpose & Sizing | Free Tier Eligibility | Estimated Monthly Cost |
|---|---|---|---|---|
| **Compute** | **Amazon EC2** (`t3.small` or `t3.micro`) | Runs Docker Compose with Next.js frontend, NestJS backend, Postgres & Redis | 750 hrs/month free (`t3.micro`) | ~$3.60 (IPv4) or ~$14 (`t3.small`) |
| **Database** | **Docker PostgreSQL 16** (or RDS `db.t4g.micro`) | Containerized on EC2 for zero extra cost (or managed RDS) | 750 hrs/month free (RDS) | $0.00 (Docker) / $0 (RDS Free Tier) |
| **Search Engine** | **PostgreSQL Search Fallback** | Built into backend; replaces expensive OpenSearch | Always free | $0.00 |
| **Object Storage** | **Amazon S3** | Private bucket for product images, videos, logos, and invoices | 5 GB standard storage free | < $0.20 |
| **Content Delivery** | **Amazon CloudFront** | Global edge CDN caching and serving S3 media with OAC | 1 TB/month transfer free | $0.00 |
| **Networking** | **Amazon VPC** | Isolated VPC with Internet Gateway (no $32/mo NAT Gateways) | Always free | $0.00 |
| **Messaging** | **Amazon SQS & SNS** | Order processing queue and email notifications | 1,000,000 requests free | $0.00 |
| **Cost Protection** | **AWS Budgets** | Proactive alert triggered if monthly spend exceeds threshold | Free | $0.00 |

> [!IMPORTANT]
> **HOW TO MAKE 100 AWS CREDITS LAST 7 TO 20+ MONTHS:**
> - **Avoid OpenSearch**: Do NOT enable AWS OpenSearch. It costs ~$26/month after trial and burns 100 credits in 3 months! The backend seamlessly falls back to PostgreSQL full-text search at **$0 cost**.
> - **Avoid NAT Gateways & ALBs**: NAT Gateways cost $32/mo and ALBs cost $20/mo. This setup uses direct Internet Gateway routing.
> - **Run All-in-One Docker Stack**: `infrastructure/docker-compose.prod.yml` runs Frontend, Backend, PostgreSQL, and Redis in one place.
> - **Estimated Lifespan**: With EC2 `t3.micro` on Free Tier, total cost is ~$3.60/month (public IPv4 charge), lasting **~24 months**! With a dedicated `t3.small` (2GB RAM), total cost is ~$14/month, lasting **~7 months**!

---

## 2. Prerequisites

1. **AWS Account**: An active AWS account ([Create free account](https://aws.amazon.com/free/)).
2. **Local Tools**:
   - [AWS CLI v2](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) (`aws --version`)
   - [Terraform](https://developer.hashicorp.com/terraform/install) >= 1.5.0 (`terraform -version`)
   - [Git](https://git-scm.com/)

---

## 3. Step 1: AWS Credentials & Permissions

1. In the **AWS Console**, navigate to **IAM** → **Users** → **Create User** (e.g. `murgdur-deployer`).
2. Attach the `AdministratorAccess` policy (or equivalent policy covering VPC, EC2, RDS, S3, CloudFront, SQS, SNS, SSM, CloudWatch, Budgets).
3. Under **Security credentials**, click **Create access key** (Application running outside AWS).
4. Save your **Access Key ID** and **Secret Access Key**.
5. Configure your local environment:
   ```bash
   aws configure
   # AWS Access Key ID: <Your-Access-Key-ID>
   # AWS Secret Access Key: <Your-Secret-Access-Key>
   # Default region name: us-east-1
   # Default output format: json
   ```

---

## 4. Step 2: Provision Infrastructure with Terraform

All cloud infrastructure is declared in `infrastructure/terraform/`.

1. Navigate to the terraform directory:
   ```bash
   cd infrastructure/terraform
   ```

2. Copy the variable configuration file:
   ```bash
   cp terraform.tfvars.example terraform.tfvars
   ```

3. Edit `terraform.tfvars`:
   ```hcl
   aws_region         = "us-east-1"
   environment        = "production"
   project_name       = "murgdur"
   budget_alert_email = "your-email@example.com"      # Email for budget & order alerts
   db_username        = "postgres"
   db_password        = "YourStrongPassword2026!"     # Master password for RDS
   db_name            = "murgdurV2"
   ec2_instance_type  = "t3.micro"
   ec2_key_name       = ""                            # Leave empty to use SSM Session Manager or supply key pair
   ```

4. Initialize Terraform:
   ```bash
   terraform init
   ```

5. Review the execution plan:
   ```bash
   terraform plan
   ```

6. Apply and provision all AWS resources:
   ```bash
   terraform apply -auto-approve
   ```

7. **Save the Terraform Outputs**:
   Upon completion (~4-6 minutes for RDS creation), Terraform will print:
   - `ec2_public_ip`: Static Elastic IP for your server (e.g. `54.210.xx.xx`)
   - `rds_postgres_endpoint`: RDS endpoint (e.g. `murgdur-db.xxxx.us-east-1.rds.amazonaws.com:5432`)
   - `s3_bucket_name`: Private S3 media bucket (e.g. `murgdur-media-xxxx`)
   - `cloudfront_cdn_url`: CloudFront CDN URL (e.g. `https://d123456789.cloudfront.net`)
   - `opensearch_endpoint`: OpenSearch / Elasticsearch endpoint (e.g. `https://search-murgdur-xxxx.us-east-1.es.amazonaws.com`)
   - `sqs_order_queue_url`: SQS Queue URL
   - `sns_topic_arn`: SNS Topic ARN

---

## 5. Step 3: Deploy Application to EC2

1. **Connect to your EC2 instance**:
   - Using SSH (if you provided an EC2 key pair):
     ```bash
     ssh -i /path/to/key.pem ubuntu@<EC2_PUBLIC_IP>
     ```
   - OR using AWS Systems Manager Session Manager (no open SSH ports needed):
     ```bash
     aws ssm start-session --target <EC2_INSTANCE_ID>
     ```

2. **Clone the code on EC2**:
   ```bash
   cd /home/ubuntu
   git clone <YOUR_GIT_REPOSITORY_URL> app
   cd app
   ```

3. **Create the Production Environment File (`.env`)**:
   Create `/home/ubuntu/app/.env` with your AWS details:

   ```env
   # ── Database & Cache ──────────────────────────────────────────
   DATABASE_URL="postgresql://postgres:YourStrongPassword2026!@<RDS_ENDPOINT>/murgdurV2?schema=public"
   REDIS_URL="redis://redis:6379"

   # ── Authentication ───────────────────────────────────────────
   JWT_SECRET="generate-with-openssl-rand-hex-32"
   JWT_REFRESH_SECRET="generate-different-hex-32"
   NEXTAUTH_SECRET="generate-different-hex-32"
   NEXTAUTH_URL="http://<EC2_PUBLIC_IP>:3000"

   # ── AWS S3 & CloudFront ───────────────────────────────────────
   AWS_REGION="us-east-1"
   AWS_S3_BUCKET="<S3_BUCKET_NAME_FROM_TERRAFORM>"
   AWS_CLOUDFRONT_DOMAIN="<CLOUDFRONT_CDN_URL_FROM_TERRAFORM>"
   AWS_ACCESS_KEY_ID=""
   AWS_SECRET_ACCESS_KEY=""
   # Note: Since the EC2 instance profile has full S3/SQS/SNS IAM permissions,
   # leaving AWS keys blank automatically uses IAM Task/Role credentials!

   # ── AWS SQS & SNS ─────────────────────────────────────────────
   AWS_SQS_ORDER_QUEUE_URL="<SQS_QUEUE_URL_FROM_TERRAFORM>"
   AWS_SNS_TOPIC_ARN="<SNS_TOPIC_ARN_FROM_TERRAFORM>"

   # ── Amazon OpenSearch / Elasticsearch ─────────────────────────
   AWS_OPENSEARCH_ENDPOINT="<OPENSEARCH_ENDPOINT_FROM_TERRAFORM>"

   # ── App URLs & Endpoints ─────────────────────────────────────
   PORT=3001
   NODE_ENV=production
   FRONTEND_URL="http://<EC2_PUBLIC_IP>:3000"
   NEXT_PUBLIC_API_URL="http://<EC2_PUBLIC_IP>:3001"
   INTERNAL_API_URL="http://backend:3001"
   NEXT_PUBLIC_CDN_URL="<CLOUDFRONT_CDN_URL_FROM_TERRAFORM>"
   NEXT_PUBLIC_SITE_URL="http://<EC2_PUBLIC_IP>:3000"

   # ── Admin Account Creation ────────────────────────────────────
   ADMIN_EMAIL="admin@murgdur.com"
   ADMIN_PASSWORD="YourSecureAdminPassword123!"

   # ── Email Service (Optional SMTP) ────────────────────────────
   SMTP_HOST="smtp.gmail.com"
   SMTP_PORT=587
   SMTP_USER=""
   SMTP_PASS=""
   ```

---

## 6. Step 4: Initialize the Clean Database & Admin Login

The repository contains a fresh, pristine initial migration (`0_init/migration.sql`) and clean seed script (`seed.js`).

1. **Deploy all database tables**:
   ```bash
   cd /home/ubuntu/app/backend
   npx prisma migrate deploy
   ```
   *This creates all PostgreSQL tables, relations, constraints, and indexes cleanly on RDS.*

2. **Seed Admin Login and Initial Store Configuration**:
   ```bash
   node prisma/seed.js
   ```
   *This creates:*
   - **Admin Account**: `admin@murgdur.com` with your `ADMIN_PASSWORD` and `ADMIN` role.
   - **Site Configuration**: Base theme, luxury gold accents, WhatsApp concierge settings, and brand defaults.
   - **Base Category Containers**: Men, Women, Bags, Watches, Collections, New Arrivals.
   - **0 Fake Products**: The product catalog is 100% blank.

---

## 7. Step 5: Start the Platform via Docker Compose

Run the production stack in the background:
```bash
cd /home/ubuntu/app
docker compose -f infrastructure/docker-compose.prod.yml --env-file .env up -d --build
```

Verify that all containers are healthy:
```bash
docker compose -f infrastructure/docker-compose.prod.yml ps
```

Expected status:
```
NAME                 IMAGE                     STATUS
murgdur-backend      murgdur-backend:latest    Up (healthy)
murgdur-frontend     murgdur-frontend:latest   Up
murgdur-redis        redis:7-alpine            Up (healthy)
```

---

## 8. Step 6: Accessing Your New Website & Admin Portal

1. **Customer Storefront**:
   - Visit: `http://<EC2_PUBLIC_IP>:3000`
   - Shows the clean luxury storefront ready for your new collections.

2. **Admin Portal**:
   - Visit: `http://<EC2_PUBLIC_IP>:3000/login` or `http://<EC2_PUBLIC_IP>:3000/admin`
   - **Email**: `admin@murgdur.com`
   - **Password**: `YourSecureAdminPassword123!` (or `Admin@123`)

3. **Managing Your Store**:
   - In `/admin/catalog`: Click **Add Product** to create your first real item.
   - Uploading product images automatically:
     1. Compresses and generates `hero` (1200px), `medium` (800px), and `thumb` (400px) `.webp` files.
     2. Uploads them to your private **Amazon S3** bucket.
     3. Serves them globally through your **Amazon CloudFront** CDN.
   - In `/admin/homepage`: Configure hero banners, slides, and editorial sections.
   - In `/admin/theme`: Adjust brand colors, typography, and WhatsApp concierge phone numbers.

---

## 9. Step 7: Custom Domain & HTTPS Setup (Optional)

When you are ready to point your custom domain (e.g. `murgdur.com`):

1. **Amazon Route 53 or DNS Provider**:
   - Create an **A Record** pointing `murgdur.com` and `api.murgdur.com` to your `EC2_PUBLIC_IP`.
   - Create a **CNAME Record** for `media.murgdur.com` pointing to `<CLOUDFRONT_DOMAIN_NAME>`.
2. **AWS Certificate Manager (ACM)**:
   - Request a free public wildcard SSL certificate in `us-east-1` for `*.murgdur.com` and `murgdur.com`.
   - Attach the ACM certificate to your CloudFront distribution for `media.murgdur.com`.
3. **Nginx / Reverse Proxy with SSL on EC2**:
   - Install Certbot on EC2:
     ```bash
     sudo apt-get install -y certbot python3-certbot-nginx
     sudo certbot --nginx -d murgdur.com -d api.murgdur.com
     ```
   - Update `FRONTEND_URL`, `NEXTAUTH_URL`, and `NEXT_PUBLIC_API_URL` in `.env` to `https://murgdur.com`.

---

## 10. Cost Optimization & Monitoring

- **AWS Free Tier Protection**:
  - The Terraform configuration automatically provisioned an **AWS Budget** alert notifying you at `$1.00` spend.
  - S3 lifecycle policies automatically transition invoice PDFs to Amazon Glacier after 90 days and delete temporary uploads after 30 days.
  - CloudWatch logs are configured with a 7-day retention period to stay within the 5 GB free tier limit.
- **Teardown (If ever needed)**:
  ```bash
  cd infrastructure/terraform
  terraform destroy -auto-approve
  ```
