// Validation and resolution for the CHEFS apiary inspection CSV import (MALS2-124).
//
// The frontend maps CSV headers to the logical field names below and posts one object per row.
// Everything here is pure so it can be unit tested without a database.

const INT_FIELDS = [
  "liveColonies",
  "coloniesTested",
  "broodTested",
  "varroaTested",
  "smallHiveBeetleTested",
  "americanFoulbroodResult",
  "europeanFoulbroodResult",
  "smallHiveBeetleResult",
  "chalkbroodResult",
  "sacbroodResult",
  "nosemaResult",
  "varroaMiteResult",
  "supersInspected",
  "supersDestroyed",
];

// Columns are numeric(5,2), so the max absolute value is 999.99
const DECIMAL_FIELDS = ["varroaMiteResultPercent", "varroaAvgYard"];
const DECIMAL_MAX = 999.99;

const STRING_FIELDS = {
  inspectorId: 10,
  otherResultDescription: 240,
  inspectionComment: 2000,
};

function isBlank(value) {
  return (
    value === null ||
    value === undefined ||
    (typeof value === "string" && value.trim().length === 0)
  );
}

function cleanString(value) {
  return isBlank(value) ? null : String(value).trim();
}

// Accepts YYYY-MM-DD, optionally followed by a time component (CHEFS exports ISO timestamps).
// Returns midnight UTC, which is how the rest of the app stores inspection dates.
function parseImportDate(value) {
  if (isBlank(value)) {
    return null;
  }
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value).trim());
  if (!match) {
    return undefined;
  }
  const [, y, m, d] = match.map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  if (
    date.getUTCFullYear() !== y ||
    date.getUTCMonth() !== m - 1 ||
    date.getUTCDate() !== d
  ) {
    return undefined;
  }
  return date;
}

function parseImportInt(value) {
  if (isBlank(value)) {
    return null;
  }
  const text = String(value).trim();
  if (!/^-?\d+$/.test(text)) {
    return undefined;
  }
  return parseInt(text, 10);
}

function parseImportDecimal(value) {
  if (isBlank(value)) {
    return null;
  }
  const text = String(value).trim().replace(/%$/, "");
  if (!/^-?\d+(\.\d+)?$/.test(text)) {
    return undefined;
  }
  return Math.round(parseFloat(text) * 100) / 100;
}

function normalizeKey(value) {
  return isBlank(value) ? null : String(value).trim().toUpperCase();
}

function siteKey(licenceNumber, apiarySiteId) {
  return `${licenceNumber}|${apiarySiteId}`;
}

function inspectionKey(siteId, inspectionDate, inspectorId) {
  const datePart = inspectionDate.toISOString().split("T")[0];
  return `${siteId}|${datePart}|${normalizeKey(inspectorId) ?? ""}`;
}

// Parses one raw row. Returns { value, errors } where value uses logical field names.
function parseImportRow(raw) {
  const errors = [];
  const value = {};

  value.licenceNumber = parseImportInt(raw.licenceNumber);
  if (value.licenceNumber === null) {
    errors.push("Licence Number is required.");
  } else if (value.licenceNumber === undefined) {
    errors.push(`Licence Number "${raw.licenceNumber}" is not a number.`);
  }

  value.apiarySiteId = parseImportInt(raw.apiarySiteId);
  if (value.apiarySiteId === null) {
    errors.push("Apiary Site ID is required.");
  } else if (value.apiarySiteId === undefined) {
    errors.push(`Apiary Site ID "${raw.apiarySiteId}" is not a number.`);
  }

  value.inspectionDate = parseImportDate(raw.inspectionDate);
  if (value.inspectionDate === null) {
    errors.push("Inspection Date is required.");
  } else if (value.inspectionDate === undefined) {
    errors.push(
      `Inspection Date "${raw.inspectionDate}" must be in YYYY-MM-DD format.`
    );
  }

  value.inspectionType = normalizeKey(raw.inspectionType);

  INT_FIELDS.forEach((field) => {
    const parsed = parseImportInt(raw[field]);
    if (parsed === undefined) {
      errors.push(`${field} "${raw[field]}" must be a whole number.`);
    }
    value[field] = parsed ?? null;
  });

  DECIMAL_FIELDS.forEach((field) => {
    const parsed = parseImportDecimal(raw[field]);
    if (parsed === undefined) {
      errors.push(`${field} "${raw[field]}" must be a number.`);
    } else if (parsed !== null && Math.abs(parsed) > DECIMAL_MAX) {
      errors.push(`${field} "${raw[field]}" cannot exceed ${DECIMAL_MAX}.`);
    }
    value[field] = parsed ?? null;
  });

  Object.entries(STRING_FIELDS).forEach(([field, maxLength]) => {
    const cleaned = cleanString(raw[field]);
    if (cleaned !== null && cleaned.length > maxLength) {
      errors.push(`${field} cannot be longer than ${maxLength} characters.`);
    }
    value[field] = cleaned;
  });

  return { value, errors };
}

// Resolves parsed rows against reference data.
//
// rows:      array of raw row objects (each may include rowNumber for error reporting)
// sites:     [{ id, apiarySiteId, licenceNumber }]
// types:     [{ id, codeName, codeDescription }]
// existing:  [{ siteId, inspectionDate: Date, inspectorId }] - already in the database
//
// Returns { inserts, errors, duplicateCount } where inserts are logical-model inspections.
function resolveImportRows(rows, { sites, types, existing }) {
  const siteByKey = new Map(
    sites.map((s) => [siteKey(s.licenceNumber, s.apiarySiteId), s.id])
  );

  const typeIdByKey = new Map();
  types.forEach((t) => {
    typeIdByKey.set(normalizeKey(t.codeName), t.id);
    typeIdByKey.set(normalizeKey(t.codeDescription), t.id);
  });

  const seen = new Set(
    existing.map((e) =>
      inspectionKey(e.siteId, e.inspectionDate, e.inspectorId)
    )
  );

  const inserts = [];
  const errors = [];
  let duplicateCount = 0;

  rows.forEach((raw, index) => {
    const rowNumber = raw.rowNumber ?? index + 1;
    const { value, errors: rowErrors } = parseImportRow(raw);

    let siteId;
    if (rowErrors.length === 0) {
      siteId = siteByKey.get(siteKey(value.licenceNumber, value.apiarySiteId));
      if (siteId === undefined) {
        rowErrors.push(
          `No site found for Licence Number ${value.licenceNumber} and Apiary Site ID ${value.apiarySiteId}.`
        );
      }
    }

    let inspectionTypeId = null;
    if (value.inspectionType !== null) {
      inspectionTypeId = typeIdByKey.get(value.inspectionType) ?? null;
      if (inspectionTypeId === null) {
        rowErrors.push(
          `Inspection Type "${raw.inspectionType}" is not recognized.`
        );
      }
    }

    if (rowErrors.length > 0) {
      errors.push({ rowNumber, messages: rowErrors });
      return;
    }

    // Skip rows already in the database or repeated within the same file, so re-imports are safe
    const key = inspectionKey(siteId, value.inspectionDate, value.inspectorId);
    if (seen.has(key)) {
      duplicateCount += 1;
      return;
    }
    seen.add(key);

    const { licenceNumber, apiarySiteId, inspectionType, ...fields } = value;
    inserts.push({ ...fields, siteId, inspectionTypeId });
  });

  return { inserts, errors, duplicateCount };
}

module.exports = {
  parseImportDate,
  parseImportInt,
  parseImportDecimal,
  parseImportRow,
  resolveImportRows,
};
