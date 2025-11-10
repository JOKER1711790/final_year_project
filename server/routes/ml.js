const express = require('express');
const router = express.Router();
const { predict } = require('../ml-model');

router.post('/predict', async (req, res) => {
    const { filePath } = req.body;

    try {
        const prediction = await predict(filePath);
        res.json(prediction);
    } catch (error) {
        console.error('Prediction error:', error);
        res.status(500).json({ error: 'Failed to make a prediction' });
    }
});

module.exports = router;