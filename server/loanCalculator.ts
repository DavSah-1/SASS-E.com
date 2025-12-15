/**
 * Loan Interest Calculator
 * Provides comprehensive loan analysis including monthly payments,
 * total interest, amortization schedules, and extra payment scenarios
 */

export interface LoanInput {
  principal: number; // Loan amount in cents
  annualInterestRate: number; // Annual interest rate as percentage (e.g., 5.5 for 5.5%)
  termMonths: number; // Loan term in months
  extraMonthlyPayment?: number; // Optional extra payment per month in cents
}

export interface MonthlyPaymentResult {
  monthlyPayment: number; // Monthly payment in cents
  totalPayment: number; // Total amount paid over loan lifetime
  totalInterest: number; // Total interest paid
  principal: number; // Original principal
  effectiveRate: number; // Effective annual rate
}

export interface AmortizationEntry {
  month: number;
  payment: number; // Total payment this month
  principal: number; // Principal portion
  interest: number; // Interest portion
  balance: number; // Remaining balance after payment
  cumulativeInterest: number; // Total interest paid to date
  cumulativePrincipal: number; // Total principal paid to date
}

export interface AmortizationSchedule {
  entries: AmortizationEntry[];
  summary: {
    totalPayments: number;
    totalInterest: number;
    totalPrincipal: number;
    monthsToPayoff: number;
    lastPaymentDate: Date;
  };
}

export interface ExtraPaymentComparison {
  withoutExtra: {
    monthlyPayment: number;
    totalInterest: number;
    totalPayment: number;
    monthsToPayoff: number;
  };
  withExtra: {
    monthlyPayment: number;
    totalInterest: number;
    totalPayment: number;
    monthsToPayoff: number;
  };
  savings: {
    interestSaved: number;
    timeSavedMonths: number;
    totalSaved: number;
  };
}

/**
 * Calculate monthly payment using the standard amortization formula
 * M = P * [r(1+r)^n] / [(1+r)^n - 1]
 * Where:
 *   M = monthly payment
 *   P = principal
 *   r = monthly interest rate
 *   n = number of payments
 */
export function calculateMonthlyPayment(input: LoanInput): MonthlyPaymentResult {
  const { principal, annualInterestRate, termMonths } = input;
  
  // Handle edge case of 0% interest
  if (annualInterestRate === 0) {
    const monthlyPayment = Math.round(principal / termMonths);
    return {
      monthlyPayment,
      totalPayment: monthlyPayment * termMonths,
      totalInterest: 0,
      principal,
      effectiveRate: 0,
    };
  }
  
  // Convert annual rate to monthly decimal
  const monthlyRate = annualInterestRate / 100 / 12;
  
  // Calculate monthly payment using amortization formula
  const numerator = monthlyRate * Math.pow(1 + monthlyRate, termMonths);
  const denominator = Math.pow(1 + monthlyRate, termMonths) - 1;
  const monthlyPayment = Math.round(principal * (numerator / denominator));
  
  const totalPayment = monthlyPayment * termMonths;
  const totalInterest = totalPayment - principal;
  
  // Calculate effective annual rate (APY)
  const effectiveRate = (Math.pow(1 + monthlyRate, 12) - 1) * 100;
  
  return {
    monthlyPayment,
    totalPayment,
    totalInterest,
    principal,
    effectiveRate: Math.round(effectiveRate * 100) / 100,
  };
}

/**
 * Generate full amortization schedule showing each payment breakdown
 */
export function generateAmortizationSchedule(input: LoanInput): AmortizationSchedule {
  const { principal, annualInterestRate, termMonths, extraMonthlyPayment = 0 } = input;
  
  const paymentResult = calculateMonthlyPayment(input);
  const monthlyRate = annualInterestRate / 100 / 12;
  const basePayment = paymentResult.monthlyPayment;
  const totalMonthlyPayment = basePayment + extraMonthlyPayment;
  
  const entries: AmortizationEntry[] = [];
  let balance = principal;
  let cumulativeInterest = 0;
  let cumulativePrincipal = 0;
  let month = 0;
  
  while (balance > 0 && month < termMonths * 2) { // Safety limit
    month++;
    
    // Calculate interest for this month
    const interestPayment = Math.round(balance * monthlyRate);
    
    // Determine payment amount (handle final payment)
    let payment = totalMonthlyPayment;
    let principalPayment = payment - interestPayment;
    
    // If this would overpay, adjust final payment
    if (principalPayment >= balance) {
      principalPayment = balance;
      payment = principalPayment + interestPayment;
    }
    
    // Update running totals
    cumulativeInterest += interestPayment;
    cumulativePrincipal += principalPayment;
    balance -= principalPayment;
    
    // Ensure balance doesn't go negative due to rounding
    if (balance < 0) balance = 0;
    
    entries.push({
      month,
      payment,
      principal: principalPayment,
      interest: interestPayment,
      balance,
      cumulativeInterest,
      cumulativePrincipal,
    });
    
    // Exit if loan is paid off
    if (balance === 0) break;
  }
  
  // Calculate last payment date
  const today = new Date();
  const lastPaymentDate = new Date(today);
  lastPaymentDate.setMonth(lastPaymentDate.getMonth() + entries.length);
  
  return {
    entries,
    summary: {
      totalPayments: entries.reduce((sum, e) => sum + e.payment, 0),
      totalInterest: cumulativeInterest,
      totalPrincipal: cumulativePrincipal,
      monthsToPayoff: entries.length,
      lastPaymentDate,
    },
  };
}

/**
 * Compare loan with and without extra payments
 */
export function compareExtraPayments(input: LoanInput): ExtraPaymentComparison {
  // Calculate without extra payments
  const withoutExtra = generateAmortizationSchedule({
    ...input,
    extraMonthlyPayment: 0,
  });
  
  // Calculate with extra payments
  const withExtra = generateAmortizationSchedule(input);
  
  const basePayment = calculateMonthlyPayment(input).monthlyPayment;
  
  return {
    withoutExtra: {
      monthlyPayment: basePayment,
      totalInterest: withoutExtra.summary.totalInterest,
      totalPayment: withoutExtra.summary.totalPayments,
      monthsToPayoff: withoutExtra.summary.monthsToPayoff,
    },
    withExtra: {
      monthlyPayment: basePayment + (input.extraMonthlyPayment || 0),
      totalInterest: withExtra.summary.totalInterest,
      totalPayment: withExtra.summary.totalPayments,
      monthsToPayoff: withExtra.summary.monthsToPayoff,
    },
    savings: {
      interestSaved: withoutExtra.summary.totalInterest - withExtra.summary.totalInterest,
      timeSavedMonths: withoutExtra.summary.monthsToPayoff - withExtra.summary.monthsToPayoff,
      totalSaved: withoutExtra.summary.totalPayments - withExtra.summary.totalPayments,
    },
  };
}

/**
 * Calculate loan affordability based on income
 */
export function calculateAffordability(
  monthlyIncome: number,
  maxDebtToIncomeRatio: number = 36
): { maxMonthlyPayment: number; estimatedMaxLoan: number } {
  const maxMonthlyPayment = Math.round(monthlyIncome * (maxDebtToIncomeRatio / 100));
  
  // Estimate max loan assuming 6% rate and 60-month term
  const assumedRate = 6;
  const assumedTerm = 60;
  const monthlyRate = assumedRate / 100 / 12;
  const denominator = (monthlyRate * Math.pow(1 + monthlyRate, assumedTerm)) / 
                      (Math.pow(1 + monthlyRate, assumedTerm) - 1);
  const estimatedMaxLoan = Math.round(maxMonthlyPayment / denominator);
  
  return {
    maxMonthlyPayment,
    estimatedMaxLoan,
  };
}

/**
 * Format cents to currency string
 */
export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
}

/**
 * Get loan summary with key metrics
 */
export function getLoanSummary(input: LoanInput): {
  monthlyPayment: string;
  totalCost: string;
  totalInterest: string;
  interestPercentage: number;
  payoffDate: string;
  costBreakdown: { principal: number; interest: number };
} {
  const payment = calculateMonthlyPayment(input);
  const schedule = generateAmortizationSchedule(input);
  
  const interestPercentage = Math.round((payment.totalInterest / payment.principal) * 100);
  
  return {
    monthlyPayment: formatCurrency(payment.monthlyPayment),
    totalCost: formatCurrency(payment.totalPayment),
    totalInterest: formatCurrency(payment.totalInterest),
    interestPercentage,
    payoffDate: schedule.summary.lastPaymentDate.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    }),
    costBreakdown: {
      principal: input.principal,
      interest: payment.totalInterest,
    },
  };
}
