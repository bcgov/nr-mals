import { LICENCE_TYPE_ID_DAIRY_FARM } from "./constants";

export const getLicenceTypeConfiguration = (licenceTypeId) => {
  switch (licenceTypeId) {
    case LICENCE_TYPE_ID_DAIRY_FARM:
      return {
        replaceExpiryDateWithIrmaNumber: true,
      };
    default:
      return {};
  }
};
