const { formatDate } = require("../utilities/formatting");
const { parseAsInt } = require("../utilities/parsing");

// This corresponds to mal_dairy_farm_trailer_vw
function convertToLogicalModel(input) {
  const output = {
    dairy_farm_trailer_id: input.dairy_farm_trailer_id,
    licenceId: input.licence_id,
    licenceNumber: input.licence_number,
    irmaNumber: input.irma_number,
    licenceStatus: input.licence_status,
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
    issueDate: input.issue_date ? formatDate(input.issue_date) : "",
    issueDateDisplay: input.issue_date_display,
    trailerNumber: input.trailer_number,
    licenceTrailerSeq: input.licence_trailer_seq,
    geographicalDivision: input.geographical_division,
    serialNumberVIN: input.serial_number_vin,
    licencePlate: input.licence_plate,
    trailerYear: input.trailer_year,
    trailerMake: input.trailer_make,
    trailerType: input.trailer_type,
    trailerCapacity: input.trailer_capacity,
    trailerCompartments: input.trailer_compartments,
    trailerActiveFlag: input.trailer_active_flag,
    createdBy: input.create_userid,
    createdOn: input.create_timestamp,
    updatedBy: input.update_userid,
    updatedOn: input.update_timestamp,

    // inspections: [], // add in later
  };

  return output;
}

function convertSearchResultToLogicalModel(input) {
  // const output = {
  //   entryType: input.entry_type,
  //   siteIdPk: input.site_id_pk,
  //   licenceId: input.licence_id,
  //   siteStatusId: input.site_status_id,
  //   siteStatus: input.site_status,
  //   licenceStatusId: input.licence_status_id,
  //   licenceStatus: input.licence_status,
  //   licenceTypeId: input.licence_type_id,
  //   licenceType: input.licence_type,
  //   licenceNumber: input.licence_number,
  //   licenceIrmaNumber: input.licence_irma_number,
  //   apiarySiteId: input.apiary_site_id,
  //   apiarySiteIdDisplay: input.apiary_site_id_display,
  //   siteContactName: input.site_contact_name,
  //   siteAddressLine1: input.site_address_line_1,
  //   registrantFirstName: input.registrant_first_name,
  //   registrantLastName: input.registrant_last_name,
  //   registrantFirstLast: input.registrant_first_last,
  //   registrantLastFirst: input.registrant_last_first,
  //   companyName: input.company_name,
  //   registrantPrimaryPhone: input.registrant_primary_phone,
  //   registrantEmailAddress: input.registrant_email_address,
  //   licenceCity: input.licence_city,
  //   licenceRegionNumber: input.licence_region_number,
  //   licenceRegionName: input.licence_region_name,
  //   licenceRegionalDistrictNumber: input.licence_regional_district_number,
  //   licenceRegionalDistrictName: input.licence_regional_district_name,
  //   dairyFarmTrailerId: input.dairy_farm_trailer_id,
  //   licenceTrailerId: input.licence_trailer_id,
  //   trailerNumber: input.trailer_number,
  //   geographicalDivision: input.geographical_division,
  //   serialNumberVin: input.serial_number_vin,
  //   licensePlate: input.license_plate,
  //   trailerYear: input.trailer_year,
  //   trailerMake: input.trailer_make,
  //   trailerType: input.trailer_type,
  //   trailerCapacity: input.trailer_capacity,
  //   trailerCompartments: input.trailer_compartments,
  //   trailerActiveFlag: input.trailer_active_flag,
  // };
  const output = {
    dairyFarmTrailerId: input.dairy_farm_trailer_id,
    licenceId: input.licence_id,
    licenceNumber: input.licence_number,
    irmaNumber: input.irma_number,
    licenceStatus: input.licence_status,
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
    issueDate: input.issue_date,
    issueDateDisplay: input.issue_date_display,
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
    trailerActiveFlag: input.trailer_active_flag,
  };

  return output;
}

function convertToPhysicalModel(input, update) {
  const disconnectRelation = {
    disconnect: true,
  };

  const output = {
    mal_licence: {
      connect: { id: input.licenceId },
    },
    // need to integrate status code into mal_dairy_farm_trailer table
    // mal_status_code_lu: {
    //   connect: { id: input.trailerStatus },
    // },
    trailer_number: input.trailerNumber,
    licence_trailer_seq: input.licenceTrailerSeq,
    date_issued: input.issueDate,
    geographical_division: input.geographicalDivision,
    serial_number_vin: input.serialNumberVin,
    license_plate: input.licensePlate,
    trailer_year: input.trailerYear,
    trailer_make: input.trailerMake,
    trailer_type: input.trailerType,
    trailer_capacity: input.trailerCapacity,
    trailer_compartments: input.trailerCompartments,
    trailer_active_flag: input.trailerActiveFlag,

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
