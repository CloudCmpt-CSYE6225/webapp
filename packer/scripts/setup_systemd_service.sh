#!/bin/bash
set -e

cat << EOF | sudo tee /etc/systemd/system/csye6225.service
[Unit]
Description=CSYE6225 Web Application
After=network.target

[Service]
User=csye6225
WorkingDirectory=/opt/app/artifact
ExecStart=/usr/bin/node /opt/app/artifact/dist/index.js
Restart=always

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable csye6225.service
