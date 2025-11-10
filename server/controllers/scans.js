
const Scan = require('../models/Scan');
const WebSocket = require('ws');
const axios = require('axios'); // Import axios

// @desc    Get all scans
// @route   GET /api/scans
// @access  Public
exports.getScans = async (req, res, next) => {
  try {
    const scans = await Scan.find();
    res.status(200).json({ success: true, data: scans });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Create a scan
// @route   POST /api/scans
// @access  Public
exports.createScan = async (req, res, next) => {
  try {
    const { name, type, file_path } = req.body;

    // Create a new scan with a 'scanning' status
    const scan = await Scan.create({
      name,
      type,
      status: 'scanning',
    });

    // Broadcast the new scan to all connected clients
    const wss = req.app.get('wss');
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          type: 'new_scan',
          payload: scan
        }));
      }
    });

    // Replace the Python script with an API call
    try {
      // Define the ML model API endpoint
      const mlApiEndpoint = 'http://localhost:3000/api/ml/predict'; // Local ML model

      // Make a POST request to the ML model API
      const response = await axios.post(mlApiEndpoint, {
        file_path: file_path
      });

      const result = response.data;

      const updatedScan = await Scan.findByIdAndUpdate(scan._id, {
        status: 'completed',
        threatLevel: result.threatLevel,
        threats: result.threats,
        findings: result.findings,
        completedAt: new Date(),
        duration: result.duration,
      }, { new: true });

      // Broadcast the updated scan to all connected clients
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'scan_update',
            payload: updatedScan
          }));
        }
      });
    } catch (error) {
        console.error('Error calling ML model API:', error.message);
        // Optionally, update the scan to an 'error' state
        await Scan.findByIdAndUpdate(scan._id, { status: 'error' });
    }


    res.status(201).json({ success: true, data: scan });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
