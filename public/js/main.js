(function () {
    'use strict';
 
    // State management for cross-view data
    const MortgageState = {
        data: {},
        listeners: new Set(),
        
        update(key, value) {
            this.data[key] = value;
            this.notifyListeners();
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
        }
    };
 
    // Utility Functions
    function formatCurrency(value) {
        value = value.replace(/[^\d.]/g, '');
        let parts = value.split('.');
        if (parts.length > 2) {
            parts = [parts[0], parts.slice(1).join('')];
        }
        if (parts[1] && parts[1].length > 2) {
            parts[1] = parts[1].slice(0, 2);
        }
        value = parts.join('.');
        let numValue = parseFloat(value);
        if (isNaN(numValue)) {
            return '';
        }
        return numValue.toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }
 
    function standardFormatCurrency(value) {
        const numValue = parseFloat(value) || 0;
        return numValue.toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }
 
    function formatPercentage(value) {
        value = value.replace(/[^\d.]/g, '');
        let numValue = parseFloat(value);
        if (isNaN(numValue)) {
            return '';
        }
        return numValue + '%';
    }
 
    function parseCurrencyValue(value) {
        if (!value) return 0;
        return parseFloat(value.replace(/[^0-9.-]+/g, '')) || 0;
    }
 
    // Monthly Payment Breakdown Calculations
    function updateCalculations() {
        console.log('updateCalculations triggered');
    
        const inputs = {
            principleInput: parseFloat(document.getElementById('principleInput')?.value?.replace(/[^0-9.-]+/g, '')) || 0,
            interestInput: parseFloat(document.getElementById('interestInput')?.value?.replace(/[^0-9.-]+/g, '')) || 0,
            taxesAnnual: parseFloat(document.getElementById('taxesAnnual')?.value) || 0,
            insuranceInput: parseFloat(document.getElementById('insuranceInput')?.value) || 0,
            escrowInput: parseFloat(document.getElementById('escrowInput')?.value) || 0
        };
    
        console.log('Parsed Inputs:', inputs);
    
        const calculations = {
            taxesMonthly: inputs.taxesAnnual / 12,
            taxesCalc: inputs.escrowInput + inputs.insuranceInput,
            insuranceCalc: inputs.escrowInput - (inputs.taxesAnnual / 12),
            pitiFull: inputs.principleInput + inputs.interestInput + (inputs.taxesAnnual / 12) + inputs.insuranceInput,
            piPayment: inputs.principleInput + inputs.interestInput,
            pimiPayment: inputs.principleInput + inputs.interestInput + inputs.escrowInput,
            currentAnnualTaxes: inputs.taxesAnnual,
            currentAnnualInsurance: inputs.insuranceInput
        };
    
        console.log('Calculated Values:', calculations);
    
        Object.entries(calculations).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                if (id === 'currentAnnualTaxes' || id === 'currentAnnualInsurance' || id === 'currentMonthlyMI') {
                    element.value = standardFormatCurrency(value);
                } else {
                    element.value = value.toFixed(2);
                }
 
                element.readOnly = true;
                element.style.backgroundColor = '#C6FB9D';
                element.style.cursor = 'not-allowed';
 
                console.log(`Updated ${id}:`, element.value);
            } else {
                console.warn(`Field ${id} not found in DOM.`);
            }
        });
    
        if (typeof MortgageState !== 'undefined') {
            Object.entries(calculations).forEach(([id, value]) => {
                MortgageState.update(id, value.toFixed(2));
            });
        }
    }
 
    // IFW Form Calculations
    function calculateInterestDue(balance, rate, lastPaymentDate, fundingDate, cushion = 6) {
        if (!balance || !rate || !lastPaymentDate || !fundingDate) return 0;
        const days = (new Date(fundingDate) - new Date(lastPaymentDate)) / (1000 * 60 * 60 * 24);
        return (balance * (rate / 100) / 365) * (days + cushion);
    }
 
    function updateIFWFields(data) {
        const fieldMappings = {
            'lastPaymentDate': {
                sourceId: 'lastPaymentDate',
                targetName: 'lastPaymentDate'
            },
            'mortgageBalance': {
                sourceId: 'mortgageBalance',
                targetName: 'balanceOn1st'
            },
            'current2ndMtgBal': {
                sourceId: 'current2ndMtgBal',
                targetName: 'balanceOn2nd'
            }
        };
 
        Object.entries(fieldMappings).forEach(([sourceId, mapping]) => {
            const sourceValue = MortgageState.get(sourceId);
            if (sourceValue) {
                const targetElement = document.querySelector(`[name="${mapping.targetName}"]`);
                if (targetElement) {
                    targetElement.value = sourceValue;
                }
            }
        });
 
        const firstBalance = parseCurrencyValue(MortgageState.get('mortgageBalance'));
        const firstRate = parseFloat(MortgageState.get('mortgageRate'));
        const lastPaymentDate = MortgageState.get('lastPaymentDate');
        const fundingDate = MortgageState.get('fundingDate');
 
        const firstInterestDue = calculateInterestDue(
            firstBalance,
            firstRate,
            lastPaymentDate,
            fundingDate
        );
 
        const interestDue1stElement = document.querySelector('[name="interestDue1st"]');
        if (interestDue1stElement) {
            interestDue1stElement.value = standardFormatCurrency(firstInterestDue);
        }
 
        const total1stPayoff = firstBalance + firstInterestDue;
        const total1stPayoffElement = document.querySelector('[name="total1stPayoff"]');
        if (total1stPayoffElement) {
            total1stPayoffElement.value = standardFormatCurrency(total1stPayoff);
        }
 
        const secondBalance = parseCurrencyValue(MortgageState.get('current2ndMtgBal'));
        const secondRate = parseFloat(MortgageState.get('current2ndMtgRate'));
 
        const secondInterestDue = calculateInterestDue(
            secondBalance,
            secondRate,
            lastPaymentDate,
            fundingDate
        );
 
        const interestDue2ndElement = document.querySelector('[name="interestDue2nd"]');
        if (interestDue2ndElement) {
            interestDue2ndElement.value = standardFormatCurrency(secondInterestDue);
        }
 
        const total2ndPayoff = secondBalance + secondInterestDue;
        const total2ndPayoffElement = document.querySelector('[name="total2ndPayoff"]');
        if (total2ndPayoffElement) {
            total2ndPayoffElement.value = standardFormatCurrency(total2ndPayoff);
        }
    }
 
    document.addEventListener('DOMContentLoaded', function () {
        // Setup calculated fields
        const calculatedFields = [
            'taxesMonthly', 'taxesCalc', 'insuranceCalc', 'currentPITIFirst',
            'currentP&IorIOFirst', 'currentMonthlyMI', 'currentAnnualTaxes', 
            'currentAnnualInsurance'
        ];
 
        calculatedFields.forEach(id => {
            const field = document.getElementById(id);
            if (field) {
                field.readOnly = true;
                field.value = '$0.00';
                field.style.backgroundColor = '#C6FB9D';
                field.style.cursor = 'not-allowed';
            }
        });
 
        // Currency Input Formatting
        document.querySelectorAll('.currency-input').forEach(input => {
            input.dataset.rawValue = '';
 
            input.addEventListener('input', function (e) {
                this.dataset.rawValue = e.target.value.replace(/[^\d.]/g, '');
                e.target.value = this.dataset.rawValue;
                MortgageState.update(this.id, this.dataset.rawValue);
            });
 
            input.addEventListener('blur', function () {
                this.value = standardFormatCurrency(this.dataset.rawValue);
                MortgageState.update(this.id, this.value);
            });
 
            input.addEventListener('focus', function () {
                this.value = this.dataset.rawValue;
            });
        });
 
        // Percentage Input Formatting
        const percentageInputs = document.querySelectorAll('.percentage-input');
        percentageInputs.forEach(input => {
            let rawValue = '';
            
            input.addEventListener('input', function(e) {
                rawValue = e.target.value.replace(/[^\d.]/g, '');
                e.target.value = rawValue;
                MortgageState.update(this.id, rawValue);
            });
 
            input.addEventListener('blur', function() {
                this.value = formatPercentage(rawValue);
                MortgageState.update(this.id, this.value);
            });
 
            input.addEventListener('focus', function() {
                this.value = rawValue;
            });
        });
 
        ['principleInput', 'interestInput', 'taxesAnnual', 'insuranceInput', 'escrowInput'].forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('input', updateCalculations);
                element.addEventListener('change', updateCalculations);
                element.addEventListener('blur', updateCalculations);
            }
        });
 
        updateCalculations();
        
        // Initialize IFW form updates
        MortgageState.subscribe(updateIFWFields);
    });
 
 })();