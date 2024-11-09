function calculateMonthlyPayment(loanAmount, interestRate, termYears) {
    const monthlyRate = interestRate / 12 / 100;
    const n = termYears * 12;
    return (loanAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -n));
}

document.getElementById('ifwForm').onsubmit = (e) => {
    e.preventDefault();
    const loanAmount = parseFloat(document.getElementsByName('loanAmount')[0].value);
    const interestRate = parseFloat(document.getElementsByName('interestRate')[0].value);
    const termYears = parseInt(document.getElementsByName('termYears')[0].value);
    
    const monthlyPayment = calculateMonthlyPayment(loanAmount, interestRate, termYears);
    document.getElementById('monthlyPayment').innerText = monthlyPayment.toFixed(2);
};
