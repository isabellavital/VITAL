require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use('/uploads', express.static('uploads'));

// Database Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => console.log('❌ MongoDB Error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/announcements', require('./routes/announcements'));
app.use('/api/events', require('./routes/events'));
app.use('/api/schedules', require('./routes/schedules'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/surveys', require('./routes/surveys'));
app.use('/api/resources', require('./routes/resources'));
app.use('/api/admin', require('./routes/admin'));

// Socket.io - Admin Chat
const adminSockets = {};

io.on('connection', (socket) => {
  console.log('🟢 New connection:', socket.id);

  socket.on('admin_join', (data) => {
    const { adminId, adminName } = data;
    adminSockets[adminId] = { socketId: socket.id, name: adminName };
    socket.join('admin_chat');
    io.to('admin_chat').emit('admin_list', adminSockets);
    io.to('admin_chat').emit('user_joined', { adminName, time: new Date() });
  });

  socket.on('send_message', (data) => {
    io.to('admin_chat').emit('receive_message', {
      adminName: data.adminName,
      message: data.message,
      timestamp: new Date(),
      adminId: data.adminId
    });
  });

  socket.on('typing', (data) => {
    socket.broadcast.to('admin_chat').emit('user_typing', {
      adminName: data.adminName,
      isTyping: true
    });
  });

  socket.on('stop_typing', (data) => {
    socket.broadcast.to('admin_chat').emit('user_typing', {
      adminName: data.adminName,
      isTyping: false
    });
  });

  socket.on('disconnect', () => {
    for (let adminId in adminSockets) {
      if (adminSockets[adminId].socketId === socket.id) {
        const adminName = adminSockets[adminId].name;
        delete adminSockets[adminId];
        io.to('admin_chat').emit('admin_list', adminSockets);
        io.to('admin_chat').emit('user_left', { adminName, time: new Date() });
        break;
      }
    }
    console.log('🔴 Disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

module.exports = { app, io };
