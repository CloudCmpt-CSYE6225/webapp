#!/bin/bash
set -e

sudo systemctl enable mysql
sudo systemctl start mysql

sudo mysql -e "CREATE DATABASE IF NOT EXISTS webapp;"

# # Secure MySQL installation
# sudo mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'your_root_password';"
# sudo mysql -e "DELETE FROM mysql.user WHERE User='';"
# sudo mysql -e "DELETE FROM mysql.user WHERE User='root' AND Host NOT IN ('localhost', '127.0.0.1', '::1');"
# sudo mysql -e "DROP DATABASE IF EXISTS test;"
# sudo mysql -e "DELETE FROM mysql.db WHERE Db='test' OR Db='test\\_%';"
# sudo mysql -e "FLUSH PRIVILEGES;"

# # Create your application database and user
# sudo mysql -e "CREATE DATABASE IF NOT EXISTS your_app_database;"
# sudo mysql -e "CREATE USER 'your_app_user'@'localhost' IDENTIFIED BY 'your_app_password';"
# sudo mysql -e "GRANT ALL PRIVILEGES ON your_app_database.* TO 'your_app_user'@'localhost';"
# sudo mysql -e "FLUSH PRIVILEGES;"

# echo "MySQL setup completed."