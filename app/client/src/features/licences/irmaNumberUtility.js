export const validateIrmaNumber = (irmaNumber) => {
  if (irmaNumber === undefined || irmaNumber === null) {
    return true;
  }
  return irmaNumber.match(/^$|^\d{2}-?\d{3}$/g) !== null;
};

export const formatIrmaNumber = (irmaNumber) => {
  if (
    irmaNumber !== undefined &&
    irmaNumber !== null &&
    irmaNumber.length === 5
  ) {
    return `${irmaNumber.substring(0, 2)}-${irmaNumber.substring(2)}`;
  }
  return irmaNumber;
};

export const parseIrmaNumber = (string) => {
  if (string === undefined || string === null) {
    return string;
  }
  return string.replace("-", "");
};
