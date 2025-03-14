const express = require('express');
const { storeSms, getSms } = require('../controllers/smsController');
const router = express.Router();

router.post('/sms/:phonenumber', storeSms);
router.get('/sms/:phonenumber', getSms);

module.exports = router;
