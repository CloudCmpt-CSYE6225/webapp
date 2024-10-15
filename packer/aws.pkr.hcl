packer {
  required_plugins {
    amazon = {
      version = ">=1.0.0, <2.0.0"
      source  = "github.com/hashicorp/amazon"
    }
  }
}

variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "source_ami" {
  type    = string
  default = "ami-0cad6ee50670e3d0e" //  Ubuntu 24.04 LTS AMI ID
}

variable "ssh_username" {
  type    = string
  default = "ubuntu"
}

variable "instance_type" {
  type    = string
  default = "t2.micro"
}

variable "app_name" {
  type    = string
  default = "csye6225-webapp"
}

variable "vpc_id" {
  type    = string
  default = "vpc-097dd3293fff54bf6" # default VPC ID
}

variable "subnet_id" {
  type    = string
  default = "subnet-00b9d631e15246aac" # subnet ID in my default VPC
}

variable "demo_account_id" {
  type    = string
  default = "913524908663"
}

variable "artifact_path" {
  type    = string
  default = "../webapp-artifact.zip"
}

source "amazon-ebs" "ubuntu" {
  ami_name      = "${var.app_name}-${formatdate("YYYY-MM-DD-hh-mm-ss", timestamp())}"
  instance_type = var.instance_type
  region        = var.aws_region
  source_ami    = var.source_ami
  ssh_username  = var.ssh_username
  vpc_id        = var.vpc_id
  subnet_id     = var.subnet_id

  ami_users = [var.demo_account_id]
  tags = {
    Name = "${var.app_name}-${formatdate("YYYY-MM-DD", timestamp())}"
  }

  launch_block_device_mappings {
    device_name           = "/dev/sda1"
    volume_size           = 25
    volume_type           = "gp2"
    delete_on_termination = true
  }
}

build {
  sources = ["source.amazon-ebs.ubuntu"]

  # provisioner "file" {
  #   source      = "./packer/scripts/"
  #   destination = "/tmp/scripts/"
  # }
  provisioner "shell" {
    inline = [
      "sudo mkdir -p /opt/app/",
      "sudo chown -R ubuntu:ubuntu /opt/app",
      "sudo chmod -R 755 /opt/app",
      # "sudo chmod +x /tmp/scripts/*.sh",
    ]
  }

  provisioner "file" {
    source      = var.artifact_path != "" ? var.artifact_path : null
    destination = "/opt/app/webapp-artifact.zip"
  }

  provisioner "shell" {
    pause_before = "10s"
    timeout      = "10m"
    script       = "packer/scripts/install_dependencies.sh"
  }

  provisioner "shell" {
    script = "packer/scripts/setup_mysql.sh"
  }

  provisioner "shell" {
    script = "packer/scripts/create_webapp_user.sh"
  }

  provisioner "shell" {
    script = "packer/scripts/setup_application.sh"
  }

  provisioner "shell" {
    script = "packer/scripts/setup_systemd_service.sh"
  }

  provisioner "shell" {
    script = "packer/scripts/cleanup.sh"
  }
}