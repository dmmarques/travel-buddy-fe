// lib/money.ts
import * as React from "react";

export function useCurrencyFormatter(currency = "EUR") {
  return React.useMemo(
    () =>
      new Intl.NumberFormat(undefined, {
        style: "currency",
        currency,
      }),
    [currency]
  );
}

export function parsePrice(input: string | undefined) {
  if (!input) return undefined;
  const parsed = Number.parseFloat(input.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : undefined;
}
