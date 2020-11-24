import { REGISTRANT_STATUS } from "../../utilities/constants";

export const validateRegistrants = (registrants, setError, clearErrors) => {
  if (!registrants || registrants.length === 0) {
    setError("noRegistrants", {
      type: "invalid",
      message: "A licence must have at least one registrant.",
    });
    return false;
  }

  let errorCount = 0;

  registrants.forEach((registrant, index) => {
    if (
      registrant.status === REGISTRANT_STATUS.DELETED ||
      registrant.status === REGISTRANT_STATUS.CANCELLED
    ) {
      clearErrors(`registrants[${index}]`);
      return;
    }

    // validate phone numbers
    if (!registrant.primaryPhone.match(/^$|\(\d{3}\) \d{3}-\d{4}/g)) {
      setError(`registrants[${index}].primaryPhone`, {
        type: "invalid",
      });
      errorCount += 1;
    }

    // validate names
    if (
      !(
        (registrant.firstName.trim().length > 0 &&
          registrant.lastName.trim().length > 0) ||
        registrant.companyName.trim().length > 0
      )
    ) {
      setError(`registrants[${index}].names`, {
        type: "invalid",
      });
      errorCount += 1;
    }
  });

  return errorCount === 0;
};

export const formatRegistrants = (registrants) => {
  if (registrants === undefined) {
    return undefined;
  }

  return registrants.map((registrant) => {
    return {
      ...registrant,
      primaryPhone: registrant.primaryPhone.replace(/\D/g, ""),
    };
  });
};
