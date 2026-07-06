output "ec2_public_ip" {
  description = "Public IP of the IronLog EC2 instance"
  value       = aws_instance.ironlog.public_ip
}

output "app_url" {
  description = "Open this in a browser once the instance finishes booting (~3-5 min)"
  value       = "http://${aws_instance.ironlog.public_ip}"
}

output "rds_endpoint" {
  description = "RDS PostgreSQL endpoint (host:port)"
  value       = aws_db_instance.ironlog.endpoint
}

output "ssh_command" {
  description = "Command to SSH into the instance"
  value       = "ssh -i ~/.ssh/${var.key_name}.pem ec2-user@${aws_instance.ironlog.public_ip}"
}
