const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('escrow', { 
    title: 'Escrow Details',
    activeTab: 'escrow',
  });
});

module.exports = router;
