#!/bin/bash
set -e

# Create systemd service file
cat << EOF | sudo tee /etc/systemd/system/webapp.service
[Unit]
Description=Web Application
After=network.target

[Service]
Type=simple
User=csye6225
Group=csye6225
EnvironmentFile=/opt/app/.env
WorkingDirectory=/opt/app
ExecStartPre=/bin/bash -c "while [ ! -f /opt/finish.txt ]; do sleep 1; done"
ExecStart=/usr/bin/node /opt/app/index.js
Restart=on-failure
RestartSec=3


[Install]
WantedBy=multi-user.target
EOF

# Reload systemd
sudo systemctl daemon-reload

# Enable the service
sudo systemctl enable webapp.service

# Start the service
sudo systemctl start webapp.service

# Check the status
sudo systemctl status webapp.service