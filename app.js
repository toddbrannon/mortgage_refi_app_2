// app.js
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

// Set view engine
app.set('view engine', 'ejs');

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));

// Routes
app.use('/', require('./routes/index'));

app.post('/calculate_ifw', (req, res) => {
  const { loanAmount, interestRate, termYears } = req.body;
  // Pass these values to the view to render in `ifw_form.ejs`
  res.render('ifw_form', { loanAmount, interestRate, termYears });
});


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});