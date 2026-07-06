# EC2 security group: SSH from your IP only, HTTP open to the world.
resource "aws_security_group" "ec2" {
  name        = "ironlog-ec2-sg"
  description = "IronLog EC2 - SSH from my IP, HTTP from anywhere"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.my_ip]
  }

  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "ironlog-ec2-sg"
  }
}

# RDS security group: PostgreSQL reachable only from the EC2 security group.
resource "aws_security_group" "rds" {
  name        = "ironlog-rds-sg"
  description = "IronLog RDS - PostgreSQL from EC2 only"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    description     = "PostgreSQL from EC2"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.ec2.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "ironlog-rds-sg"
  }
}
