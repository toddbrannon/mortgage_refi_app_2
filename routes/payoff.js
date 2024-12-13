const express = require('express');
const router = express.Router();

// GET handler for the Payoff form
router.get('/', (req, res) => {
  try {
    // Render the payoff form view
    res.render('payoff', { 
      title: 'Pay Off Form' 
    });
  } catch (error) {
    console.error('Error rendering payoff form:', error);
    res.status(500).send('Internal Server Error');
  }
});

// POST handler for the Payoff form submission
router.post('/submit', (req, res) => {
  try {
    // Log form data for now
    console.log('Payoff Form Data:', req.body);

    // Perform form processing logic here
    // For example, save data to a database or perform calculations

    // Redirect back to the form or another page
    res.redirect('/payoff');
  } catch (error) {
    console.error('Error handling payoff form submission:', error);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
