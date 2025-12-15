import { describe, it, expect } from "vitest";
import {
  calculateMonthlyPayment,
  generateAmortizationSchedule,
  compareExtraPayments,
  calculateAffordability,
  formatCurrency,
  getLoanSummary,
} from "./loanCalculator";

describe("Loan Calculator", () => {
  describe("calculateMonthlyPayment", () => {
    it("calculates correct monthly payment for standard loan", () => {
      // $25,000 loan at 6.5% for 60 months
      const result = calculateMonthlyPayment({
        principal: 2500000, // $25,000 in cents
        annualInterestRate: 6.5,
        termMonths: 60,
      });

      // Expected monthly payment is approximately $489.15
      expect(result.monthlyPayment).toBeGreaterThan(48800);
      expect(result.monthlyPayment).toBeLessThan(49000);
      expect(result.principal).toBe(2500000);
    });

    it("handles 0% interest rate", () => {
      const result = calculateMonthlyPayment({
        principal: 1200000, // $12,000
        annualInterestRate: 0,
        termMonths: 12,
      });

      // Should be exactly $1,000/month
      expect(result.monthlyPayment).toBe(100000);
      expect(result.totalInterest).toBe(0);
    });

    it("calculates total interest correctly", () => {
      const result = calculateMonthlyPayment({
        principal: 2000000, // $20,000
        annualInterestRate: 5,
        termMonths: 48,
      });

      // Total payment should be greater than principal
      expect(result.totalPayment).toBeGreaterThan(result.principal);
      expect(result.totalInterest).toBe(result.totalPayment - result.principal);
    });

    it("calculates effective annual rate", () => {
      const result = calculateMonthlyPayment({
        principal: 1000000,
        annualInterestRate: 12,
        termMonths: 12,
      });

      // Effective rate should be slightly higher than nominal rate
      expect(result.effectiveRate).toBeGreaterThan(12);
      expect(result.effectiveRate).toBeLessThan(13);
    });
  });

  describe("generateAmortizationSchedule", () => {
    it("generates correct number of payments", () => {
      const schedule = generateAmortizationSchedule({
        principal: 1000000,
        annualInterestRate: 6,
        termMonths: 24,
      });

      expect(schedule.entries.length).toBe(24);
      expect(schedule.summary.monthsToPayoff).toBe(24);
    });

    it("ends with zero balance", () => {
      const schedule = generateAmortizationSchedule({
        principal: 1500000,
        annualInterestRate: 7.5,
        termMonths: 36,
      });

      const lastEntry = schedule.entries[schedule.entries.length - 1];
      expect(lastEntry.balance).toBe(0);
    });

    it("cumulative principal equals original principal", () => {
      const principal = 2000000;
      const schedule = generateAmortizationSchedule({
        principal,
        annualInterestRate: 5.5,
        termMonths: 48,
      });

      const lastEntry = schedule.entries[schedule.entries.length - 1];
      // Allow small rounding difference
      expect(Math.abs(lastEntry.cumulativePrincipal - principal)).toBeLessThan(100);
    });

    it("reduces payoff time with extra payments", () => {
      const baseSchedule = generateAmortizationSchedule({
        principal: 2500000,
        annualInterestRate: 6.5,
        termMonths: 60,
        extraMonthlyPayment: 0,
      });

      const extraSchedule = generateAmortizationSchedule({
        principal: 2500000,
        annualInterestRate: 6.5,
        termMonths: 60,
        extraMonthlyPayment: 10000, // $100 extra
      });

      expect(extraSchedule.summary.monthsToPayoff).toBeLessThan(
        baseSchedule.summary.monthsToPayoff
      );
      expect(extraSchedule.summary.totalInterest).toBeLessThan(
        baseSchedule.summary.totalInterest
      );
    });
  });

  describe("compareExtraPayments", () => {
    it("calculates interest savings correctly", () => {
      const comparison = compareExtraPayments({
        principal: 2500000,
        annualInterestRate: 6.5,
        termMonths: 60,
        extraMonthlyPayment: 10000,
      });

      expect(comparison.savings.interestSaved).toBeGreaterThan(0);
      expect(comparison.savings.timeSavedMonths).toBeGreaterThan(0);
      expect(comparison.withExtra.totalInterest).toBeLessThan(
        comparison.withoutExtra.totalInterest
      );
    });

    it("shows faster payoff with extra payments", () => {
      const comparison = compareExtraPayments({
        principal: 3000000,
        annualInterestRate: 8,
        termMonths: 72,
        extraMonthlyPayment: 15000,
      });

      expect(comparison.withExtra.monthsToPayoff).toBeLessThan(
        comparison.withoutExtra.monthsToPayoff
      );
    });
  });

  describe("calculateAffordability", () => {
    it("calculates max monthly payment based on income", () => {
      const result = calculateAffordability(500000); // $5,000/month income

      // Default 36% DTI ratio
      expect(result.maxMonthlyPayment).toBe(180000); // $1,800
    });

    it("respects custom DTI ratio", () => {
      const result = calculateAffordability(400000, 28);

      expect(result.maxMonthlyPayment).toBe(112000); // $1,120
    });

    it("estimates reasonable max loan amount", () => {
      const result = calculateAffordability(600000);

      // Should estimate a reasonable loan amount
      expect(result.estimatedMaxLoan).toBeGreaterThan(0);
      expect(result.estimatedMaxLoan).toBeLessThan(20000000); // Less than $200k
    });
  });

  describe("formatCurrency", () => {
    it("formats cents to dollars correctly", () => {
      expect(formatCurrency(100000)).toBe("$1,000.00");
      expect(formatCurrency(2500000)).toBe("$25,000.00");
      expect(formatCurrency(99)).toBe("$0.99");
    });
  });

  describe("getLoanSummary", () => {
    it("returns formatted summary", () => {
      const summary = getLoanSummary({
        principal: 2500000,
        annualInterestRate: 6.5,
        termMonths: 60,
      });

      expect(summary.monthlyPayment).toMatch(/^\$[\d,]+\.\d{2}$/);
      expect(summary.totalCost).toMatch(/^\$[\d,]+\.\d{2}$/);
      expect(summary.totalInterest).toMatch(/^\$[\d,]+\.\d{2}$/);
      expect(summary.interestPercentage).toBeGreaterThan(0);
      expect(summary.payoffDate).toBeTruthy();
    });

    it("calculates interest percentage correctly", () => {
      const summary = getLoanSummary({
        principal: 1000000,
        annualInterestRate: 10,
        termMonths: 36,
      });

      // Interest percentage should be reasonable
      expect(summary.interestPercentage).toBeGreaterThan(10);
      expect(summary.interestPercentage).toBeLessThan(30);
    });
  });
});
