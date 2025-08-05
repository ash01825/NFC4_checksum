// Load environment variables first
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 8000;

// --- Middleware ---
// Enable Cross-Origin Resource Sharing for all routes
app.use(cors());
// Parse incoming JSON requests
app.use(express.json());

// --- API Routes ---
// All API routes will be prefixed with /api
app.use('/api', apiRoutes);

// --- Health Check Route ---
// A simple route to check if the server is running
app.get('/', (req, res) => {
    res.send('Trade Finance Backend is running!');
});

// --- Start the Server ---
app.listen(PORT, () => {
    console.log(`🚀 Server is listening on port ${PORT}`);
    console.log(`🔗 Access it at http://localhost:${PORT}`);
});
