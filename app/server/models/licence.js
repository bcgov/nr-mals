const { formatDate } = require("../utilities/formatting");

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
    createdBy: input.create_userid,
    createdOn: input.create_timestamp,
    updatedBy: input.update_userid,
    updatedOn: input.update_timestamp,
  };

  return output;
}

function convertToPhysicalModel(input) {
  const output = {
    mal_licence_type_lu: {
      connect: { id: input.licenceType },
    },
    mal_region_lu: {
      connect: { id: input.region },
    },
    mal_status_code_lu: {
      connect: { id: input.licenceStatus },
    },
    mal_regional_district_lu: {
      connect: { id: input.regionalDistrict },
    },
    application_date: input.applicationDate,
    issue_date: input.issuedOnDate,
    expiry_date: input.expiryDate,
    fee_collected: input.feePaidAmount,
    fee_collected_ind: input.paymentReceived,
    action_required: input.actionRequired,
    licence_prn_requested: input.printLicence,
    renewal_prn_requested: input.renewalNotice,
    create_userid: input.createdBy,
    create_timestamp: input.createdOn,
    update_userid: input.updatedBy,
    update_timestamp: input.updatedOn,
  };

  return output;
}

module.exports = { convertToPhysicalModel, convertToLogicalModel };
