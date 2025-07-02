//KONE API

const axios = require('axios');
const crypto = require('crypto');
const winston = require('winston');

const {
  KONE_DEVICE_UUID,
  KONE_DEVICE_SECRET,
  KONE_API_URL
} = process.env;

function generateKONESign(uuid, ts, secret) {
  return crypto.createHash('md5').update(`${uuid}|${ts}|${secret}`).digest('hex');
}

const callElevator = async (req, res) => {
  const { toFloor, placeId, liftNo } = req.body;
  const ts = Date.now();
  const sign = generateKONESign(KONE_DEVICE_UUID, ts, KONE_DEVICE_SECRET);

  try {
    const response = await axios.post(`${KONE_API_URL}/`, {
      deviceUuid: KONE_DEVICE_UUID,
      appname: '',//email?
      placeId,
      liftNo,
      toFloor,
      sign,
      ts
    });
    winston.info('KONE elevator called', { toFloor, liftNo });
    res.json(response.data);
  } catch (error) {
    winston.error('Error calling KONE elevator', { error: error.message });
    res.status(500).json({ error: 'KONE elevator call failed' });
  }
};

module.exports = {
  callElevator
};
