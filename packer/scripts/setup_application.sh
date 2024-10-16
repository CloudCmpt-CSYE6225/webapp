#!/bin/bash
set -e

cd /opt/app
sudo unzip -0 webapp-artifact.zip -d .
sudo rm -rf packer
sudo chown -R csye6225:csye6225 .
sudo -u csye6225 npm install