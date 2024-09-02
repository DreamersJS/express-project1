# Chat App with Socket.io

#### (in development)

### Description

Chat App with Socket.io is a dynamic, real-time messaging platform designed to facilitate seamless communication and collaboration. Built using modern web technologies, it supports live chat functionality and user interactions in various chat rooms.

### Features

1. Real-Time Messaging:
   
- Uses Socket.io for real-time, bidirectional communication between clients and the server.
- Messages are instantly broadcasted to all users in the same chat room.

2. User Authentication:

- Express.js handles user authentication with jsonwebtoken for secure token-based sessions.
- Users can log in and see their username displayed in the chat interface.
- On logout, user tokens are cleared, and feedback messages are provided.
  
3. Room Management:
   
- Users can join different chat rooms and send messages within them.
- The application supports multiple rooms with real-time updates and notifications.
  
<!-- 4. Typing Indicators:
   
- The application shows typing indicators to let users know when someone is typing a message. -->
  
4. Feedback System:
   
- Provides visual feedback for various actions (e.g., joining a room, sending a message, or logging out).
  

### Technologies used


- **JavaScript**
- **React**: For building the user interface, managing state, and handling component lifecycle.
- **Vite**:  For fast development and build tooling.
- **HTML & CSS**: For structuring and styling the application.
- **Express.js**:  For server-side logic and API handling.
- **Socket.io**: For real-time, bidirectional communication between clients and server.
- **Bcrypt**: For hashing passwords.
- **MySQL**: For database management.
- **ViteProxy**: To avoid CORS issues entirely during development by making it seem like the frontend and backend are served from the same origin.
- **CORS**: For production ensures that only allowed origins can access your API.
- **jsonwebtoken**: For managing user authentication tokens.
- **git**: For version control.


### Creators

- Zvezda Neycheva - [@DreamersJS](https://github.com/DreamersJS)


### Instalation

To install dependencies for both the client and server, run the following command in the respective root directories:

```bash
npm install
```
### Add .env file in client folder looking like:

```
VITE_SOCKET_URL=http://localhost:3000

```
This is the server that your frontend will connect to for WebSocket communication or other similar server-side interactions.

### Add .env file in server folder looking like:

```
# Server Configuration
PORT=3000
NODE_ENV=development

# JWT Secret
JWT_SECRET=your_jwt_secret_key

# CORS Configuration
CORS_ORIGIN_DEV=http://localhost:5173
CORS_ORIGIN_PROD=your_production_domain

# Database Configuration
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=your_database_name

```
PORT=3000:

This specifies the port number on which your backend server will run. 

NODE_ENV=development:

This environment variable is used to indicate the environment in which your Node.js application is running. Common values include development, production, and test.

JWT_SECRET:

This is the secret key used to sign and verify JSON Web Tokens (JWT). JWTs are used for authentication and secure communication between the client and server.
It’s crucial that this key is kept secure and not shared, as it is the cornerstone of your token's security. In a production environment, this key should be more complex and stored securely.

CORS_ORIGIN_DEV:

This setting specifies which origins (i.e., which domains/ports) are allowed to make requests to your server during development.
Since your frontend is running on http://localhost:5173, this value allows requests from that origin to interact with your backend at http://localhost:3000.
CORS_ORIGIN_PROD:
This setting is for the production environment, you would typically set this to the actual domain name where your frontend is hosted (e.g., https://yourdomain.com).

DB_HOST:

This specifies the hostname or IP address of the database server. In this case, localhost indicates that the database is running on the same machine as your backend server. In a production environment, this might point to a remote database server.

DB_USER:

This is the username used to connect to the database. Typically set up during the installation of MySQL.

DB_PASSWORD:

This is the password for the database user specified in DB_USER.
You are usually prompted to set a password for the user during installation. 

DB_NAME:

This specifies the name of the database that your application will connect to,
means that your application will connect to the your_database_name database using the your_username account.



### Run the application


1. Start the Client (Front-End)

Navigate to the client directory and start the development server:
```bash
npm run dev

```
Open your browser and go to http://localhost:5173 (or whichever port is specified by Vite).

2. Start the Server (Back-End)
   
   Start the server by navigating to the *server* directory and running:

```bash
npm start

```

### Known Issues

- Socket Connection Errors: There might be issues with WebSocket connections or configurations, leading to interruptions.