import {
  LICENCE_TYPE_ID_DAIRY_FARM,
  LICENCE_TYPE_ID_APIARY,
} from "./constants";

export const getLicenceTypeConfiguration = (licenceTypeId) => {
  switch (licenceTypeId) {
    case LICENCE_TYPE_ID_DAIRY_FARM:
      return {
        replaceExpiryDateWithIrmaNumber: true,
      };
    case LICENCE_TYPE_ID_APIARY:
      return {
        replacePaymentReceivedWithHiveFields: true,
      };
    default:
      return {};
  }
};
