# webapp

# Web Application

## Prerequisites
- **MySQL Server**
- **VSCode** (or any other IDE)

## Build and Deploy Instructions

1. **Clone the repository**:
    ```bash
    git clone <repository-url>
    ```

2. **Install dependencies**:
    ```bash
    npm i
    ```

3. **DB connection**:
    - **Create .env file and add db connection values**

4. **Run the application**:
    ```bash
    dev: npm run dev
    test: npm run test
    ```

## Digital Ocean setup commands
    ```bash
    apt install zip npm mysql-server
    scp -i ~<ssh identity filepath> <zip file path> root@ip:/tmp
    mysql_secure_installation
    sudo mysql
    CREATE DATABASE webapp;
    create new user and grant privileges
    Add env variables
    npm i
    npm run dev
    To start/stop sql : sudo service mysql stop
    ```

## Packer check and packer build workflows added, running packer build workflow creates AMI

testing build flow
