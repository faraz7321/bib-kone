// BIB API

const axios = require('axios');
const crypto = require('crypto');
const winston = require('winston');

const { BIB_APP_ID, BIB_APP_KEY, BIB_API_URL } = process.env;

function generateBIBSign(params, appKey) {
  const sorted = Object.keys(params).sort().map(k => params[k]).join('');
  return crypto.createHash('md5').update(sorted + appKey).digest('hex');
}

function encryptBIBPayload(payload, appKey) {
  const cipher = crypto.createCipheriv('aes-128-ecb', Buffer.from(appKey), null);
  cipher.setAutoPadding(true);
  let encrypted = cipher.update(JSON.stringify(payload), 'utf8', 'base64');
  encrypted += cipher.final('base64');
  return encrypted;
}

const sendStatusToRobot = async (req, res) => {
  const { liftNo, state, floor } = req.body;
  const requestId = crypto.randomBytes(16).toString('hex');
  const timestamp = Date.now().toString();
  const sign = generateBIBSign({ requestId, timestamp }, BIB_APP_KEY);

  const payload = {
    requestId,
    timestamp,
    sign
  };

  try {
    const encrypted = encryptBIBPayload(payload, BIB_APP_KEY);
    const result = await axios.post(`${BIB_API_URL}/cloud/open/openapi/device/currentStatus`, {
      encryptScript: encrypted,
      appId: BIB_APP_ID
    });
    winston.info('Sent elevator status to BIB', { liftNo, state, floor });
    res.json(result.data);
  } catch (err) {
    winston.error('Failed to update robot with elevator status', { error: err.message });
    res.status(500).json({ error: 'Status update failed' });
  }
};

module.exports = {
  sendStatusToRobot
};