import { DAIRY_TANK_STATUS } from "../../../utilities/constants";

export const validateDairyTanks = (dairyTanks, setError, clearErrors) => {
  //   if (!dairyTanks || dairyTanks.length === 0) {
  //     setError("noDairyTank", {
  //       type: "invalid",
  //       message: "A licence must have at least one dairyTank.",
  //     });
  //     return false;
  //   }

  let errorCount = 0;

  //   dairyTanks.forEach((dairyTank, index) => {
  //     if (
  //       dairyTank.status === DAIRY_TANK_STATUS.DELETED ||
  //       dairyTank.status === DAIRY_TANK_STATUS.CANCELLED
  //     ) {
  //       clearErrors(`dairyTanks[${index}]`);
  //       return;
  //     }

  //     // validate phone numbers
  //     if (!dairyTank.primaryPhone.match(/^$|\(\d{3}\) \d{3}-\d{4}/g)) {
  //       setError(`dairyTanks[${index}].primaryPhone`, {
  //         type: "invalid",
  //       });
  //       errorCount += 1;
  //     }

  //     // validate names
  //     if (
  //       !(
  //         (dairyTank.firstName.trim().length > 0 &&
  //           dairyTank.lastName.trim().length > 0) ||
  //         dairyTank.companyName.trim().length > 0
  //       )
  //     ) {
  //       setError(`dairyTanks[${index}].names`, {
  //         type: "invalid",
  //       });
  //       errorCount += 1;
  //     }
  //   });

  return errorCount === 0;
};

export const formatDairyTanks = (dairyTanks, siteId) => {
  if (dairyTanks === undefined) {
    return undefined;
  }

  return dairyTanks.map((dairyTank) => {
    return {
      ...dairyTank,
      siteId: siteId,
    };
  });
};
