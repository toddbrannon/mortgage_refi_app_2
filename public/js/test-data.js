// Helper functions for test data population
function setCurrencyValue(id, value) {
    const input = document.getElementById(id);
    if (input) {
        input.value = value;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('blur', { bubbles: true }));
    }
}

function setDateValue(id, date) {
    const input = document.getElementById(id);
    if (input) {
        input.value = date.toISOString().split('T')[0];
        input.dispatchEvent(new Event('change', { bubbles: true }));
    }
}

function setPercentageValue(id, value) {
    const input = document.getElementById(id);
    if (input) {
        input.value = value;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('blur', { bubbles: true }));
    }
}

// Function to clear all inputs
function clearAllInputs() {
    const form = document.getElementById('mortgageForm');
    if (form) {
        // Clear text, number, and date inputs
        form.querySelectorAll('input').forEach(input => {
            input.value = '';
        });

        // Clear any selects
        form.querySelectorAll('select').forEach(select => {
            select.selectedIndex = 0;
        });

        // Clear read-only calculated fields
        const calculatedFields = [
            'taxesMonthly', 'taxesCalc', 'insuranceCalc', 'currentPITIFirst',
            'currentP&IorIOFirst', 'currentMonthlyMI', 'currentAnnualTaxes', 
            'currentAnnualInsurance', 'totalPITIFirstSecond', 'totalPIMI12Other'
        ];

        // Clear Monthly Payment Breakdown inputs
        const breakdownInputs = [
            'principleInput',    // Value column
            'interestInput',     // Value column
            'taxesMonthly',      // Value column (calculated)
            'taxesCalc',         // Calculation column (calculated)
            'taxesAnnual',       // Annual column
            'insuranceInput',    // Value column
            'insuranceCalc',     // Calculation column (calculated)
            'escrowInput',       // Value column
            'escrowBalanceInput' // Value column
        ];

        breakdownInputs.forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.value = '';
            }
        });

        calculatedFields.forEach(id => {
            const field = document.getElementById(id);
            if (field) {
                field.value = '';
            }
        });
    }
}

// Main test data population function
function populateTestData() {
    // Basic Information
    document.getElementById('borrowerName').value = 'John Smith';
    
    // Mortgage Details
    setCurrencyValue('mortgageBalance', '425000.00');
    setPercentageValue('mortgageRate', '6.875');
    setCurrencyValue('currentPITIFirst', '3250.00');
    setCurrencyValue('currentPandIorIOFirst', '2800.00');
    setCurrencyValue('currentMonthlyMI', '125.00');
    setCurrencyValue('currentAnnualTaxes', '4800.00');
    setCurrencyValue('currentAnnualInsurance', '2100.00');
    
    // Second Mortgage
    setCurrencyValue('current2ndMtgBal', '50000.00');
    setPercentageValue('current2ndMtgRate', '8.500');
    setCurrencyValue('currentPandIorIOSecond', '450.00');
    setCurrencyValue('totalPITIFirstSecond', '3700.00');
    
    // Other Debts
    setCurrencyValue('totalPIMI12Other', '3375.00');
    setCurrencyValue('balOfOtherDebts', '15000.00');
    setCurrencyValue('monthlyPmtOtherDebt', '350.00');
    
    // Dates
    const today = new Date();
    setDateValue('lastPaymentDate', today);
    
    const estClosingDate = new Date(today);
    estClosingDate.setDate(today.getDate() + 30);
    setDateValue('estClosingDate', estClosingDate);
    
    const fundingDate = new Date(estClosingDate);
    fundingDate.setDate(estClosingDate.getDate() + 3);
    setDateValue('fundingDate', fundingDate);
    
    // End of month
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    setDateValue('monthEnd', monthEnd);
    
    // First of next month
    const noPaymentDate = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    setDateValue('noPaymentDueMonth', noPaymentDate);
    
    // First of month after next
    const firstPaymentDate = new Date(today.getFullYear(), today.getMonth() + 2, 1);
    setDateValue('firstPmtDueDate', firstPaymentDate);
    
    // Additional Fields
    setCurrencyValue('estEscrowRefund', '2500.00');
    setCurrencyValue('appraisedValue', '550000.00');
    document.getElementById('ficoScore').value = '745';
    setPercentageValue('newInterestRate', '5.875');

    // Monthly Payment Breakdown
    document.getElementById('principleInput').value = '502.18';
    document.getElementById('interestInput').value = '3928.11';
    document.getElementById('taxesAnnual').value = '4335.56';
    document.getElementById('insuranceInput').value = '216.80';
    document.getElementById('escrowInput').value = '693.92';
    document.getElementById('escrowBalanceInput').value = '272.35';

    // Trigger calculation updates for all fields
    ['principleInput', 'interestInput', 'taxesAnnual', 'insuranceInput', 'escrowInput'].forEach(id => {
        document.getElementById(id)?.dispatchEvent(new Event('input', { bubbles: true }));
    });
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // First clear all inputs
    // clearAllInputs();


    
    // Add test data button
    const form = document.getElementById('mortgageForm');
    if (form) {

        // Create container for buttons
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'btn-group mt-3 mb-3';

        // Add test data button
        const testDataButton = document.createElement('button');
        testDataButton.type = 'button';
        testDataButton.id = 'populateTestData';
        testDataButton.className = 'btn btn-secondary';
        testDataButton.textContent = 'Add Test Data';
        testDataButton.onclick = populateTestData;
        
        // Add clear form button
        const clearButton = document.createElement('button');
        clearButton.type = 'button';
        clearButton.id = 'clearForm';
        clearButton.className = 'btn btn-outline-secondary';
        clearButton.textContent = 'Clear Form';
        clearButton.onclick = clearAllInputs;
        
        // Add buttons to container
        buttonContainer.appendChild(testDataButton);
        buttonContainer.appendChild(clearButton);
        
        // Insert at top of form
        form.insertBefore(buttonContainer, form.firstChild);
    }
});