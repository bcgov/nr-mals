// CSV header mapping for the CHEFS apiary inspection import (MALS2-124).
//
// NOTE: These headers are assumed - no sample CHEFS export was available when this was written.
// Matching is case-insensitive, ignores surrounding whitespace, and treats "_" as a space.
// The logical field name itself (e.g. "licenceNumber") is always accepted too, which covers
// CHEFS exports that use form field keys rather than labels. Update the aliases once the
// real export format is known.
export const APIARY_INSPECTION_CSV_FIELDS = [
  {
    field: "licenceNumber",
    label: "Licence Number",
    required: true,
    aliases: [
      "licence number",
      "license number",
      "licence #",
      "license #",
      "licence no",
    ],
  },
  {
    field: "apiarySiteId",
    label: "Apiary Site ID",
    required: true,
    aliases: ["apiary site id", "site #", "site id", "site number"],
  },
  {
    field: "inspectionDate",
    label: "Inspection Date",
    required: true,
    aliases: ["inspection date", "date inspected", "date"],
  },
  {
    field: "inspectorId",
    label: "Inspector",
    aliases: ["inspector", "inspector id", "inspector initials"],
  },
  {
    field: "inspectionType",
    label: "Inspection Type",
    aliases: ["inspection type", "type"],
  },
  {
    field: "liveColonies",
    label: "Live Colonies in Yard",
    aliases: ["live colonies in yard", "live colonies"],
  },
  {
    field: "coloniesTested",
    label: "Number of Colonies Tested",
    aliases: ["number of colonies tested", "colonies tested"],
  },
  { field: "broodTested", label: "Brood Tested", aliases: ["brood tested"] },
  { field: "varroaTested", label: "Varroa Tested", aliases: ["varroa tested"] },
  {
    field: "smallHiveBeetleTested",
    label: "SHB Tested",
    aliases: ["shb tested"],
  },
  { field: "americanFoulbroodResult", label: "AFB", aliases: ["afb"] },
  { field: "europeanFoulbroodResult", label: "EFB", aliases: ["efb"] },
  { field: "smallHiveBeetleResult", label: "SHB", aliases: ["shb"] },
  { field: "chalkbroodResult", label: "Chalkbrood", aliases: ["chalkbrood"] },
  { field: "sacbroodResult", label: "Sacbrood", aliases: ["sacbrood"] },
  { field: "nosemaResult", label: "Nosema", aliases: ["nosema"] },
  {
    field: "varroaMiteResult",
    label: "Varroa",
    aliases: ["varroa", "varroa mites"],
  },
  {
    field: "varroaMiteResultPercent",
    label: "Varroa Mites (%)",
    aliases: ["varroa mites (%)", "varroa %", "varroa percent"],
  },
  {
    field: "varroaAvgYard",
    label: "Varroa Avg for Yard",
    aliases: ["varroa avg for yard", "varroa average for yard", "varroa avg"],
  },
  { field: "otherResultDescription", label: "Other", aliases: ["other"] },
  {
    field: "supersInspected",
    label: "Supers Inspected",
    aliases: ["supers inspected"],
  },
  {
    field: "supersDestroyed",
    label: "Supers Destroyed",
    aliases: ["supers destroyed"],
  },
  {
    field: "inspectionComment",
    label: "Notes",
    aliases: ["notes", "comments", "comment"],
  },
];

const normalizeHeader = (header) =>
  String(header ?? "")
    .replace(/^﻿/, "")
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

const FIELD_BY_HEADER = new Map();
APIARY_INSPECTION_CSV_FIELDS.forEach(({ field, aliases }) => {
  FIELD_BY_HEADER.set(normalizeHeader(field), field);
  aliases.forEach((alias) =>
    FIELD_BY_HEADER.set(normalizeHeader(alias), field)
  );
});

// Maps the CSV header row to logical fields.
// Returns { columnFields, missingRequired, ignoredHeaders } where columnFields[i] is the field for column i (or null).
export function mapApiaryInspectionHeaders(headerRow) {
  const used = new Set();
  const ignoredHeaders = [];
  const columnFields = headerRow.map((header) => {
    const field = FIELD_BY_HEADER.get(normalizeHeader(header));
    if (!field || used.has(field)) {
      if (normalizeHeader(header) !== "") {
        ignoredHeaders.push(header);
      }
      return null;
    }
    used.add(field);
    return field;
  });

  const missingRequired = APIARY_INSPECTION_CSV_FIELDS.filter(
    (x) => x.required && !used.has(x.field)
  ).map((x) => x.label);

  return { columnFields, missingRequired, ignoredHeaders };
}

// Converts parsed CSV rows (arrays, header row first) into objects keyed by logical field.
// rowNumber is the 1-based line in the file so errors can point back to it.
export function mapApiaryInspectionRows(csvRows) {
  const [headerRow = [], ...dataRows] = csvRows;
  const mapping = mapApiaryInspectionHeaders(headerRow);

  const rows = [];
  dataRows.forEach((cells, index) => {
    if (!cells.some((c) => String(c ?? "").trim() !== "")) {
      return; // skip blank lines
    }
    const row = { rowNumber: index + 2 };
    mapping.columnFields.forEach((field, col) => {
      if (field) {
        row[field] = cells[col];
      }
    });
    rows.push(row);
  });

  return { ...mapping, rows };
}
