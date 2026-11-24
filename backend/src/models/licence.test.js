import { describe, it, expect } from "vitest";
import { convertToLogicalModel, convertToPhysicalModel } from "./licence";

const record = {
  application_date: null,
  issue_date: null,
  expiry_date: null,
  bond_continuation_expiry_date: null,
  inspection_date: null,
  recheck_date: null,
  address_line_1: null,
  mail_address_line_1: null,
  mal_licence_registrant_xref: [],
  mal_licence_parent_child_xref_mal_licenceTomal_licence_parent_child_xref_parent_licence_id: [],
};

describe("licence inspection dates", () => {
  it("formats database dates as plain dates", () => {
    const output = convertToLogicalModel({
      ...record,
      inspection_date: new Date("2026-03-15T00:00:00.000Z"),
      recheck_date: new Date("2028-03-15T00:00:00.000Z"),
    });

    expect(output.inspectionDate).toBe("2026-03-15");
    expect(output.recheckDate).toBe("2028-03-15");
  });

  it("keeps unset dates null", () => {
    const output = convertToLogicalModel(record);

    expect(output.inspectionDate).toBeNull();
    expect(output.recheckDate).toBeNull();
  });

  it("maps dates to their columns on update", () => {
    const output = convertToPhysicalModel(
      { inspectionDate: "2026-03-15T08:00:00.000Z", recheckDate: null },
      true
    );

    expect(output.inspection_date).toBe("2026-03-15T08:00:00.000Z");
    // null clears the column, undefined would leave it unchanged
    expect(output.recheck_date).toBeNull();
  });

  it("leaves the columns unchanged when the dates are not provided", () => {
    const output = convertToPhysicalModel({}, true);

    expect(output.inspection_date).toBeUndefined();
    expect(output.recheck_date).toBeUndefined();
  });
});
