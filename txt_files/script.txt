document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('mortgageForm');
    const currencyInputs = ['mortgageBalance', 'monthlyPrincipal', 'monthlyInterest', 'monthlyEscrow', 'escrowBalance', 'estimatedEscrowRefund', 'appraisedValue'];

    // Link Escrow Balance to Estimated Escrow Refund
    const escrowBalance = document.getElementById('escrowBalance');
    const estimatedEscrowRefund = document.getElementById('estimatedEscrowRefund');
    
    if (escrowBalance && estimatedEscrowRefund) {
        escrowBalance.addEventListener('input', function() {
            estimatedEscrowRefund.value = this.value;
        });
    
        escrowBalance.addEventListener('blur', function() {
            estimatedEscrowRefund.dispatchEvent(new Event('blur'));
        });
    }

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

    function addBusinessDays(date, days) {
        let result = new Date(date);
        let addedDays = 0;
        while (addedDays < days) {
            result.setDate(result.getDate() + 1);
            if (result.getDay() !== 0 && result.getDay() !== 6) {
                addedDays++;
            }
        }
        return result;
    }

    function getLastDayOfMonth(date) {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0);
    }

    function formatDate(date) {
        return date.toISOString().split('T')[0];
    }

    const estimatedClosingDate = document.getElementById('estimatedClosingDate');
    const fundingDate = document.getElementById('fundingDate');
    const monthEndDate = document.getElementById('monthEndDate');
    const noPaymentDueMonth = document.getElementById('noPaymentDueMonth');

    function updateRelatedDates() {
        if (estimatedClosingDate.value) {
            let closingDate = new Date(estimatedClosingDate.value);
            
            fundingDate.value = formatDate(addBusinessDays(closingDate, 3));
            
            let lastDay = getLastDayOfMonth(closingDate);
            monthEndDate.value = formatDate(lastDay);
            
            let noPaymentDate = new Date(lastDay.getFullYear(), lastDay.getMonth() + 1, 1);
            noPaymentDueMonth.value = formatDate(noPaymentDate);
        }
    }

    estimatedClosingDate.addEventListener('change', updateRelatedDates);
    updateRelatedDates();

    currencyInputs.forEach(id => {
        const input = document.getElementById(id);
        let rawValue = '';

        input.addEventListener('input', function(e) {
            rawValue = e.target.value.replace(/[^\d.]/g, '');
            e.target.value = rawValue;
        });

        input.addEventListener('blur', function(e) {
            e.target.value = formatCurrency(rawValue);
        });

        input.addEventListener('focus', function(e) {
            e.target.value = rawValue;
        });
    });

    const rateInput = document.getElementById('mortgageRate');
    rateInput.addEventListener('input', function(e) {
        let value = e.target.value;
        if (value.length > 6) {
            e.target.value = value.slice(0, 6);
        }
    });

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        let isValid = true;
        form.querySelectorAll('input').forEach(input => {
            if (!input.value.trim()) {
                isValid = false;
                input.classList.add('is-invalid');
            } else {
                input.classList.remove('is-invalid');
            }
        });

        if (isValid) {
            currencyInputs.forEach(id => {
                const input = document.getElementById(id);
                input.value = formatCurrency(input.value);
            });
            this.submit();
        } else {
            alert('Please fill in all fields correctly.');
        }
    });

    document.querySelectorAll('.form-control').forEach(input => {
        input.addEventListener('focus', function() {
            this.parentNode.classList.add('focused');
        });
        input.addEventListener('blur', function() {
            if (!this.value) {
                this.parentNode.classList.remove('focused');
            }
        });
    });

    function populateFormWithTestData() {
         function setCurrencyValue(id, value) {
            const input = document.getElementById(id);
            input.value = value;
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('blur', { bubbles: true }));
        }

        document.getElementById('borrowerName').value = 'John Doe';
        document.getElementById('mortgageRate').value = '6.245';
        document.getElementById('ficoScore').value = '750';
        document.getElementById('newInterestRate').value = '5.25';

        setCurrencyValue('mortgageBalance', '451532.56');
        setCurrencyValue('monthlyPrincipal', '432.56');
        setCurrencyValue('monthlyInterest', '1245.17');
        setCurrencyValue('monthlyEscrow', '350');
        setCurrencyValue('escrowBalance', '4200');
        setCurrencyValue('appraisedValue', '300000');

        let today = new Date();
        document.getElementById('lastPaymentDate').value = today.toISOString().split('T')[0];
        
        let estimatedClosingDate = new Date(today);
        estimatedClosingDate.setDate(today.getDate() + 30);
        document.getElementById('estimatedClosingDate').value = estimatedClosingDate.toISOString().split('T')[0];
        document.getElementById('estimatedClosingDate').dispatchEvent(new Event('change'));

        ['mortgageBalance', 'monthlyPrincipal', 'monthlyInterest', 'monthlyEscrow', 'escrowBalance', 'appraisedValue'].forEach(id => {
            document.getElementById(id).dispatchEvent(new Event('blur'));
        });
    }

    const populateButton = document.getElementById('populateTestData');
    if (populateButton) {
        populateButton.addEventListener('click', populateFormWithTestData);
    }

    initAutocomplete();
    
});



