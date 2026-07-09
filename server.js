require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const server = http.createServer(app);
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

app.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ 
      data: { email, password: hashedPassword } 
    });
    res.status(201).json({ message: "User created", userId: user.id });
  } catch (error) {
    res.status(400).json({ error: "User already exists" });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: "Missing email or password" });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid password" });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET);
    res.json({ token, userId: user.id });
  } catch (error) {
    console.error("CRASH LOG:", error.message);
    res.status(500).json({ error: "Login failed - check terminal" });
  }
});

app.post('/rooms', async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: "Room name is required" });
    }

    const room = await prisma.room.create({ 
      data: { name } 
    });
    
    res.status(201).json(room);
  } catch (error) {
    console.error("Room creation error:", error);
    res.status(400).json({ error: "Could not create room. It might already exist." });
  }
});

const io = new Server(server, { cors: { origin: "*", methods: ["GET", "POST"] } });

io.use((socket, next) => {
  let token = socket.handshake.auth.token || socket.handshake.headers.authorization || socket.handshake.query.token;

  if (token && token.startsWith('Bearer ')) {
    token = token.split(' ')[1];
  }

  if (!token) return next(new Error("Token missing"));
  
  try {
    socket.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    return next(new Error("Invalid token"));
  }
});
io.on('connection', (socket) => {
  socket.on('join_room', (roomId) => {
    socket.join(roomId);
  });

  socket.on('send_message', async (data) => {
    const { roomId, content } = data;
    try {
      const savedMessage = await prisma.message.create({
        data: { content, senderId: socket.user.id, roomId },
        include: { sender: { select: { email: true } } }
      });
      io.to(roomId).emit('receive_message', savedMessage);
    } catch (error) {
      console.error(error);
    }
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});