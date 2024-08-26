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