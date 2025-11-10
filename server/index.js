
const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const WebSocket = require('ws');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const connectDB = require('./config/db');
const auth = require('./middleware/auth');
const { trainModel } = require('./ml-model');

// Connect to database
connectDB();

const app = express();
const port = process.env.PORT || 3001;

// CORS options
const allowedOrigins = [
  'https://9000-firebase-finalyearproject-1762767642812.cluster-yylgzpipxrar4v4a72liastuqy.cloudworkstations.dev',
  'http://localhost:3000'
];

const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Routes
const testRouter = require('./routes/test');
const scansRouter = require('./routes/scans');
const authRouter = require('./routes/auth');
const mlRouter = require('./routes/ml');

app.use('/api/test', testRouter);
app.use('/api/auth', authRouter);
app.use('/api/scans', auth, scansRouter);
app.use('/api/ml', mlRouter);

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

server.listen(port, async () => {
  console.log(`Server listening at http://localhost:${port}`);
  await trainModel();
});
