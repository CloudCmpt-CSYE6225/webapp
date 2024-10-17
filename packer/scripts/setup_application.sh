#!/bin/bash
set -e

# Create /opt/app directory if it doesn't exist
sudo mkdir -p /opt/app

# Navigate to the application directory
cd /opt/app

# Check if the artifact exists
if [ ! -f webapp-artifact.zip ]; then
    echo "Error: webapp-artifact.zip not found in /opt/app"
    ls -la /opt/app  # List directory contents for debugging
    exit 1
fi

echo "Unzipping application artifact..."
sudo unzip -o webapp-artifact.zip -d .

echo "Setting correct ownership..."
sudo chown -R csye6225:csye6225 .

# Check if .env file exists
if [ ! -f .env ]; then
    echo "Creating .env file..."
    sudo bash -c 'cat << EOF > /opt/app/.env
DB_HOST=${DB_HOST}
DB_USER=${DB_USER}
DB_PASS=${DB_PASS}
DB_DATABASE=${DB_DATABASE}
PORT=${PORT}
EOF'
    echo ".env file created"
else
    echo ".env file already exists, skipping creation."
fi

echo "Setting correct permissions for .env file..."
sudo chown csye6225:csye6225 .env
sudo chmod 644 .env
echo ".env file permissions set"

echo "Installing dependencies..."
sudo -u csye6225 npm install

echo "Application setup completed successfully."