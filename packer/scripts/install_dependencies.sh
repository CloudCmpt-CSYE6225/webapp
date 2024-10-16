#!/bin/bash
set -e

sudo apt-get update
sudo apt-get install -y nodejs npm mysql-server unzip
sudo DEBIAN_FRONTEND=noninteractive apt-get install -y apt-utils dialog
echo 'debconf debconf/frontend select Noninteractive' | sudo debconf-set-selections

