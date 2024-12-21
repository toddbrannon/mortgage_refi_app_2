// State management for cross-view data
const MortgageState = {
    data: {},
    listeners: new Set(),

    update(key, value) {
        this.data[key] = value;
        this.notifyListeners();
        this.saveToLocalStorage();
        console.log('State Updated:', key, value);
    },

    get(key) {
        return this.data[key];
    },

    subscribe(callback) {
        this.listeners.add(callback);
    },

    unsubscribe(callback) {
        this.listeners.delete(callback);
    },

    notifyListeners() {
        this.listeners.forEach(callback => callback(this.data));
    },

    saveToLocalStorage() {
        localStorage.setItem('mortgageStateData', JSON.stringify(this.data));
        console.log('Saved to localStorage:', this.data);
    },

    loadFromLocalStorage() {
        const savedState = localStorage.getItem('mortgageStateData');
        if (savedState) {
            this.data = JSON.parse(savedState);
            console.log('Loaded from localStorage:', this.data);
            this.restoreFormFields();
        }
    },

    restoreFormFields() {
        Object.entries(this.data).forEach(([fieldId, value]) => {
            const element = document.getElementById(fieldId);
            if (element) {
                element.value = value;
                element.dispatchEvent(new Event('input', { bubbles: true }));
            }
        });
    },

    clear() {
        this.data = {};
        localStorage.removeItem('mortgageStateData');
        this.notifyListeners();
        console.log('State cleared');
    }
};

// Input handlers for the input form (index.ejs)
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Loaded, initializing form...');

    // Load saved state first
    MortgageState.loadFromLocalStorage();

    // Add input listeners to all relevant fields
    const inputFields = [
        // Basic Information
        'borrowerName',

        // Current First Mortgage Fields
        'mortgageBalance',
        'mortgageRate',
        'currentPITIFirst',
        'currentPandIorIOFirst',
        'currentMonthlyMI',
        'currentAnnualTaxes',
        'currentAnnualInsurance',
        'currentInsPolEffDate',

        // Second Mortgage Fields
        'current2ndMtgBal',
        'current2ndMtgRate',
        'currentPandIorIOSecond',
        'totalPITIFirstSecond',

        // Other Debts and Payments
        'totalPIMI12Other',
        'balOfOtherDebts',
        'monthlyPmtOtherDebt',

        // Dates
        'lastPaymentDate',
        'estClosingDate',
        'fundingDate',
        'monthEnd',
        'noPaymentDueMonth',
        'firstPmtDueDate',

        // Additional Fields
        'estEscrowRefund',
        'appraisedValue',
        'ficoScore',
        'newInterestRate',

        // Monthly Payment Breakdown Fields
        'principleInput',
        'interestInput',
        'taxesMonthly',
        'taxesCalc',
        'taxesAnnual',
        'insuranceInput',
        'insuranceCalc',
        'escrowInput',
        'escrowBalanceInput'
    ];

    inputFields.forEach(fieldId => {
        const element = document.getElementById(fieldId);
        if (element) {
            // Add input listener
            element.addEventListener('input', function(e) {
                let value = e.target.value;
                
                if (isCurrencyField(fieldId)) {
                    value = parseCurrencyInput(value);
                } else if (isPercentageField(fieldId)) {
                    value = parsePercentageInput(value);
                }

                MortgageState.update(fieldId, value);
            });

            // Add change listener for dates and other fields
            element.addEventListener('change', function(e) {
                MortgageState.update(fieldId, e.target.value);
            });
        }
    });

    // Helper function to identify currency fields
    function isCurrencyField(fieldId) {
        return [
            'mortgageBalance',
            'currentPITIFirst',
            'currentPandIorIOFirst',
            'currentMonthlyMI',
            'currentAnnualTaxes',
            'currentAnnualInsurance',
            'current2ndMtgBal',
            'currentPandIorIOSecond',
            'totalPITIFirstSecond',
            'balOfOtherDebts',
            'monthlyPmtOtherDebt',
            'estEscrowRefund',
            'appraisedValue',
            'principleInput',
            'interestInput',
            'taxesAnnual',
            'insuranceInput',
            'escrowInput',
            'escrowBalanceInput'
        ].includes(fieldId);
    }

    // Helper function to identify percentage fields
    function isPercentageField(fieldId) {
        return [
            'mortgageRate',
            'current2ndMtgRate',
            'newInterestRate'
        ].includes(fieldId);
    }

    // Initialize payoff view listeners if we're on that view
    if (document.getElementById('payoffForm')) {
        initializePayoffView();
    }
});

// Initialize payoff view
function initializePayoffView() {
    MortgageState.subscribe(updatePayoffFields);
}

// Update payoff view fields based on state changes
function updatePayoffFields(data) {
    if (!document.getElementById('payoffForm')) return;

    // Update date fields
    if (data.lastPaymentDate) {
        document.getElementById('lastPaymentDate').value = data.lastPaymentDate;
    }
    if (data.fundingDate) {
        document.getElementById('fundingDate').value = data.fundingDate;
    }

    // Calculate and update 1st loan details
    const firstBalance = parseCurrencyValue(data.mortgageBalance);
    const firstRate = parseFloat(data.mortgageRate);
    if (!isNaN(firstBalance) && !isNaN(firstRate)) {
        document.getElementById('balance1st').value = formatCurrency(firstBalance);
        
        const firstInterestDue = calculateInterestDue(
            firstBalance,
            firstRate,
            data.lastPaymentDate,
            data.fundingDate
        );
        document.getElementById('interestDue1st').value = formatCurrency(firstInterestDue);
        
        const firstTotalPayoff = firstBalance + firstInterestDue;
        document.getElementById('totalPayoff1st').value = formatCurrency(firstTotalPayoff);
    }

    // Calculate and update 2nd loan details
    const secondBalance = parseCurrencyValue(data.current2ndMtgBal);
    const secondRate = parseFloat(data.current2ndMtgRate);
    if (!isNaN(secondBalance) && !isNaN(secondRate)) {
        document.getElementById('balance2nd').value = formatCurrency(secondBalance);
        
        const secondInterestDue = calculateInterestDue(
            secondBalance,
            secondRate,
            data.lastPaymentDate,
            data.fundingDate
        );
        document.getElementById('interestDue2nd').value = formatCurrency(secondInterestDue);
        
        const secondTotalPayoff = secondBalance + secondInterestDue;
        document.getElementById('totalPayoff2nd').value = formatCurrency(secondTotalPayoff);
    }

    // Update other debts and total payoffs
    const otherDebts = parseCurrencyValue(data.balOfOtherDebts) || 0;
    document.getElementById('otherDebts').value = formatCurrency(otherDebts);

    const totalPayoffs = (firstBalance + firstInterestDue) + 
                        (secondBalance + secondInterestDue) + 
                        otherDebts;
    document.getElementById('totalPayoffs').value = formatCurrency(totalPayoffs);

    // Calculate and update savings
    const newRate = parseFloat(data.newInterestRate);
    if (!isNaN(newRate)) {
        const annualSavings = calculateAnnualSavings(
            firstBalance,
            firstRate,
            secondBalance,
            secondRate,
            newRate
        );
        document.getElementById('annualSavings').value = formatCurrency(annualSavings);
        document.getElementById('monthlySavings').value = formatCurrency(annualSavings / 12);
    }
}

// Utility functions
function calculateInterestDue(balance, rate, lastPaymentDate, fundingDate) {
    if (!lastPaymentDate || !fundingDate) return 0;
    const daysCount = calculateDaysBetween(lastPaymentDate, fundingDate) + 6;
    const dailyRate = (rate / 100) / 365;
    return balance * dailyRate * daysCount;
}

function calculateDaysBetween(date1, date2) {
    const oneDay = 24 * 60 * 60 * 1000;
    const firstDate = new Date(date1);
    const secondDate = new Date(date2);
    return Math.round(Math.abs((firstDate - secondDate) / oneDay));
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}

function parseCurrencyValue(value) {
    if (!value) return 0;
    return parseFloat(value.replace(/[^0-9.-]+/g, '')) || 0;
}

function parseCurrencyInput(value) {
    const parsed = parseFloat(value.replace(/[^0-9.-]+/g, ''));
    return isNaN(parsed) ? '' : formatCurrency(parsed);
}

function parsePercentageInput(value) {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? '' : parsed.toFixed(3);
}

function calculateAnnualSavings(firstBalance, firstRate, secondBalance, secondRate, newRate) {
    const currentAnnualInterest = (firstBalance * (firstRate / 100)) + 
                                 (secondBalance * (secondRate / 100));
    const newAnnualInterest = ((firstBalance + secondBalance) * (newRate / 100));
    return currentAnnualInterest - newAnnualInterest;
}