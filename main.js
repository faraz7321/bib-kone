// main.js
require('dotenv').config();
const express = require('express');
const app = express();
const winston = require('winston');
const kone = require('./src/kone');
const bib = require('./src/bib');

app.use(express.json());

// Logger setup
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'server.log' })
  ]
});

// Routes
app.post('/robot/call-elevator', kone.callElevator);
app.post('/elevator/status-update', bib.sendStatusToRobot);

app.listen(3000, () => {
  logger.info('Middleware server running on port 3000');
});
