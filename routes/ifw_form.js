const express = require('express');
const router = express.Router();

router.get('/', (req, res, next) => {
    try {
        console.log('IFW form route hit');
    // Initial default values from the spreadsheet
    const defaultValues = {
        lastPaymentDate: '2024-10-01',
        fundingDate: '2024-10-23',
        balanceOn1st: 626417.51,
        interestDue1st: 3604.05,
        total1stPayoff: 630021.56,
        balanceOn2nd: 0.00,
        interestDue2nd: 0.00,
        total2ndPayoff: 0.00,
        otherDebts: 0.00,
        totalPayoffs: 630021.56,
        propertyValue: 850000.00,
        loanAmount: 645000.00,
        loanPurpose: 'Rate/Term Refinance',
        occupancy: 'Primary',
        program: 'FHA',
        interestRate: 6.000,
        fico: 777,
        propertyType: 'Single Family',
        ltv: 75.88,
        secondMortgageAmount: 0.00,
        monthlyMortgageIns: 0.00,
        secondMortgageRate: 0,
        // Origination Charges
        adminFee: 995.00,
        discountPoints: 6350.00,
        underwritingFee: 0.00,
        lenderCredit: 0.00,
        // Services Borrower Cannot Shop
        appraisalFee: 750.00,
        creditReportFee: 200.00,
        floodCert: 8.00,
        thirdProcessingFee: 895.00,
        // Taxes & Government Fees
        recordingFeesDeed: 150.00,
        recordingFeesMortgage: 0.00,
        transferTaxes: 0.00,
        // Escrow
        taxesMonthly: 361.30,
        taxesMonthCount: 8,
        insuranceMonthly: 216.80,
        insuranceMonthCount: 5
    };

    res.render('ifw_form', { 
        title: 'Itemized Fee Worksheet',
        values: defaultValues
    });
    } catch (error) {
        console.error('Error in IFW route:', error);
        next(error);
    }
});

router.post('/form', (req, res) => {
    // Handle form submission
    const formData = req.body;
    
    // Process the data as needed
    // You can add validation and calculations here
    
    // For now, just send back success response
    res.json({ 
        success: true, 
        message: 'Form data received successfully'
    });
});

module.exports = router;
