
const express = require('express');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const PORT = 3001;

// A list of possible threats
const threats = [
    "SQL Injection",
    "Cross-Site Scripting (XSS)",
    "Cross-Site Request Forgery (CSRF)",
    "Insecure Deserialization",
    "Security Misconfiguration",
    "Broken Authentication",
    "Sensitive Data Exposure",
];

// Function to get a random subset of an array
const getRandomSubset = (arr) => {
    const shuffled = arr.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.floor(Math.random() * (shuffled.length + 1)));
};

app.post('/predict', (req, res) => {
    console.log('Mock ML API received request:', req.body);

    const randomThreats = getRandomSubset(threats);
    const threatLevel = randomThreats.length === 0 ? 'none' : 
                        randomThreats.length <= 2 ? 'low' :
                        randomThreats.length <= 4 ? 'medium' : 'high';

    const result = {
        threatLevel,
        threats: randomThreats,
        findings: randomThreats.length > 0 ? `Detected ${randomThreats.length} potential threats.` : 'No threats detected.',
        duration: Math.random() * (30 - 5) + 5, // Random duration between 5 and 30 seconds
    };

    // Simulate network delay
    setTimeout(() => {
        res.status(200).json(result);
    }, 1000 + Math.random() * 2000);
});

app.listen(PORT, () => {
    console.log(`Mock ML server listening on port ${PORT}`);
});
