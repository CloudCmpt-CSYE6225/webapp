#!/bin/bash
set -e

cd /opt/app
sudo unzip webapp-artifact.zip
sudo chown -R csye6225:csye6225 artifact
cd artifact
sudo -u csye6225 npm install