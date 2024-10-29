#!/bin/bash
set -e

sudo apt-get update
sudo DEBIAN_FRONTEND=noninteractive apt-get install -y nodejs npm unzip

sudo apt-get clean
sudo rm -rf /var/lib/apt/lists/*

# Install and configure CloudWatch agent
log "Installing CloudWatch agent"
sudo apt-get install -y amazon-cloudwatch-agent
sudo systemctl enable amazon-cloudwatch-agent
