const express = require('express');
const router = express.Router();
const axios = require('axios');

// Cache for state data
let statesCache = null;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
let lastFetchTime = null;

async function fetchStates() {
  // Return cached data if available and not expired
  if (statesCache && lastFetchTime && (Date.now() - lastFetchTime < CACHE_DURATION)) {
    return statesCache;
  }

  try {
    const response = await axios.get('https://api.census.gov/data/2010/dec/sf1?get=NAME&for=state:*');
    // Transform data: Skip header row (index 0) and format state data
    const states = response.data.slice(1).map(state => ({
      name: state[0],
      code: state[1]
    })).sort((a, b) => a.name.localeCompare(b.name));

    // Update cache
    statesCache = states;
    lastFetchTime = Date.now();
    return states;
  } catch (error) {
    console.error('Error fetching states:', error);
    throw error;
  }
}

router.get('/', async (req, res) => {
  // Get your existing date calculation
  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  nextMonth.setDate(1);
  const defaultDate = nextMonth.toISOString().split('T')[0];
  
  try {
    // Fetch states
    const states = await fetchStates();
    // Render with both states and your existing data
    res.render('index', { 
      title: 'Mortgage Calculator', 
      defaultDate: defaultDate,
      states: states,
      googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY
    });
  } catch (error) {
    // Render with empty states if there's an error
    res.render('index', { 
      title: 'Mortgage Calculator', 
      defaultDate: defaultDate,
      states: [],
      error: 'Failed to load states. Please try again later.'
    });
  }
});

router.post('/submit', (req, res) => {
  // Handle form submission here
  console.log(req.body);
  res.redirect('/');
});

module.exports = router;
