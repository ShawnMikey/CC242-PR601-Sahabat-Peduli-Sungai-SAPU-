const express = require('express');
const path = require('path');
const app = express();

// Set 'public' as the folder for static files
app.use(express.static(path.join(__dirname, 'public')));

// Route to serve index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Route to serve makeReport.html
app.get('/makeReport', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'makeReport.html'));
});

// Route to serve reportHistory.html
app.get('/reportHistory', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'reportHistory.html'));
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});