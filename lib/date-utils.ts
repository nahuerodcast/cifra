import { format, parse, isValid } from "date-fns";
import { es } from "date-fns/locale";

// Get current month key in YYYY-MM format
export const getCurrentMonthKey = (): string => {
  return format(new Date(), "yyyy-MM");
};

// Convert month key (YYYY-MM) to a proper date
export const monthKeyToDate = (monthKey: string): Date => {
  // Parse as YYYY-MM-01 to avoid timezone issues
  const date = parse(`${monthKey}-01`, "yyyy-MM-dd", new Date());
  return date;
};

// Format month key to readable format
export const formatMonthKey = (monthKey: string): string => {
  try {
    const date = monthKeyToDate(monthKey);
    if (!isValid(date)) {
      return monthKey; // Fallback to original if invalid
    }
    return format(date, "MMMM yyyy", { locale: es });
  } catch (error) {
    return monthKey;
  }
};

// Format month key to short format (MMM yy)
export const formatMonthKeyShort = (monthKey: string): string => {
  try {
    const date = monthKeyToDate(monthKey);
    if (!isValid(date)) {
      return monthKey;
    }
    return format(date, "MMM yy", { locale: es });
  } catch (error) {
    return monthKey;
  }
};

// Validate if a month key is valid
export const isValidMonthKey = (monthKey: string): boolean => {
  try {
    const date = monthKeyToDate(monthKey);
    return isValid(date);
  } catch {
    return false;
  }
};

// Convert date to month key
export const dateToMonthKey = (date: Date): string => {
  return format(date, "yyyy-MM");
};

// Get next month key
export const getNextMonthKey = (monthKey: string): string => {
  try {
    const date = monthKeyToDate(monthKey);
    const nextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1);
    return dateToMonthKey(nextMonth);
  } catch (error) {
    return monthKey;
  }
};

// Get previous month key
export const getPreviousMonthKey = (monthKey: string): string => {
  try {
    const date = monthKeyToDate(monthKey);
    const previousMonth = new Date(date.getFullYear(), date.getMonth() - 1, 1);
    return dateToMonthKey(previousMonth);
  } catch (error) {
    return monthKey;
  }
};
