import { getLicenceTypeConfiguration } from "./licenceTypeUtility";
import * as constants from "./constants";

const { LICENCE_TYPE_ID_DAIRY_FARM, ...otherLicenceTypes } = constants;

describe("inspectionRecheckYears", () => {
  test("is 2 years for dairy farms", () => {
    expect(
      getLicenceTypeConfiguration(LICENCE_TYPE_ID_DAIRY_FARM)
        .inspectionRecheckYears
    ).toBe(2);
  });

  test.each(Object.entries(otherLicenceTypes))("is not set for %s", (_, id) => {
    expect(
      getLicenceTypeConfiguration(id).inspectionRecheckYears
    ).toBeUndefined();
  });
});
