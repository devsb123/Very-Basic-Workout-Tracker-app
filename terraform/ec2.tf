resource "aws_instance" "ironlog" {
  ami                         = data.aws_ami.al2023.id
  instance_type               = var.instance_type
  key_name                    = var.key_name
  subnet_id                   = data.aws_subnets.default.ids[0]
  vpc_security_group_ids      = [aws_security_group.ec2.id]
  associate_public_ip_address = true

  user_data = templatefile("${path.module}/user_data.sh.tpl", {
    repo_url    = var.repo_url
    db_username = var.db_username
    db_password = var.db_password
    db_endpoint = aws_db_instance.ironlog.endpoint
    db_name     = var.db_name
  })

  root_block_device {
    volume_size = 8
    volume_type = "gp3"
  }

  tags = {
    Name = "ironlog-server"
  }

  # The instance boots the app against RDS, so RDS must exist first.
  depends_on = [aws_db_instance.ironlog]
}
