# Configuration Guide for Chat App with Socket.io

## Introduction

This guide provides detailed instructions for configuring the Chat App with Socket.io. Follow these steps to set up your environment and configure necessary variables.

## Environment Variables

### Overview

The following environment variables need to be set up to configure the application correctly. These variables control various aspects of the app, such as server ports, database connections, and security settings.

### Variables

- **VITE_SOCKET_URL**:
  - **Description**: This is the server that your frontend will connect to for WebSocket communication or other similar server-side interactions.<br>
In development, VITE_SOCKET_URL points to http://localhost:3000, which is where your backend server is running locally.<br>
In production, you would typically set VITE_SOCKET_URL to the URL of your production server (e.g., https://api.yourdomain.com).
  - **Default**: `http://localhost:3000`
  - **Example**:
    ```plaintext
    VITE_SOCKET_URL=http://localhost:3000
    ```

- **PORT**:
  - **Description**: The port on which the backend server will run.
  - **Default**: `3000`
  - **Example**:
    ```plaintext
    PORT=3000
    ```

- **NODE_ENV**:
  - **Description**: This environment variable is used to indicate the environment in which your Node.js application is running. Common values include development, production, and test.
  - **Default**: `development`
  - **Example**:
    ```plaintext
    NODE_ENV=development
    ```

- **JWT_SECRET_KEY_1** and **JWT_SECRET_KEY_2**:
  - **Description**: Secret keys for JWT authentication. Used for signing and verifying tokens.<br>Updated the environment variables to include multiple secret keys.<br>
Rotating your JWT secret key in production is an important security measure that helps minimize risk.
This allows you to continue verifying tokens signed with the old key while moving forward with a new one.
  - **Example**:
    ```plaintext
    JWT_SECRET_KEY_1=my_current_secret_key
    JWT_SECRET_KEY_2=my_next_secret_key
    ```

- **CORS_ORIGIN_DEV**:
  - **Description**: This setting specifies which origins (i.e., which domains/ports) are allowed to make requests to your server during development.
Since your frontend is running on http://localhost:5173, this value allows requests from that origin to interact with your backend at http://localhost:3000.

  - **Example**:
    ```plaintext
    CORS_ORIGIN_DEV=http://localhost:5173
    ```

- **CORS_ORIGIN_PROD**:
  - **Description**: This setting is for the production environment, you would typically set this to the actual domain name where your frontend is hosted (e.g., https://yourdomain.com).
  - **Example**:
    ```plaintext
    CORS_ORIGIN_PROD=https://yourdomain.com
    ```

- **DB_HOST**:
  - **Description**: Database server address. This specifies the hostname or IP address of the database server. In this case, localhost indicates that the database is running on the same machine as your backend server. In a production environment, this might point to a remote database server.

  - **Default**: `localhost`
  - **Example**:
    ```plaintext
    DB_HOST=localhost
    ```

- **DB_USER**:
  - **Description**: This is the username used to connect to the database. Typically set up during the installation of MySQL.
  - **Example**:
    ```plaintext
    DB_USER=my_database_user
    ```

- **DB_PASSWORD**:
  - **Description**: This is the password for the database user specified in DB_USER.
You are usually prompted to set a password for the user during installation. 
  - **Example**:
    ```plaintext
    DB_PASSWORD=my_secure_password
    ```

- **DB_NAME**:
  - **Description**: This specifies the name of the database that your application will connect to,
means that your application will connect to the your_database_name database using the your_username account.

  - **Example**:
    ```plaintext
    DB_NAME=my_database
    ```

## Configuration Files

### `.env` File

 add the .env files to .gitignore to avoid committing sensitive information.

### Add .env file in the root of client folder looking like:

```js
VITE_SOCKET_URL=http://localhost:3000

```


### Add .env file in the root of  server folder looking like:

```js
# Server Configuration
PORT=3000
NODE_ENV=development

# JSON Web Token secret key
JWT_SECRET_KEY_1=your_current_secret_key
JWT_SECRET_KEY_2=your_next_secret_key

# CORS Configuration
CORS_ORIGIN_DEV=http://localhost:5173
CORS_ORIGIN_PROD=your_production_domain

# Database Configuration
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=your_database_name

```

## Setting Up MySQL

1. **Install MySQL**:
   - Follow the [official MySQL installation guide](https://dev.mysql.com/doc/mysql-installation-excerpt/8.0/en/) for your operating system.

2. **Create a Database**:
   - Log in to the MySQL command line:
     ```bash
     mysql -u root -p
     ```
   - Create a new database:
     ```sql
     CREATE DATABASE your_database_name;
     ```

3. **Create a Database User**:
   - Create a new user and grant privileges:
     ```sql
     CREATE USER 'your_username'@'localhost' IDENTIFIED BY 'your_password';
     GRANT ALL PRIVILEGES ON your_database_name.* TO 'your_username'@'localhost';
     FLUSH PRIVILEGES;
     ```

4. **Update Configuration**:
   - Update your `.env` file, if needed, with the database credentials:
     ```plaintext
     DB_HOST=localhost
     DB_USER=your_username
     DB_PASSWORD=your_password
     DB_NAME=your_database_name
     ```
## Setting Up the Database

### Creating the Database

1. **Log In to MySQL:**
   ```bash
   mysql -u root -p

2. Create a New Database:
```sql
CREATE DATABASE your_database_name;
```
   
3. Create Tables:
   
Create Tables for users, rooms and messages.<br> The app uses uuids so for the id use: CHAR(36),<br>
 and include foreign key `room_id` in messages table referencing to `id` key in rooms table.

 - in users include: id, username, email, password_hash fields.<br>
 - in rooms: id, name. <br>
 - in messages: id, room_id, username, message, sent_at. 
  
  Example:
```sql
CREATE TABLE messages (
  id CHAR(36) PRIMARY KEY,
  room_id CHAR(36) NOT NULL,
  username VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
);
```


## Common Issues and Troubleshooting

- **Issue: Socket Connection Errors**:
  - **Solution**: Ensure that the server is running on the correct port and that the client is configured with the correct WebSocket URL.

- **Issue: Database Connection Errors**:
  - **Solution**: Verify that your database credentials are correct and that the database server is accessible.

- **Issue: Missing Dependencies**:
  - **Solution**: Run `npm install` in both the client and server directories to ensure all dependencies are installed.
