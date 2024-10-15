#!/bin/bash
set -e

sudo useradd -m -s /usr/sbin/nologin csye6225
sudo groupadd csye6225
sudo usermod -aG csye6225 csye6225
# sudo mkdir -p /opt/csye6225/application
# sudo chown -R csye6225:csye6225 /opt/csye6225