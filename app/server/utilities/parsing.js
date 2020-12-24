const parseAsInt = (string) => {
  const number = parseInt(string, 10);
  if (Number.isNaN(number)) {
    return null;
  }
  return number;
};

module.exports = { parseAsInt };
