const parseAsInt = (string) => {
  const number = parseInt(string, 10);
  if (Number.isNaN(number)) {
    return undefined;
  }
  return number;
};

const parseAsFloat = (string) => {
  const number = parseFloat(string);
  if (Number.isNaN(number)) {
    return undefined;
  }
  return number;
};

// Accepts a 4-digit year as a string or number, anything else is undefined
const parseAsYear = (value) => {
  const string = String(value ?? "").trim();
  return /^[1-9]\d{3}$/.test(string) ? parseInt(string, 10) : undefined;
};

const parseAsDate = (value) => {
  if (value === null || value === undefined || value.length === 0) {
    return undefined;
  }

  return new Date(value);
};

module.exports = { parseAsInt, parseAsFloat, parseAsYear, parseAsDate };
