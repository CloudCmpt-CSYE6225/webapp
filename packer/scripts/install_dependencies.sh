#!/bin/bash
set -e

sudo apt-get update
sudo DEBIAN_FRONTEND=noninteractive apt-get install -y nodejs npm unzip wget

#adding cloudwatch configuration
echo "CloudWatch Agent downloading..."
cd /tmp
wget https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb
sudo dpkg -i -E ./amazon-cloudwatch-agent.deb

echo "Cloudwatch agent downloaded successfully!!"

rm -f amazon-cloudwatch-agent.deb
sudo apt-get clean
sudo rm -rf /var/lib/apt/lists/*


