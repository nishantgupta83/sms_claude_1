/*
VERSION 1.0 CLAUDE -- DIDN't work

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Store connected devices and messages
const connectedDevices = new Map();
const messageHistory = [];

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// API Routes
app.get('/api/messages', (req, res) => {
  res.json(messageHistory.slice(-100)); // Last 100 messages
});

app.get('/api/devices', (req, res) => {
  const devices = Array.from(connectedDevices.values()).map(device => ({
    id: device.id,
    name: device.name,
    connected: device.connected,
    lastSeen: device.lastSeen
  }));
  res.json(devices);
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`Device connected: ${socket.id}`);

  // Device registration
  socket.on('register-device', (deviceInfo) => {
    const device = {
      id: socket.id,
      socketId: socket.id,
      name: deviceInfo.name || 'iPhone',
      type: deviceInfo.type || 'child',
      connected: true,
      lastSeen: new Date().toISOString()
    };
    
    connectedDevices.set(socket.id, device);
    console.log(`Device registered: ${device.name} (${device.type})`);
    
    // Notify all clients about device status
    io.emit('device-status', {
      deviceId: device.id,
      status: 'connected',
      device: device
    });
  });

  // Handle SMS messages from child device
  socket.on('sms-received', (data) => {
    const message = {
      id: Date.now().toString(),
      from: data.from || 'Unknown',
      to: data.to || 'iPhone',
      content: data.content || '',
      timestamp: new Date().toISOString(),
      direction: 'received',
      deviceId: socket.id
    };

    messageHistory.push(message);
    console.log(`SMS received from ${message.from}: ${message.content}`);

    // Broadcast to all connected dashboards
    io.emit('new-message', message);
  });

  // Handle SMS sending from dashboard
  socket.on('send-sms', (data) => {
    const message = {
      id: Date.now().toString(),
      from: 'Dashboard',
      to: data.to || '',
      content: data.content || '',
      timestamp: new Date().toISOString(),
      direction: 'sent',
      deviceId: data.targetDevice || socket.id
    };

    messageHistory.push(message);
    console.log(`SMS send request to ${message.to}: ${message.content}`);

    // Send to specific device or broadcast to all child devices
    if (data.targetDevice) {
      socket.to(data.targetDevice).emit('send-sms-to-device', message);
    } else {
      // Send to all child devices
      connectedDevices.forEach((device, deviceId) => {
        if (device.type === 'child') {
          socket.to(deviceId).emit('send-sms-to-device', message);
        }
      });
    }

    // Broadcast to dashboards
    io.emit('new-message', message);
  });

  // Handle heartbeat
  socket.on('heartbeat', () => {
    const device = connectedDevices.get(socket.id);
    if (device) {
      device.lastSeen = new Date().toISOString();
      connectedDevices.set(socket.id, device);
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`Device disconnected: ${socket.id}`);
    
    const device = connectedDevices.get(socket.id);
    if (device) {
      device.connected = false;
      device.lastSeen = new Date().toISOString();
      connectedDevices.set(socket.id, device);

      // Notify all clients about device status
      io.emit('device-status', {
        deviceId: device.id,
        status: 'disconnected',
        device: device
      });
    }
  });
});

// Cleanup disconnected devices periodically
setInterval(() => {
  const now = new Date();
  connectedDevices.forEach((device, deviceId) => {
    const lastSeen = new Date(device.lastSeen);
    const timeDiff = now - lastSeen;
    
    // Remove devices not seen for more than 5 minutes
    if (timeDiff > 5 * 60 * 1000) {
      connectedDevices.delete(deviceId);
      console.log(`Cleaned up stale device: ${device.name}`);
    }
  });
}, 60000); // Check every minute

server.listen(PORT, () => {
  console.log(`🚀 SMS Mirror Server running on port ${PORT}`);
  console.log(`📱 Child device URL: http://localhost:${PORT}`);
  console.log(`💻 Parent dashboard: http://localhost:${PORT}/dashboard`);
  console.log(`🌐 Network access: http://[YOUR_IP]:${PORT}`);
});
*/


/*  VERSION 2.0
 PREPLIXITY with open port 
 
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Store connected devices and messages
const connectedDevices = new Map();
const messageHistory = [];

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/dashboard.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.get('/api/messages', (req, res) => {
  res.json(messageHistory);
});

app.get('/api/devices', (req, res) => {
  const devices = Array.from(connectedDevices.values());
  res.json(devices);
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Device registration
  socket.on('register-device', (deviceInfo) => {
    const device = {
      id: socket.id,
      ...deviceInfo,
      connected: true,
      lastSeen: new Date()
    };
    connectedDevices.set(socket.id, device);
    
    // Notify all dashboards about new device
    socket.broadcast.emit('device-connected', device);
    console.log('Device registered:', device.name || device.type);
  });

  // Handle incoming SMS
  socket.on('sms-received', (smsData) => {
    const message = {
      id: Date.now() + Math.random(),
      ...smsData,
      timestamp: new Date(),
      deviceId: socket.id
    };
    
    messageHistory.push(message);
    
    // Keep only last 1000 messages
    if (messageHistory.length > 1000) {
      messageHistory.shift();
    }
    
    // Broadcast to all connected dashboards
    io.emit('new-message', message);
    console.log('SMS received:', message.from, message.text.substring(0, 50));
  });

  // Handle message sending
  socket.on('send-message', (messageData) => {
    // Find target device
    const targetDevice = connectedDevices.get(messageData.deviceId);
    if (targetDevice) {
      // Send to specific device
      socket.to(messageData.deviceId).emit('send-sms', {
        to: messageData.to,
        text: messageData.text
      });
      console.log('Message sent to device:', targetDevice.name);
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    const device = connectedDevices.get(socket.id);
    if (device) {
      device.connected = false;
      device.lastSeen = new Date();
      
      // Notify dashboards about disconnection
      socket.broadcast.emit('device-disconnected', device);
      console.log('Device disconnected:', device.name || socket.id);
    }
    connectedDevices.delete(socket.id);
  });

  // Heartbeat
  socket.on('heartbeat', () => {
    const device = connectedDevices.get(socket.id);
    if (device) {
      device.lastSeen = new Date();
    }
  });
});

// Start server
const PORT = process.env.PORT || 3001;
const host = '0.0.0.0'; // Listen on all network interfaces
// This allows connections from other devices on the same network
app.listen(port, host, function() {
    console.log(`Server running on all interfaces:${port}`);
    console.log(`Local access: http://localhost:${port}`);
    console.log(`Network access: http://[YOUR-IP-ADDRESS]:${port}`);
});
*/

/*    VERSION 3.0 chapgtp to fix the PORT issue */

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const HOST = '0.0.0.0'; // Accept connections from any network interface

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Store connected devices and messages
const connectedDevices = new Map();
const messageHistory = [];

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/dashboard.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.get('/api/messages', (req, res) => {
  res.json(messageHistory);
});

app.get('/api/devices', (req, res) => {
  const devices = Array.from(connectedDevices.values());
  res.json(devices);
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('register-device', (deviceInfo) => {
    const device = {
      id: socket.id,
      ...deviceInfo,
      connected: true,
      lastSeen: new Date()
    };
    connectedDevices.set(socket.id, device);
    socket.broadcast.emit('device-connected', device);
    console.log('Device registered:', device.name || device.type);
  });

  socket.on('sms-received', (smsData) => {
    const message = {
      id: Date.now() + Math.random(),
      ...smsData,
      timestamp: new Date(),
      deviceId: socket.id
    };

    messageHistory.push(message);
    if (messageHistory.length > 1000) messageHistory.shift();

    io.emit('new-message', message);
    console.log('SMS received:', message.from, message.text?.substring(0, 50));
  });

  socket.on('send-message', (messageData) => {
    const targetDevice = connectedDevices.get(messageData.deviceId);
    if (targetDevice) {
      socket.to(messageData.deviceId).emit('send-sms', {
        to: messageData.to,
        text: messageData.text
      });
      console.log('Message sent to device:', targetDevice.name);
    }
  });

  socket.on('disconnect', () => {
    const device = connectedDevices.get(socket.id);
    if (device) {
      device.connected = false;
      device.lastSeen = new Date();
      socket.broadcast.emit('device-disconnected', device);
      console.log('Device disconnected:', device.name || socket.id);
    }
    connectedDevices.delete(socket.id);
  });

  socket.on('heartbeat', () => {
    const device = connectedDevices.get(socket.id);
    if (device) device.lastSeen = new Date();
  });
});

// ✅ Corrected: start the server using http.createServer
server.listen(PORT, HOST, () => {
  console.log(`✅ Server is running on http://${HOST}:${PORT}`);
  console.log(`🌐 Access on LAN: http://[YOUR-IP-ADDRESS]:${PORT}`);
});
