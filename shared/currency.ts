// Supported currencies with their symbols and locale formatting
export const CURRENCIES = {
  USD: { code: "USD", symbol: "$", name: "US Dollar", locale: "en-US" },
  EUR: { code: "EUR", symbol: "€", name: "Euro", locale: "de-DE" },
  GBP: { code: "GBP", symbol: "£", name: "British Pound", locale: "en-GB" },
  JPY: { code: "JPY", symbol: "¥", name: "Japanese Yen", locale: "ja-JP" },
  CAD: { code: "CAD", symbol: "C$", name: "Canadian Dollar", locale: "en-CA" },
  AUD: { code: "AUD", symbol: "A$", name: "Australian Dollar", locale: "en-AU" },
  CHF: { code: "CHF", symbol: "Fr", name: "Swiss Franc", locale: "de-CH" },
  CNY: { code: "CNY", symbol: "¥", name: "Chinese Yuan", locale: "zh-CN" },
  INR: { code: "INR", symbol: "₹", name: "Indian Rupee", locale: "en-IN" },
  MXN: { code: "MXN", symbol: "$", name: "Mexican Peso", locale: "es-MX" },
  BRL: { code: "BRL", symbol: "R$", name: "Brazilian Real", locale: "pt-BR" },
  KRW: { code: "KRW", symbol: "₩", name: "South Korean Won", locale: "ko-KR" },
  SGD: { code: "SGD", symbol: "S$", name: "Singapore Dollar", locale: "en-SG" },
  HKD: { code: "HKD", symbol: "HK$", name: "Hong Kong Dollar", locale: "zh-HK" },
  NZD: { code: "NZD", symbol: "NZ$", name: "New Zealand Dollar", locale: "en-NZ" },
  SEK: { code: "SEK", symbol: "kr", name: "Swedish Krona", locale: "sv-SE" },
  NOK: { code: "NOK", symbol: "kr", name: "Norwegian Krone", locale: "nb-NO" },
  DKK: { code: "DKK", symbol: "kr", name: "Danish Krone", locale: "da-DK" },
  ZAR: { code: "ZAR", symbol: "R", name: "South African Rand", locale: "en-ZA" },
  AED: { code: "AED", symbol: "د.إ", name: "UAE Dirham", locale: "ar-AE" },
} as const;

export type CurrencyCode = keyof typeof CURRENCIES;

export const DEFAULT_CURRENCY: CurrencyCode = "USD";

export function getCurrencySymbol(code: CurrencyCode): string {
  return CURRENCIES[code]?.symbol || "$";
}

export function getCurrencyInfo(code: CurrencyCode) {
  return CURRENCIES[code] || CURRENCIES.USD;
}

/**
 * Format an amount in cents to a currency string
 * @param amountInCents - Amount in cents (e.g., 1234 = $12.34)
 * @param currencyCode - Currency code (e.g., "USD")
 * @param options - Additional formatting options
 */
export function formatCurrency(
  amountInCents: number,
  currencyCode: CurrencyCode = "USD",
  options?: { showSymbol?: boolean; showCode?: boolean }
): string {
  const currency = CURRENCIES[currencyCode] || CURRENCIES.USD;
  const amount = amountInCents / 100;
  
  try {
    const formatted = new Intl.NumberFormat(currency.locale, {
      style: "currency",
      currency: currency.code,
      minimumFractionDigits: currency.code === "JPY" || currency.code === "KRW" ? 0 : 2,
      maximumFractionDigits: currency.code === "JPY" || currency.code === "KRW" ? 0 : 2,
    }).format(amount);
    
    if (options?.showCode) {
      return `${formatted} ${currency.code}`;
    }
    
    return formatted;
  } catch {
    // Fallback formatting
    const symbol = options?.showSymbol !== false ? currency.symbol : "";
    return `${symbol}${amount.toFixed(2)}`;
  }
}

/**
 * Format a raw amount (not in cents) to a currency string
 */
export function formatCurrencyRaw(
  amount: number,
  currencyCode: CurrencyCode = "USD"
): string {
  const currency = CURRENCIES[currencyCode] || CURRENCIES.USD;
  
  try {
    return new Intl.NumberFormat(currency.locale, {
      style: "currency",
      currency: currency.code,
      minimumFractionDigits: currency.code === "JPY" || currency.code === "KRW" ? 0 : 2,
      maximumFractionDigits: currency.code === "JPY" || currency.code === "KRW" ? 0 : 2,
    }).format(amount);
  } catch {
    return `${currency.symbol}${amount.toFixed(2)}`;
  }
}

export const CURRENCY_LIST = Object.values(CURRENCIES);
