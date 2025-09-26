import {
  LICENCE_TYPE_ID_HIDE_DEALER,
  LICENCE_TYPE_ID_LIVESTOCK_DEALER,
  LICENCE_TYPE_ID_LIVESTOCK_DEALER_AGENT,
  LICENCE_TYPE_ID_GAME_FARM,
  LICENCE_TYPE_ID_SLAUGHTERHOUSE,
  LICENCE_TYPE_ID_DAIRY_FARM,
  LICENCE_TYPE_ID_FUR_FARM,
  LICENCE_TYPE_ID_PUBLIC_SALE_YARD_OPERATOR,
  LICENCE_TYPE_ID_APIARY,
  LICENCE_TYPE_ID_VETERINARY_DRUG,
  LICENCE_TYPE_ID_DISPENSER,
  LICENCE_TYPE_ID_BULK_TANK_MILK_GRADER,
  LICENCE_TYPE_ID_MEDICATED_FEED,
  LICENCE_TYPE_ID_PURCHASE_LIVE_POULTRY,
  LICENCE_TYPE_ID_LIMITED_MEDICATED_FEED,
} from "./constants";

// eslint-disable-next-line import/prefer-default-export
export const getLicenceTypeConfiguration = (licenceTypeId) => {
  switch (licenceTypeId) {
    case LICENCE_TYPE_ID_HIDE_DEALER:
      return { expiryMonth: 3 };
    case LICENCE_TYPE_ID_LIVESTOCK_DEALER:
      return { expiryMonth: 3 };
    case LICENCE_TYPE_ID_LIVESTOCK_DEALER_AGENT:
      return { expiryMonth: 3 };
    case LICENCE_TYPE_ID_GAME_FARM:
      return { expiryMonth: 1 };
    case LICENCE_TYPE_ID_SLAUGHTERHOUSE:
      return { expiryMonth: 3 };
    case LICENCE_TYPE_ID_DAIRY_FARM:
      return { replaceExpiryDateWithIrmaNumber: true };
    case LICENCE_TYPE_ID_FUR_FARM:
      return { expiryMonth: 3 };
    case LICENCE_TYPE_ID_PUBLIC_SALE_YARD_OPERATOR:
      return { expiryMonth: 12 };
    case LICENCE_TYPE_ID_APIARY:
      return {
        replacePaymentReceivedWithHiveFields: true,
        expiryInTwoYears: true,
      };
    case LICENCE_TYPE_ID_VETERINARY_DRUG:
      return { expiryMonth: 3, yearsAddedToExpiryDate: 5 };
    case LICENCE_TYPE_ID_DISPENSER:
      return { expiryMonth: 3, yearsAddedToExpiryDate: 4 };
    case LICENCE_TYPE_ID_BULK_TANK_MILK_GRADER:
      return { expiryMonth: 12 };
    case LICENCE_TYPE_ID_MEDICATED_FEED:
      return { expiryMonth: 3 };
    case LICENCE_TYPE_ID_PURCHASE_LIVE_POULTRY:
      return { expiryMonth: 3 };
    case LICENCE_TYPE_ID_LIMITED_MEDICATED_FEED:
      return { expiryMonth: 3 };

    default:
      return {};
  }
};
