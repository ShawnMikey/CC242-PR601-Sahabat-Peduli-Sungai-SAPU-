const express = require('express');
const router = express.Router();

// Route for login page
router.get('/login', (req, res) => {
  res.render('login');  // Renders 'login.ejs' from 'views' folder
});

// Handle login form submission (POST request)
router.post('/login', (req, res) => {
  // Add login handling logic here
});

module.exports = router;