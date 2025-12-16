import format from "date-fns/format";
import parseISO from "date-fns/parseISO";
import canadianEnglish from "date-fns/locale/en-CA";

import { parseAsFloat } from "./parsing";

export const DATE_FORMAT = "P"; // locale-specific short date
export const DATE_TIME_FORMAT = "Pp"; // locale-specific short date with time in minutes

export const formatDate = (date: Date) => {
  try {
    return format(date, DATE_FORMAT, { locale: canadianEnglish });
  } catch {
    return null;
  }
};

export const formatDateString = (dateString: string) => {
  try {
    const date = parseISO(dateString);
    return formatDate(date);
  } catch {
    return null;
  }
};

export const formatDateTime = (date: Date) => {
  try {
    return format(date, DATE_TIME_FORMAT, { locale: canadianEnglish });
  } catch {
    return null;
  }
};

export const formatDateTimeString = (dateString: string) => {
  try {
    const date = parseISO(dateString);
    return formatDateTime(date);
  } catch {
    return null;
  }
};

export const formatMoney = (money: number) => {
  if (money === null) {
    return null;
  }
  return `$${money.toFixed(2)}`;
};

export const formatMoneyString = (moneyString: string) => {
  const money = parseAsFloat(moneyString);
  if (money === null) {
    return null;
  }
  return formatMoney(money);
};

export const formatBoolean = (boolean: boolean) => {
  return boolean ? "Yes" : "No";
};

export const formatNumber = (number: number) => {
  return number === null ? null : number.toString();
};

export const formatPhoneNumber = (number: string) => {
  if (!number || number.length < 10) {
    return "";
  }

  const start = number.substring(0, 3);
  const middle = number.substring(3, 6);
  const end = number.substring(6, 10);

  return `(${start}) ${middle}-${end}`;
};

export const formatListShorten = (
  list: string,
  inputSeparator: string = "~",
  outputSeparator: string = "; ",
  limit: number = 2
) => {
  if (list === undefined || list === null) {
    return undefined;
  }

  const array = list.split(inputSeparator, limit);

  return array
    .filter(
      (element) =>
        element !== null && element !== undefined && element.length > 0
    )
    .join(outputSeparator);
};

export const pluralize = (count: number, singular: string, plural?: string) => {
  if (count === 1) {
    return singular;
  }
  return plural || `${singular}s`;
};

export const displayPersonName = (person: any, displayMiddleName = false) => {
  let name: string = person.surname || "";

  if (person.givenName1 || person.givenName2 || person.givenName3) {
    name += ", ";
    if (person.givenName1) {
      name += `${person.givenName1} `;
    }
    if (displayMiddleName) {
      if (person.givenName2) {
        name += `${person.givenName2} `;
      }
      if (person.givenName3) {
        name += `${person.givenName3} `;
      }
    }
  }

  return name.trim();
};
