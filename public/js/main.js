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
        console.log('updateCalculations triggered');
    
        // Retrieve and parse input values
        const inputs = {
            principleInput: parseFloat(document.getElementById('principleInput')?.value?.replace(/[^0-9.-]+/g, '')) || 0,
            interestInput: parseFloat(document.getElementById('interestInput')?.value?.replace(/[^0-9.-]+/g, '')) || 0,
            taxesAnnual: parseFloat(document.getElementById('taxesAnnual')?.value) || 0,
            insuranceInput: parseFloat(document.getElementById('insuranceInput')?.value) || 0,
            escrowInput: parseFloat(document.getElementById('escrowInput')?.value) || 0
        };
    
        // Log parsed inputs for debugging
        console.log('Parsed Inputs:', inputs);
    
        // Perform calculations
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
    
        // Log calculations for debugging
        console.log('Calculated Values:', calculations);
    
        // Format and update calculated fields in the DOM
        Object.entries(calculations).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
            // Apply currency formatting for specific fields
                if (id === 'currentAnnualTaxes' || id === 'currentAnnualInsurance' || id === 'currentMonthlyMI') {
                    element.value = standardFormatCurrency(value); // Format as currency
                } else {
                    element.value = value.toFixed(2); // Default to number formatting
                }

                element.readOnly = true; // Make read-only for calculated fields
                element.style.backgroundColor = '#C6FB9D';
                element.style.cursor = 'not-allowed';

                console.log(`Updated ${id}:`, element.value);
            } else {
                console.warn(`Field ${id} not found in DOM.`);
            }
        });
    
        // Update MortgageState for application state tracking
        if (typeof MortgageState !== 'undefined') {
            Object.entries(calculations).forEach(([id, value]) => {
                MortgageState.update(id, value.toFixed(2));
            });
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
            // Initialize raw value
            input.dataset.rawValue = '';

            // Handle input event: Keep raw value and update the display
            input.addEventListener('input', function (e) {
                this.dataset.rawValue = e.target.value.replace(/[^\d.]/g, ''); // Extract numbers only
                e.target.value = this.dataset.rawValue; // Show raw value during typing
                MortgageState.update(this.id, this.dataset.rawValue); // Update app state
            });

            // Handle blur event: Format the raw value as currency
            input.addEventListener('blur', function () {
                this.value = standardFormatCurrency(this.dataset.rawValue); // Format as currency
                MortgageState.update(this.id, this.value); // Update app state with formatted value
            });

            // Handle focus event: Revert to raw value for editing
            input.addEventListener('focus', function () {
                this.value = this.dataset.rawValue; // Show raw value on focus
            });
        });

        // Helper function to format values as currency
        function standardFormatCurrency(value) {
            const numValue = parseFloat(value) || 0; // Safely parse the value
            return numValue.toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
        }
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

        // In your DOMContentLoaded event handler, modify the listener setup:
        ['principleInput', 'interestInput', 'taxesAnnual', 'insuranceInput', 'escrowInput'].forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('input', updateCalculations);
                element.addEventListener('change', updateCalculations);
                element.addEventListener('blur', updateCalculations);
            }
        });

        // Initialize calculations
        updateCalculations();
    });

})();