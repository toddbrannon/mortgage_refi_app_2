// Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function () {
    // Get references to inputs
    const taxesAnnualInput = document.getElementById('taxesAnnual');
    const taxesMonthlyInput = document.getElementById('taxesMonthly');
    const taxesCalcInput = document.getElementById('taxesCalc');
    const insuranceInput = document.getElementById('insuranceInput');
    const insuranceCalcInput = document.getElementById('insuranceCalc');
    const principleInput = document.getElementById('principleInput');
    const interestInput = document.getElementById('interestInput');
    const totalMonthlyInput = document.getElementById('totalMonthly');
    const mipCalcInput = document.getElementById('mipCalc');
    const escrowInput = document.getElementById('escrowInput');
    const escrowBalanceInput = document.getElementById('escrowBalanceInput');

    // Update calculations
    function updateCalculations() {
        const taxesAnnual = parseFloat(taxesAnnualInput.value) || 0;
        const escrow = parseFloat(escrowInput.value) || 0;
        const insurance = parseFloat(insuranceInput.value) || 0;

        // Taxes calculations
        const taxesMonthly = taxesAnnual / 12;
        taxesMonthlyInput.value = taxesMonthly.toFixed(2);

        const taxesCalc = escrow - insurance;
        taxesCalcInput.value = taxesCalc.toFixed(2);

        // Insurance calculations
        const insuranceCalc = escrow - taxesMonthly;
        insuranceCalcInput.value = insuranceCalc.toFixed(2);

        // Total monthly calculation
        const principle = parseFloat(principleInput.value) || 0;
        const interest = parseFloat(interestInput.value) || 0;
        const totalMonthly = principle + interest + taxesMonthly + insurance;
        totalMonthlyInput.value = totalMonthly.toFixed(2);

        // MIP? calculation
        const mipCalc = escrow - (insurance + taxesMonthly);
        mipCalcInput.value = mipCalc.toFixed(2);
    }

    // Attach event listeners to update calculations on input
    taxesAnnualInput.addEventListener('input', updateCalculations);
    escrowInput.addEventListener('input', updateCalculations);
    insuranceInput.addEventListener('input', updateCalculations);
    principleInput.addEventListener('input', updateCalculations);
    interestInput.addEventListener('input', updateCalculations);

    // Initialize calculations
    updateCalculations();
});
