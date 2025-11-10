
const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const WebSocket = require('ws');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const connectDB = require('./config/db');
const auth = require('./middleware/auth');

// Connect to database
connectDB();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const testRouter = require('./routes/test');
const scansRouter = require('./routes/scans');
const authRouter = require('./routes/auth');

app.use('/api/test', testRouter);
app.use('/api/auth', authRouter);
app.use('/api/scans', auth, scansRouter);

app.get('/', (req, res) => {
  res.send('Hello from the backend server!');
});

// Create HTTP server
const server = http.createServer(app);

// Create WebSocket server
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('Client connected');
  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

app.set('wss', wss);

server.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
