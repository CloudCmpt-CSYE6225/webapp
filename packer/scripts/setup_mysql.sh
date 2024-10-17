#!/bin/bash
set -e

sudo systemctl enable mysql
sudo systemctl start mysql
echo "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '$DB_PASS'; FLUSH PRIVILEGES; CREATE DATABASE webapp;" | sudo mysql