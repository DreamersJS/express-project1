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
 
4. Feedback System:
   
- Provides visual feedback for various actions (e.g., joining a room, errors, or logging out).
  
5. UpdateUser Component:
   
- Allows profile updates with checks for changes before submission. 
  
6. Code Splitting with Suspense and Lazy: 
   
- Enhances user experience by improving load times using React's Suspense and lazy.
  
7. Database Management:
- Rooms and messages are now stored in MySQL.


### Technologies used


- **JavaScript & React**: For building a dynamic user interface and managing front-end logic.
- **React Router & Context API**:  For efficient navigation and global state managemen
- **Vite**:  Fast development tooling.
- **HTML & CSS**: For structuring and styling.
- **Express.js**:  For server-side logic and API handling.
- **Socket.io**: For real-time communication.
- **Bcrypt**: For hashing passwords.
- **MySQL**: For database management.
- **ViteProxy**: To avoid CORS issues during development.
- **CORS**: For production ensures that only allowed origins can access your API.
- **jsonwebtoken**: For managing user authentication tokens.
- **git**: For version control.

### Code Architecture

  **Client-Side Components:**
- The client is divided into service and src folders, with reusable components like Login, RoomForm, UpdateUser, and custom hooks like useRoom, useMessages, and useSocketConnection.
  
 **Backend Architecture:**
- The backend contains essential files like server.js for server logic, db.js for database connections, and userRoutes.js for managing endpoints.

### Creators

- Zvezda Neycheva - [@DreamersJS](https://github.com/DreamersJS)


### Installation

1. **Install Dependencies**:
   
To install dependencies for both the client and server, run the following command in the respective root directories:

```bash
npm install
```
2. **Environment Variables**:
      - Follow the instructions in the [Configuration Guide](./CONFIGURATION_GUIDE.md) to set up environment variables.



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