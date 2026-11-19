import { describe, it, expect } from "vitest";

const {
  parseImportDate,
  parseImportDecimal,
  parseImportRow,
  resolveImportRows,
} = require("./apiaryInspectionImport");

const reference = {
  sites: [
    { id: 10, apiarySiteId: 1, licenceNumber: 1234 },
    { id: 11, apiarySiteId: 2, licenceNumber: 1234 },
  ],
  types: [
    { id: 1, codeName: "EXTENSION", codeDescription: "Extension" },
    { id: 2, codeName: "SALES", codeDescription: "Sales" },
  ],
  existing: [
    {
      siteId: 10,
      inspectionDate: new Date(Date.UTC(2025, 3, 22)),
      inspectorId: "TB",
    },
  ],
};

const validRow = {
  rowNumber: 2,
  licenceNumber: "1234",
  apiarySiteId: "2",
  inspectionDate: "2025-05-01",
  inspectorId: "jd",
  inspectionType: "sales",
  americanFoulbroodResult: "0",
  varroaAvgYard: "1.25",
  inspectionComment: "  looks good ",
};

describe("parseImportDate", () => {
  it("parses YYYY-MM-DD as midnight UTC", () => {
    expect(parseImportDate("2025-04-22").toISOString()).toBe(
      "2025-04-22T00:00:00.000Z"
    );
  });

  it("ignores a trailing time component", () => {
    expect(parseImportDate("2025-04-22T17:30:00-07:00").toISOString()).toBe(
      "2025-04-22T00:00:00.000Z"
    );
  });

  it("rejects impossible and non-ISO dates", () => {
    expect(parseImportDate("2025-02-30")).toBeUndefined();
    expect(parseImportDate("04/22/2025")).toBeUndefined();
  });

  it("returns null for blanks", () => {
    expect(parseImportDate("  ")).toBeNull();
  });
});

describe("parseImportDecimal", () => {
  it("accepts a trailing percent sign and rounds to 2 places", () => {
    expect(parseImportDecimal("3.456%")).toBe(3.46);
  });

  it("rejects non-numeric text", () => {
    expect(parseImportDecimal("abc")).toBeUndefined();
  });
});

describe("parseImportRow", () => {
  it("reports missing required fields", () => {
    const { errors } = parseImportRow({});
    expect(errors).toEqual([
      "Licence Number is required.",
      "Apiary Site ID is required.",
      "Inspection Date is required.",
    ]);
  });

  it("rejects decimals in whole-number fields and over-long strings", () => {
    const { errors } = parseImportRow({
      ...validRow,
      nosemaResult: "1.5",
      inspectorId: "ABCDEFGHIJK",
    });
    expect(errors).toContain('nosemaResult "1.5" must be a whole number.');
    expect(errors).toContain(
      "inspectorId cannot be longer than 10 characters."
    );
  });

  it("rejects decimals that overflow numeric(5,2)", () => {
    const { errors } = parseImportRow({ ...validRow, varroaAvgYard: "1000" });
    expect(errors).toContain('varroaAvgYard "1000" cannot exceed 999.99.');
  });
});

describe("resolveImportRows", () => {
  it("resolves site and inspection type and builds an insert", () => {
    const result = resolveImportRows([validRow], reference);
    expect(result.errors).toEqual([]);
    expect(result.duplicateCount).toBe(0);
    expect(result.inserts).toHaveLength(1);
    expect(result.inserts[0]).toMatchObject({
      siteId: 11,
      inspectionTypeId: 2,
      inspectorId: "jd",
      americanFoulbroodResult: 0,
      europeanFoulbroodResult: null,
      varroaAvgYard: 1.25,
      inspectionComment: "looks good",
    });
    expect(result.inserts[0].inspectionDate.toISOString()).toBe(
      "2025-05-01T00:00:00.000Z"
    );
    expect(result.inserts[0]).not.toHaveProperty("licenceNumber");
  });

  it("matches inspection type by code or description", () => {
    const result = resolveImportRows(
      [{ ...validRow, inspectionType: "EXTENSION" }],
      reference
    );
    expect(result.inserts[0].inspectionTypeId).toBe(1);
  });

  it("allows a blank inspection type", () => {
    const result = resolveImportRows(
      [{ ...validRow, inspectionType: "" }],
      reference
    );
    expect(result.inserts[0].inspectionTypeId).toBeNull();
  });

  it("reports unknown sites and inspection types with the row number", () => {
    const result = resolveImportRows(
      [{ ...validRow, apiarySiteId: "99", inspectionType: "Audit" }],
      reference
    );
    expect(result.inserts).toEqual([]);
    expect(result.errors).toEqual([
      {
        rowNumber: 2,
        messages: [
          "No site found for Licence Number 1234 and Apiary Site ID 99.",
          'Inspection Type "Audit" is not recognized.',
        ],
      },
    ]);
  });

  it("skips rows already in the database (inspector match is case-insensitive)", () => {
    const result = resolveImportRows(
      [
        {
          ...validRow,
          apiarySiteId: "1",
          inspectionDate: "2025-04-22",
          inspectorId: "tb",
        },
      ],
      reference
    );
    expect(result.inserts).toEqual([]);
    expect(result.duplicateCount).toBe(1);
  });

  it("skips rows repeated within the same file", () => {
    const result = resolveImportRows([validRow, validRow], reference);
    expect(result.inserts).toHaveLength(1);
    expect(result.duplicateCount).toBe(1);
  });
});
