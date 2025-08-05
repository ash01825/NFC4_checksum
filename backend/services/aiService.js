const axios = require('axios');

const AI_AGENT_URL = `${process.env.AI_AGENT_API_URL}/analyze`;

/**
 * Calls the Python AI agent to analyze trade data.
 * @param {string} description - The trade description.
 * @param {string} esgData - The ESG data string.
 * @returns {Promise<object>} - The analysis result from the AI agent.
 */
async function analyzeTradeWithAI(description, esgData) {
    console.log(`🤖 AI Service: Sending data to AI agent at ${AI_AGENT_URL}`);
    try {
        const response = await axios.post(AI_AGENT_URL, {
            description,
            esgData,
        });
        return response.data;
    } catch (error) {
        console.error("Error calling AI agent:", error.message);
        // Return a default error structure if the AI agent is down
        return {
            error: "AI service is unavailable",
            riskScore: -1,
            explanation: "Could not connect to the compliance analysis service.",
        };
    }
}

module.exports = { analyzeTradeWithAI };
