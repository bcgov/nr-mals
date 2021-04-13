const parseAsInt = (string) => {
  const number = parseInt(string, 10);
  if (Number.isNaN(number)) {
    return null;
  }
  return number;
};

const parseAsFloat = (string) => {
  const number = parseFloat(string);
  if (Number.isNaN(number)) {
    return null;
  }
  return number;
};

const parseAsDate = (value) => {
  if (value === null || value === undefined || value.length === 0) {
    return undefined;
  }

  return new Date(value);
};

module.exports = { parseAsInt, parseAsFloat, parseAsDate };
