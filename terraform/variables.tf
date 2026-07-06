variable "region" {
  description = "AWS region for all resources"
  type        = string
  default     = "us-east-1"
}

variable "aws_profile" {
  description = "AWS CLI profile to authenticate with"
  type        = string
  default     = "ironlog-admin"
}

variable "key_name" {
  description = "Name of an existing EC2 key pair for SSH access"
  type        = string
  default     = "ironlog-key"
}

variable "my_ip" {
  description = "Your public IP in CIDR notation for SSH access, e.g. 203.0.113.4/32"
  type        = string

  validation {
    condition     = can(regex("^([0-9]{1,3}\\.){3}[0-9]{1,3}/[0-9]{1,2}$", var.my_ip))
    error_message = "my_ip must be in CIDR notation, e.g. 203.0.113.4/32 (run 'curl ifconfig.me' to find your IP, then append /32)."
  }
}

variable "instance_type" {
  description = "EC2 instance type (free tier: t2.micro or t3.micro)"
  type        = string
  default     = "t2.micro"
}

variable "db_instance_class" {
  description = "RDS instance class (free tier: db.t3.micro)"
  type        = string
  default     = "db.t3.micro"
}

variable "db_name" {
  description = "Initial PostgreSQL database name"
  type        = string
  default     = "ironlog"
}

variable "db_username" {
  description = "RDS master username"
  type        = string
  default     = "ironlog_admin"
}

variable "db_password" {
  description = "RDS master password (set in terraform.tfvars, never commit it)"
  type        = string
  sensitive   = true

  validation {
    condition     = can(regex("^[A-Za-z0-9]{8,}$", var.db_password))
    error_message = "db_password must be at least 8 characters, letters and numbers only (no @ : / \" or spaces, which break the connection URL)."
  }
}

variable "repo_url" {
  description = "GitHub repo to clone and deploy on the instance"
  type        = string
  default     = "https://github.com/devsb123/Very-Basic-Workout-Tracker-app.git"
}
