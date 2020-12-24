const { formatDate } = require("../utilities/formatting");
const { parseAsInt } = require("../utilities/parsing");
const registrant = require("./registrant");

function convertToLogicalModel(input) {
  const output = {
    id: input.id,
    licenceNumber: input.licence_number,
    licenceType:
      input.mal_licence_type_lu == null
        ? null
        : input.mal_licence_type_lu.licence_name,
    licenceTypeId: input.licence_type_id,
    region:
      input.mal_region_lu == null
        ? null
        : `${input.mal_region_lu.region_number} ${input.mal_region_lu.region_name}`,
    regionId: input.region_id,
    licenceStatus:
      input.mal_status_code_lu == null
        ? null
        : input.mal_status_code_lu.code_description,
    licenceStatusId: input.status_code_id,
    regionalDistrict:
      input.mal_regional_district_lu == null
        ? null
        : `${input.mal_regional_district_lu.district_number} ${input.mal_regional_district_lu.district_name}`,
    regionalDistrictId: input.regional_district_id,
    applicationDate: formatDate(input.application_date),
    issuedOnDate: formatDate(input.issue_date),
    expiryDate: formatDate(input.expiry_date),
    feePaidAmount: input.fee_collected,
    paymentReceived: input.fee_collected_ind,
    actionRequired: input.action_required,
    printLicence: input.licence_prn_requested,
    renewalNotice: input.renewal_prn_requested,
    irmaNumber: input.irma_number,
    totalHives: input.total_hives,
    hivesPerApiary: input.hives_per_apiary,
    createdBy: input.create_userid,
    createdOn: input.create_timestamp,
    updatedBy: input.update_userid,
    updatedOn: input.update_timestamp,
    registrants: input.mal_licence_registrant_xref.map((xref, index) => ({
      ...registrant.convertToLogicalModel(xref.mal_registrant),
      key: index,
    })),
  };

  return output;
}

function convertSearchResultToLogicalModel(input) {
  const output = {
    licenceId: input.licence_id,
    licenceType: input.licence_type,
    licenceStatus: input.licence_status,
    region: input.region_name,
    regionalDistrict: input.district_name,
    licenceNumber: input.licence_number,
    irmaNumber: input.irma_number,
    lastNames: input.last_name,
    companyNames: input.company_name,
    emailAddresses: input.email_ddress,
    applicationDate: input.application_date,
    issuedOnDate: input.issue_date,
    expiryDate: input.expiry_date,
  };

  return output;
}

function convertToPhysicalModel(input, update) {
  const disconnectRelation = {
    disconnect: true,
  };

  let emptyRegion;
  if (input.originalRegion !== undefined) {
    emptyRegion = disconnectRelation;
  }

  let emptyRegionalDistrict;
  if (input.originalRegionalDistrict !== undefined) {
    emptyRegionalDistrict = disconnectRelation;
  }

  const output = {
    mal_region_lu:
      input.region === null
        ? emptyRegion
        : {
            connect: { id: input.region },
          },
    mal_status_code_lu: {
      connect: { id: input.licenceStatus },
    },
    mal_regional_district_lu:
      input.regionalDistrict === null
        ? emptyRegionalDistrict
        : {
            connect: { id: input.regionalDistrict },
          },
    issue_date: input.issuedOnDate,
    expiry_date: input.expiryDate,
    fee_collected: input.feePaidAmount,
    fee_collected_ind: input.paymentReceived ?? false,
    action_required: input.actionRequired,
    licence_prn_requested: input.printLicence,
    renewal_prn_requested: input.renewalNotice,
    irma_number: input.irmaNumber,
    total_hives: parseAsInt(input.totalHives),
    hives_per_apiary: parseAsInt(input.hivesPerApiary),
    create_userid: input.createdBy,
    create_timestamp: input.createdOn,
    update_userid: input.updatedBy,
    update_timestamp: input.updatedOn,
  };

  if (!update) {
    output.application_date = input.applicationDate;
    output.mal_licence_type_lu = {
      connect: { id: input.licenceType },
    };
  }

  return output;
}

module.exports = {
  convertToPhysicalModel,
  convertToLogicalModel,
  convertSearchResultToLogicalModel,
};
