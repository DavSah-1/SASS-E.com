import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { trpc } from "@/lib/trpc";
import { 
  CurrencyCode, 
  DEFAULT_CURRENCY, 
  getCurrencySymbol, 
  getCurrencyInfo,
  formatCurrency,
  formatCurrencyRaw,
  CURRENCIES,
  CURRENCY_LIST
} from "@shared/currency";

interface CurrencyContextType {
  currency: CurrencyCode;
  setCurrency: (code: CurrencyCode) => void;
  symbol: string;
  format: (amountInCents: number) => string;
  formatRaw: (amount: number) => string;
  isLoading: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>(DEFAULT_CURRENCY);
  const [isLoading, setIsLoading] = useState(true);

  // Get user's currency preference from auth
  const { data: user } = trpc.auth.me.useQuery();
  
  // Update currency mutation
  const updateCurrency = trpc.system.updateCurrency.useMutation({
    onSuccess: () => {
      // Currency updated successfully
    },
  });

  // Load user's currency preference
  useEffect(() => {
    if (user?.preferredCurrency) {
      const userCurrency = user.preferredCurrency as CurrencyCode;
      if (CURRENCIES[userCurrency]) {
        setCurrencyState(userCurrency);
      }
    }
    setIsLoading(false);
  }, [user]);

  const setCurrency = (code: CurrencyCode) => {
    setCurrencyState(code);
    // Save to database
    updateCurrency.mutate({ currency: code });
  };

  const format = (amountInCents: number) => {
    return formatCurrency(amountInCents, currency);
  };

  const formatRaw = (amount: number) => {
    return formatCurrencyRaw(amount, currency);
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        symbol: getCurrencySymbol(currency),
        format,
        formatRaw,
        isLoading,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    // Return default values if used outside provider
    return {
      currency: DEFAULT_CURRENCY,
      setCurrency: () => {},
      symbol: getCurrencySymbol(DEFAULT_CURRENCY),
      format: (amountInCents: number) => formatCurrency(amountInCents, DEFAULT_CURRENCY),
      formatRaw: (amount: number) => formatCurrencyRaw(amount, DEFAULT_CURRENCY),
      isLoading: false,
    };
  }
  return context;
}

// Re-export for convenience
export { CURRENCIES, CURRENCY_LIST, type CurrencyCode };
