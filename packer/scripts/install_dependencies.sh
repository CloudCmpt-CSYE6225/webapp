#!/bin/bash
set -e

sudo apt-get update
sudo DEBIAN_FRONTEND=noninteractive apt-get install -y nodejs npm unzip

#adding cloudwatch configuration
echo "CloudWatch Agent downloading..."
cd
ls 
wget https://s3.amazonaws.com/amazoncloudwatch-agent/amazon_linux/amd64/latest/amazon-cloudwatch-agent.rpm
sudo rpm -U ./amazon-cloudwatch-agent.rpm
echo "Cloudwatch agent downloaded successfully!!"


sudo apt-get clean
sudo rm -rf /var/lib/apt/lists/*


