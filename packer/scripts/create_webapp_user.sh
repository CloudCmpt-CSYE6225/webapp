#!/bin/bash
set -e

sudo useradd -m -s /usr/sbin/nologin csye6225
if ! getent group csye6225 > /dev/null 2>&1; then
  sudo groupadd csye6225
fi

sudo usermod -aG csye6225 csye6225
