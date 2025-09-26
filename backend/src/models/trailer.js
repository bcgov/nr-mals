const { formatDate } = require("../utilities/formatting");
const { parseAsInt, parseAsDate } = require("../utilities/parsing");

function convertToLogicalModel(input) {
  const output = {
    id: input.id,
    licenceId: input.licence_id,

    licenceNumber: input.licence_number,
    irmaNumber: input.irma_number,
    licenceStatus:
      input.mal_status_code_lu == null
        ? null
        : input.mal_status_code_lu.code_description,
    licenceStatusId: input.status_code_id,
    companyName: input.company_name,
    derivedLicenceHolderName: input.derived_licence_holder_name,
    registrantLastFirst: input.registrant_last_first,
    address: input.address,
    city: input.city,
    province: input.province,
    postalCode: input.postal_code,
    registrantPrimaryPhone: input.registrant_primary_phone,
    registrantSecondaryPhone: input.registrant_secondary_phone,
    registrantFaxNumber: input.registrant_fax_number,
    registrantEmailAddress: input.registrant_email_address,
    dateIssued: input.date_issued ? formatDate(input.date_issued) : "",
    issueDateDisplay: input.issue_date_display,
    trailerNumber: input.trailer_number,
    licenceTrailerSeq: input.licence_trailer_seq,
    geographicalDivision: input.geographical_division,
    serialNumberVIN: input.serial_number_vin,
    licensePlate: input.license_plate,
    trailerYear: input.trailer_year,
    trailerMake: input.trailer_make,
    trailerType: input.trailer_type,
    trailerCapacity: input.trailer_capacity,
    trailerCompartments: input.trailer_compartments,
    createdBy: input.create_userid,
    createdOn: input.create_timestamp,
    updatedBy: input.update_userid,
    updatedOn: input.update_timestamp,

    inspections: [],
  };

  return output;
}

function convertSearchResultToLogicalModel(input) {
  const output = {
    dairyFarmTrailerId: input.dairy_farm_trailer_id,
    licenceId: input.licence_id,
    licenceNumber: input.licence_number,
    irmaNumber: input.irma_number,
    licenceStatus: input.licence_status,
    licenceStatusId: input.licence_status_id,
    companyName: input.company_name,
    derivedLicenceHolderName: input.derived_licence_holder_name,
    registrantLastFirst: input.registrant_last_first,
    address: input.address,
    city: input.city,
    province: input.province,
    postalCode: input.postal_code,
    registrantPrimaryPhone: input.registrant_primary_phone,
    registrantSecondaryPhone: input.registrant_secondary_phone,
    registrantFaxNumber: input.registrant_fax_number,
    registrantEmailAddress: input.registrant_email_address,
    dateIssued: input.date_issued,
    dateIssuedDisplay: input.date_issued_display, // ?
    licenceTrailerSeq: input.licence_trailer_seq,
    trailerNumber: input.trailer_number,
    licenceTrailerSeq: input.licence_trailer_seq,
    geographicalDivision: input.geographical_division,
    serialNumberVin: input.serial_number_vin,
    licensePlate: input.license_plate,
    trailerYear: input.trailer_year,
    trailerMake: input.trailer_make,
    trailerType: input.trailer_type,
    trailerCapacity: input.trailer_capacity,
    trailerCompartments: input.trailer_compartments,
  };

  return output;
}

function convertToPhysicalModel(input, update) {
  const output = {
    mal_licence: {
      connect: { id: input.licenceId },
    },
    mal_status_code_lu: {
      connect: { id: input.licenceStatus },
    },
    trailer_number: input.trailerNumber,
    licence_trailer_seq: input.licenceTrailerSeq,
    date_issued: parseAsDate(input.dateIssued),
    geographical_division: input.geographicalDivision,
    serial_number_vin: input.serialNumberVIN,
    license_plate: input.licensePlate,
    trailer_year: input.trailerYear,
    trailer_make: input.trailerMake,
    trailer_type: input.trailerType,
    trailer_capacity: input.trailerCapacity,
    trailer_compartments: input.trailerCompartments,
    create_userid: input.createdBy,
    create_timestamp: input.createdOn,
    update_userid: input.updatedBy,
    update_timestamp: input.updatedOn,
  };

  return output;
}

module.exports = {
  convertToPhysicalModel,
  convertSearchResultToLogicalModel,
  convertToLogicalModel,
};
