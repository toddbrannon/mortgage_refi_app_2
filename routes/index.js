const express = require('express');
const { body, validationResult } = require('express-validator');
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
        const states = response.data.slice(1).map(state => ({
            name: state[0],
            code: state[1]
        })).sort((a, b) => a.name.localeCompare(b.name));
        
        statesCache = states;
        lastFetchTime = Date.now();
        return states;
    } catch (error) {
        console.error('Error fetching states:', error);
        throw error;
    }
}

router.get('/', async (req, res) => {
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    nextMonth.setDate(1);
    const defaultDate = nextMonth.toISOString().split('T')[0];

    try {
        const states = await fetchStates();
        // Render app.ejs instead of index.ejs
        res.render('app', {
            title: 'Mortgage Calculator',
            activeTab: req.query.tab || 'input',  // Allow tab selection via query param
            defaultDate: defaultDate,
            states: states,
            smartyApiKey: process.env.SMARTY_API_KEY
        });
    } catch (error) {
        res.render('app', {
            title: 'Mortgage Calculator',
            activeTab: req.query.tab || 'input',
            defaultDate: defaultDate,
            states: [],
            error: 'Failed to load states. Please try again later.'
        });
    }
});

// Single endpoint for form submissions
router.post('/submit', (req, res) => {
    console.log(req.body);
    res.json({ success: true }); // Return JSON response instead of redirect
});

module.exports = router;