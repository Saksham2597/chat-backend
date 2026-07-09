# Real-Time Secure Chat API

A production-ready, real-time messaging backend architecture designed for low-latency communication and secure data persistence.

## Overview

This project provides a robust foundation for real-time chat applications, utilizing WebSockets for instant message broadcasting and a relational database for reliable state management. It is built to be scalable, secure, and easy to integrate into frontend applications.

## Tech Stack

1. Language: JavaScript (Node.js)
2. Framework: Express.js
3. Real-Time: Socket.IO
4. Database: PostgreSQL (via Prisma ORM)
5. Security: JWT (JSON Web Tokens), bcrypt

## Key Architecture

1. Real-Time Communication: Leverages Socket.IO to manage concurrent WebSocket connections, enabling instant message delivery across isolated rooms.
2. Data Persistence: Uses Prisma ORM with PostgreSQL to maintain persistent storage for user profiles, room states, and full message history.
3. Security & Authentication: Implements secure REST API endpoints with bcrypt password hashing and custom middleware for JWT validation, ensuring protected routes.

## Setup Instructions

1. Clone the repository:  
   `git clone <your-repo-url>`  
   `cd <project-name>`

2. Install dependencies:  
   `npm install`

3. Configure Environment Variables:  
   Create a .env file and add your database connection string and JWT secret:  
   `DATABASE_URL=your_postgresql_url`  
   `JWT_SECRET=your_secret_key`

4. Run the server:  
   `npm start`

## Future Improvements

1. Implement message pagination for better performance.
2. Add user presence indicators (online/offline status).
3. Integrate Redis for improved WebSocket scalability.
