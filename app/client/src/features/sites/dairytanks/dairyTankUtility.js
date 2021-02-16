import { DAIRY_TANK_STATUS } from "../../../utilities/constants";

export const validateDairyTanks = (dairyTanks, setError, clearErrors) => {
  let errorCount = 0;

  return errorCount === 0;
};

export const formatDairyTanks = (dairyTanks, dairyTankDates, siteId) => {
  if (dairyTanks === undefined) {
    return undefined;
  }

  return dairyTanks.map((dairyTank, index) => {
    return {
      ...dairyTank,
      ...dairyTankDates[index],
      siteId: siteId,
    };
  });
};
