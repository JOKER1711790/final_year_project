
const express = require('express');
const router = express.Router();
const { getScans, createScan } = require('../controllers/scans');

router.route('/').get(getScans).post(createScan);

module.exports = router;
