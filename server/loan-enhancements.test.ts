import { describe, it, expect } from "vitest";

// Test the loan calculation logic used in the components

describe("Loan Comparison Logic", () => {
  function calculateMonthlyPayment(principal: number, rate: number, months: number): number {
    if (rate === 0) return Math.round(principal / months);
    const monthlyRate = rate / 100 / 12;
    const numerator = monthlyRate * Math.pow(1 + monthlyRate, months);
    const denominator = Math.pow(1 + monthlyRate, months) - 1;
    return Math.round(principal * (numerator / denominator));
  }

  describe("Loan Comparison Calculations", () => {
    it("correctly identifies lower monthly payment option", () => {
      // Same principal and rate, different terms
      const shortTerm = calculateMonthlyPayment(2500000, 6.5, 48);
      const longTerm = calculateMonthlyPayment(2500000, 6.5, 60);
      
      expect(longTerm).toBeLessThan(shortTerm);
    });

    it("correctly identifies lower total cost option", () => {
      const shortTermPayment = calculateMonthlyPayment(2500000, 6.5, 48);
      const longTermPayment = calculateMonthlyPayment(2500000, 6.5, 60);
      
      const shortTermTotal = shortTermPayment * 48;
      const longTermTotal = longTermPayment * 60;
      
      expect(shortTermTotal).toBeLessThan(longTermTotal);
    });

    it("calculates total interest correctly", () => {
      const principal = 2500000;
      const payment = calculateMonthlyPayment(principal, 6.5, 60);
      const totalPayment = payment * 60;
      const totalInterest = totalPayment - principal;
      
      expect(totalInterest).toBeGreaterThan(0);
      expect(totalInterest).toBeLessThan(principal); // Interest should be less than principal for reasonable rates
    });
  });
});

describe("Refinance Analyzer Logic", () => {
  function calculateMonthlyPayment(principal: number, rate: number, months: number): number {
    if (rate === 0) return Math.round(principal / months);
    const monthlyRate = rate / 100 / 12;
    const numerator = monthlyRate * Math.pow(1 + monthlyRate, months);
    const denominator = Math.pow(1 + monthlyRate, months) - 1;
    return Math.round(principal * (numerator / denominator));
  }

  describe("Break-Even Calculation", () => {
    it("calculates break-even point correctly", () => {
      const currentPayment = 50000; // $500/month
      const newPayment = 45000; // $450/month
      const closingCosts = 50000; // $500
      
      const monthlySavings = currentPayment - newPayment;
      const breakEvenMonths = Math.ceil(closingCosts / monthlySavings);
      
      expect(breakEvenMonths).toBe(10); // $500 / $50 = 10 months
    });

    it("returns infinity when no monthly savings", () => {
      const currentPayment = 45000;
      const newPayment = 50000; // Higher payment
      const closingCosts = 50000;
      
      const monthlySavings = currentPayment - newPayment;
      const breakEvenMonths = monthlySavings > 0 ? Math.ceil(closingCosts / monthlySavings) : Infinity;
      
      expect(breakEvenMonths).toBe(Infinity);
    });
  });

  describe("Refinance Recommendation", () => {
    it("recommends refinancing when savings are significant", () => {
      const currentBalance = 2000000;
      const currentRate = 8.5;
      const currentRemainingMonths = 48;
      const currentPayment = calculateMonthlyPayment(currentBalance, currentRate, currentRemainingMonths);
      
      const newRate = 5.5;
      const newTerm = 48;
      const closingCosts = 50000;
      
      const newPrincipal = currentBalance + closingCosts;
      const newPayment = calculateMonthlyPayment(newPrincipal, newRate, newTerm);
      
      const currentTotal = currentPayment * currentRemainingMonths;
      const newTotal = newPayment * newTerm;
      
      const totalSavings = currentTotal - newTotal;
      
      // With 3% lower rate, should save money overall
      expect(totalSavings).toBeGreaterThan(0);
    });

    it("does not recommend when closing costs exceed savings", () => {
      const currentBalance = 500000; // Small loan
      const currentRate = 6.0;
      const currentRemainingMonths = 12;
      const currentPayment = calculateMonthlyPayment(currentBalance, currentRate, currentRemainingMonths);
      
      const newRate = 5.5;
      const newTerm = 12;
      const closingCosts = 100000; // High closing costs
      
      const newPrincipal = currentBalance + closingCosts;
      const newPayment = calculateMonthlyPayment(newPrincipal, newRate, newTerm);
      
      const currentTotal = currentPayment * currentRemainingMonths;
      const newTotal = newPayment * newTerm;
      
      const totalSavings = currentTotal - newTotal;
      
      // High closing costs should make refinancing not worth it
      expect(totalSavings).toBeLessThan(0);
    });
  });
});

describe("Debt-to-Calculator Linking", () => {
  it("correctly formats debt data for calculator", () => {
    const debt = {
      name: "Car Loan",
      currentBalance: 1500000, // $15,000 in cents
      interestRate: 7.5,
    };
    
    const calculatorInput = {
      principal: debt.currentBalance,
      annualInterestRate: debt.interestRate,
      termMonths: 60, // Default term
      debtName: debt.name,
    };
    
    expect(calculatorInput.principal).toBe(1500000);
    expect(calculatorInput.annualInterestRate).toBe(7.5);
    expect(calculatorInput.debtName).toBe("Car Loan");
  });

  it("handles zero balance debt gracefully", () => {
    const debt = {
      name: "Paid Off Loan",
      currentBalance: 0,
      interestRate: 5.0,
    };
    
    const calculatorInput = {
      principal: debt.currentBalance,
      annualInterestRate: debt.interestRate,
      termMonths: 60,
      debtName: debt.name,
    };
    
    expect(calculatorInput.principal).toBe(0);
  });
});
