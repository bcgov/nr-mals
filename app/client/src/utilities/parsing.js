import isValid from "date-fns/isValid";
import parseISO from "date-fns/parseISO";

export const parseAsInt = (string) => {
  const number = parseInt(string, 10);
  if (Number.isNaN(number)) {
    return null;
  }
  return number;
};

export const parseAsFloat = (string) => {
  const number = parseFloat(string);
  if (Number.isNaN(number)) {
    return null;
  }
  return number;
};

export const parseAsDate = (string) => {
  try {
    const date = parseISO(string);
    if (isValid(date)) {
      return date;
    }

    return null;
  } catch {
    return null;
  }
};

export const isNullOrEmpty = (obj) => {
  return obj === null || obj === undefined || obj.length === 0;
};

export const isTruthy = (value) => {
  if (value === undefined) return value;

  const isStr = typeof value === 'string' || value instanceof String;
  const trueStrings = ['true', 't', 'yes', 'y', '1'];
  return value === true || value === 1 || isStr && trueStrings.includes(value.toLowerCase());
};
