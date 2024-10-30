#!/bin/bash
set -e

sudo apt-get update
sudo DEBIAN_FRONTEND=noninteractive apt-get install -y nodejs npm unzip wget

sudo apt-get clean
sudo rm -rf /var/lib/apt/lists/*


