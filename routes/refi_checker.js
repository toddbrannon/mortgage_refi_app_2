const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('refi_checker', { 
    title: 'Refinance Checker',
    activeTab: 'refi_checker'
  });
});

module.exports = router;
