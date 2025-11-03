const express = require('express');
const path = require('path');
const app = express();

// The port MUST match the 'containerPort' in your deployment.yaml 
// and the 'EXPOSE' in your Dockerfile
const PORT = 3000;

// Serve static files (index.html, style.css) from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// A simple health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Student Dashboard server running on port ${PORT}`);
});