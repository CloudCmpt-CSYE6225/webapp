#!/bin/bash
set -e

# Create csye6225 group if it doesn't exist
sudo groupadd -f csye6225

# Create csye6225 user with no login shell
sudo useradd -m -d /home/csye6225 -s /usr/sbin/nologin -g csye6225 csye6225

sudo mkdir -p /var/log/app/
sudo chown -R csye6225:csye6225 /opt/app/ /var/log/app/
sudo chown -R csye6225:csye6225 /etc/systemd/system/webapp.service
# sudo cp /tmp/webapp.service /etc/systemd/system/
sudo chmod 700 /opt/app/ /var/log/app/
sudo chmod 700 /etc/systemd/system/webapp.service
echo "csye6225 ALL=(ALL:ALL) NOPASSWD: /bin/systemctl" | sudo EDITOR='tee -a' visudo
