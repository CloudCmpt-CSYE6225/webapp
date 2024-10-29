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
ExecStart=/usr/bin/node /opt/app/index.js
Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal
SyslogIdentifier=webapp

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

# Enable and start CloudWatch agent
sudo systemctl enable amazon-cloudwatch-agent
sudo systemctl start amazon-cloudwatch-agent

# Verify CloudWatch agent status
sudo systemctl status amazon-cloudwatch-agent