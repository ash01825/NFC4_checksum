const express = require('express');
const { getTradeDetails, getIdentityDetails } = require('../services/blockchainService');
const { analyzeTradeWithAI } = require('../services/aiService');

const router = express.Router();

// Route to get identity details
router.get('/identity/:address', async (req, res) => {
    try {
        const details = await getIdentityDetails(req.params.address);
        res.json(details);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Route to get trade details
router.get('/trade/:id', async (req, res) => {
    try {
        const details = await getTradeDetails(req.params.id);
        res.json(details);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Route to trigger AI analysis for a trade
router.post('/analyze-trade', async (req, res) => {
    const { description, esgData } = req.body;
    if (!description || !esgData) {
        return res.status(400).json({ error: 'description and esgData are required' });
    }
    try {
        const analysis = await analyzeTradeWithAI(description, esgData);
        res.json(analysis);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
