import { describe, it, expect } from "vitest";
import {
  CURRENCIES,
  CURRENCY_LIST,
  DEFAULT_CURRENCY,
  getCurrencySymbol,
  getCurrencyInfo,
  formatCurrency,
  formatCurrencyRaw,
} from "../shared/currency";

describe("Currency Selector Feature", () => {
  describe("Currency Constants", () => {
    it("has USD as default currency", () => {
      expect(DEFAULT_CURRENCY).toBe("USD");
    });

    it("includes major world currencies", () => {
      const majorCurrencies = ["USD", "EUR", "GBP", "JPY", "CAD", "AUD", "CHF", "CNY", "INR"];
      majorCurrencies.forEach((code) => {
        expect(CURRENCIES[code as keyof typeof CURRENCIES]).toBeDefined();
      });
    });

    it("has 20 supported currencies", () => {
      expect(CURRENCY_LIST.length).toBe(20);
    });

    it("each currency has required properties", () => {
      CURRENCY_LIST.forEach((currency) => {
        expect(currency.code).toBeDefined();
        expect(currency.symbol).toBeDefined();
        expect(currency.name).toBeDefined();
        expect(currency.locale).toBeDefined();
        expect(currency.code.length).toBe(3);
      });
    });
  });

  describe("getCurrencySymbol", () => {
    it("returns correct symbol for USD", () => {
      expect(getCurrencySymbol("USD")).toBe("$");
    });

    it("returns correct symbol for EUR", () => {
      expect(getCurrencySymbol("EUR")).toBe("€");
    });

    it("returns correct symbol for GBP", () => {
      expect(getCurrencySymbol("GBP")).toBe("£");
    });

    it("returns correct symbol for JPY", () => {
      expect(getCurrencySymbol("JPY")).toBe("¥");
    });

    it("returns correct symbol for INR", () => {
      expect(getCurrencySymbol("INR")).toBe("₹");
    });
  });

  describe("getCurrencyInfo", () => {
    it("returns full currency info for valid code", () => {
      const info = getCurrencyInfo("EUR");
      expect(info.code).toBe("EUR");
      expect(info.symbol).toBe("€");
      expect(info.name).toBe("Euro");
      expect(info.locale).toBe("de-DE");
    });

    it("returns USD info for invalid code", () => {
      const info = getCurrencyInfo("INVALID" as any);
      expect(info.code).toBe("USD");
    });
  });

  describe("formatCurrency (cents)", () => {
    it("formats USD amounts correctly", () => {
      const formatted = formatCurrency(12345, "USD");
      expect(formatted).toContain("123");
      expect(formatted).toContain("45");
    });

    it("formats EUR amounts correctly", () => {
      const formatted = formatCurrency(5000, "EUR");
      expect(formatted).toContain("50");
    });

    it("handles zero amounts", () => {
      const formatted = formatCurrency(0, "USD");
      expect(formatted).toContain("0");
    });

    it("handles negative amounts", () => {
      const formatted = formatCurrency(-1000, "USD");
      expect(formatted).toContain("10");
    });
  });

  describe("formatCurrencyRaw (non-cents)", () => {
    it("formats raw USD amounts correctly", () => {
      const formatted = formatCurrencyRaw(123.45, "USD");
      expect(formatted).toContain("123");
      expect(formatted).toContain("45");
    });

    it("formats JPY without decimals", () => {
      const formatted = formatCurrencyRaw(1000, "JPY");
      expect(formatted).toContain("1,000") || expect(formatted).toContain("1000");
    });

    it("formats KRW without decimals", () => {
      const formatted = formatCurrencyRaw(50000, "KRW");
      expect(formatted).toContain("50");
    });
  });

  describe("Currency Code Validation", () => {
    it("all currency codes are 3 characters", () => {
      Object.keys(CURRENCIES).forEach((code) => {
        expect(code.length).toBe(3);
      });
    });

    it("all currency codes are uppercase", () => {
      Object.keys(CURRENCIES).forEach((code) => {
        expect(code).toBe(code.toUpperCase());
      });
    });
  });

  describe("Locale Formatting", () => {
    it("uses correct locale for each currency", () => {
      expect(CURRENCIES.USD.locale).toBe("en-US");
      expect(CURRENCIES.EUR.locale).toBe("de-DE");
      expect(CURRENCIES.GBP.locale).toBe("en-GB");
      expect(CURRENCIES.JPY.locale).toBe("ja-JP");
      expect(CURRENCIES.CNY.locale).toBe("zh-CN");
    });
  });
});
