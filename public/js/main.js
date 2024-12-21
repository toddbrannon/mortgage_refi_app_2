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

    // Monthly Payment Calculations
    function updateCalculations() {
        const inputs = {
            principleInput: parseFloat(document.getElementById('principleInput').value) || 0,
            interestInput: parseFloat(document.getElementById('interestInput').value) || 0,
            taxesAnnual: parseFloat(document.getElementById('taxesAnnual').value) || 0,
            insuranceInput: parseFloat(document.getElementById('insuranceInput').value) || 0,
            escrowInput: parseFloat(document.getElementById('escrowInput').value) || 0
        };

        function formatResult(value) {
            return Object.values(inputs).some(val => val !== 0) 
                ? value.toFixed(2) 
                : '$0.00';
        }

        const taxesMonthly = inputs.taxesAnnual / 12;
        
        // Update all calculated fields
        const calculations = {
            taxesMonthly: { value: formatResult(taxesMonthly), readOnly: true },
            taxesCalc: { value: formatResult(inputs.escrowInput + inputs.insuranceInput), readOnly: true },
            insuranceCalc: { value: formatResult(inputs.escrowInput - taxesMonthly), readOnly: true },
            currentPITIFirst: { value: formatResult(inputs.principleInput + inputs.interestInput + taxesMonthly + inputs.insuranceInput), readOnly: true },
            'currentP&IorIOFirst': { value: formatResult(inputs.principleInput + inputs.interestInput), readOnly: true },
            currentMonthlyMI: { value: formatResult(inputs.principleInput + inputs.interestInput + inputs.escrowInput), readOnly: true },
            currentAnnualTaxes: { value: formatResult(taxesMonthly * 12), readOnly: true },
            currentAnnualInsurance: { value: formatResult(inputs.insuranceInput), readOnly: true },
            totalPITIFirstSecond: { value: formatResult(0), readOnly: true }, // Add calculation
            totalPIMI12Other: { value: formatResult(0), readOnly: true }  // Add calculation
        };

        // Update DOM and state for all calculated fields
        Object.entries(calculations).forEach(([id, config]) => {
            const element = document.getElementById(id);
            if (element) {
                element.value = config.value;
                if (config.readOnly) {
                    element.readOnly = true;
                    element.style.backgroundColor = '#C6FB9D';
                    element.style.cursor = 'not-allowed';
                }
                MortgageState.update(id, config.value);
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        const form = document.getElementById('mortgageForm');
        const ifwForm = document.getElementById('ifwForm');
        
        // Setup calculated fields styling
        const calculatedFields = [
            'taxesMonthly', 'taxesCalc', 'insuranceCalc', 'currentPITIFirst',
            'currentP&IorIOFirst', 'currentMonthlyMI', 'currentAnnualTaxes', 'currentAnnualInsurance',
            'totalPITIFirstSecond', 'totalPIMI12Other'
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

        // Link escrow balance to estimated escrow refund
        const escrowBalance = document.getElementById('escrowBalance');
        const estimatedEscrowRefund = document.getElementById('estimatedEscrowRefund');
        if (escrowBalance && estimatedEscrowRefund) {
            escrowBalance.addEventListener('input', function () {
                estimatedEscrowRefund.value = this.value;
                MortgageState.update('estimatedEscrowRefund', this.value);
            });
            escrowBalance.addEventListener('blur', function () {
                estimatedEscrowRefund.dispatchEvent(new Event('blur'));
            });
        }

        // Currency Input Formatting
        document.querySelectorAll('.currency-input').forEach(input => {
            let rawValue = '';
            
            input.addEventListener('input', function(e) {
                rawValue = e.target.value.replace(/[^\d.]/g, '');
                e.target.value = rawValue;
                MortgageState.update(this.id, rawValue);
            });

            input.addEventListener('blur', function() {
                this.value = standardFormatCurrency(rawValue);
                MortgageState.update(this.id, this.value);
            });

            input.addEventListener('focus', function() {
                this.value = rawValue;
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

        // Add input listeners for calculations
        ['principleInput', 'interestInput', 'taxesAnnual', 'insuranceInput', 'escrowInput'].forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('input', updateCalculations);
            }
        });

        // Initialize calculations
        updateCalculations();

        // Initialize payoff view if present
        if (document.getElementById('payoffForm')) {
            initializePayoffView();
        }

        // Add form submission handler
        if (form) {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                // ... rest of form submission logic
            });
        }
    });

    // Initialize payoff view
    function initializePayoffView() {
        MortgageState.subscribe(updatePayoffFields);
    }

    // Update payoff fields based on state changes
    function updatePayoffFields(data) {
        if (!document.getElementById('payoffForm')) return;
        
        // ... payoff view update logic
    }

})();