resource "aws_db_subnet_group" "ironlog" {
  name       = "ironlog-db-subnet-group"
  subnet_ids = data.aws_subnets.default.ids

  tags = {
    Name = "ironlog-db-subnet-group"
  }
}

resource "aws_db_instance" "ironlog" {
  identifier     = "ironlog-db"
  engine         = "postgres"
  instance_class = var.db_instance_class

  allocated_storage = 20
  storage_type      = "gp2"

  db_name  = var.db_name
  username = var.db_username
  password = var.db_password

  db_subnet_group_name   = aws_db_subnet_group.ironlog.name
  vpc_security_group_ids = [aws_security_group.rds.id]

  # Free-tier friendly: single-AZ, private, no backups retained.
  publicly_accessible     = false
  multi_az                = false
  backup_retention_period = 0
  skip_final_snapshot     = true
  apply_immediately       = true

  tags = {
    Name = "ironlog-db"
  }
}
