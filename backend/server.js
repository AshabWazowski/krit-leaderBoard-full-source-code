require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const http = require('http');
const { Server } = require('socket.io');
const Message = require('./models/Message');

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 5000;

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
}));
app.use(helmet()); // Set security headers
app.use(compression()); // Compress responses using gzip
app.use(express.json());
app.use(cookieParser());

// Global Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // Limit each IP to 200 requests per `window` (here, per 15 minutes)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: "Too many requests from this IP, please try again after 15 minutes."
});
app.use(limiter);

// Database connection
console.log("MONGO", process.env.MONGO_URI);

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Test route
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Load Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/groups', require('./routes/groups'));

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('joinGroup', (groupId) => {
        socket.join(groupId);
        console.log(`User ${socket.id} joined group: ${groupId}`);
    });

    socket.on('sendMessage', async (data) => {
        try {
            const { groupId, userId, content } = data;

            const newMessage = new Message({
                group: groupId,
                sender: userId,
                content: content
            });
            await newMessage.save();

            const populatedMessage = await Message.findById(newMessage._id).populate('sender', 'name avatar');

            io.to(groupId).emit('newMessage', populatedMessage);
        } catch (error) {
            console.error('Error sending message:', error);
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
