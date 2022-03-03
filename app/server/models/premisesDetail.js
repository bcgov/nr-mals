const { formatDate } = require("../utilities/formatting");
const { parseAsInt, parseAsDate } = require("../utilities/parsing");

const {
  populateAuditColumnsCreate,
  populateAuditColumnsUpdate,
} = require("../utilities/auditing");

function convertToLogicalModel(input) {
  const output = {
    id: input.id,
    premisesJobId: input.premises_job_id,
    sourceOperationPk: input.source_operation_pk,
    sourceLastChangeDate: formatDate(input.source_last_change_date),
    sitePremisesNumber: input.source_premises_id,
    importAction: input.import_action,
    importStatus: input.import_status,
    licenceId: input.licence_id,
    licenceNumber: input.licence_number,
    licenceAction: input.licence_action,
    licenceStatus: input.licence_status,
    licenceStatusTimestamp: input.licence_status_timestamp,
    licenceCompanyName: input.licence_company_name,
    licenceHivesPerApiary: input.licence_hives_per_apiary,
    licenceMailAddress1: input.licence_mail_address_line_1,
    licenceMailAddress2: input.licence_mail_address_line_2,
    licenceMailCity: input.licence_mail_city,
    licenceMailProvince: input.licence_mail_province,
    licenceMailPostalCode: input.licence_mail_postal_code,
    siteId: input.site_id,
    apiarySiteId: input.apiary_site_id,
    siteAction: input.site_action,
    siteStatus: input.site_status,
    siteStatusTimestamp: input.site_status_timestamp,
    siteAddressLine1: input.site_address_line_1,
    siteRegionalName: input.site_region_name,
    siteRegionalDistrictName: input.site_regional_district_name,
    registrantId: input.registrant_id,
    registrantAction: input.registrant_action,
    registrantStatus: input.registrant_status,
    registrantStatusTimestamp: input.registrant_status_timestamp,
    registrantFirstName: input.registrant_first_name,
    registrantLastName: input.registrant_last_name,
    registrantPrimaryPhone: input.registrant_primary_phone,
    registrantSecondaryPhone: input.registrant_secondary_phone,
    registrantFaxNumber: input.registrant_fax_number,
    registrantEmail: input.registrant_email_address,
    processComments: input.process_comments,
    createdBy: input.create_userid,
    createdOn: input.create_timestamp,
    updatedBy: input.update_userid,
    updatedOn: input.update_timestamp,
  };

  return output;
}

function convertToPhysicalModel(input, update) {
  const output = {
    mal_premises_job: { connect: { id: parseAsInt(input.premises_job_id) } },
    source_operation_pk: input.sourceOperationPk,
    source_last_change_date: parseAsDate(input.sourceLastChangeDate),
    source_premises_id: input.sitePremisesNumber,
    import_action: input.importAction,
    import_status: input.importStatus,
    licence_id: input.licenceId,
    licence_number: parseAsInt(input.licenceNumber),
    licence_action: input.licenceAction,
    licence_status: input.licenceStatus,
    licence_status_timestamp: input.licenceStatusTimestamp,
    licence_company_name: input.licenceCompanyName,
    licence_hives_per_apiary: input.licenceHivesPerApiary,
    licence_mail_address_line_1: input.licenceMailAddress1,
    licence_mail_address_line_2: input.licenceMailAddress2,
    licence_mail_city: input.licenceMailCity,
    licence_mail_province: input.licenceMailProvince,
    licence_mail_postal_code: input.licenceMailPostalCode
      ? input.licenceMailPostalCode.replace(" ", "")
      : undefined,
    site_id: input.siteId,
    apiary_site_id: input.apiarySiteId,
    site_action: input.siteAction,
    site_status: input.siteStatus,
    site_status_timestamp: input.siteStatusTimestamp,
    site_address_line_1: input.siteAddressLine1,
    site_region_name: input.siteRegionalName,
    site_regional_district_name: input.siteRegionalDistrictName,
    registrant_id: input.registrantId,
    registrant_action: input.registrantAction,
    registrant_status: input.registrantStatus,
    registrant_status_timestamp: input.registrantStatusTimestamp,
    registrant_first_name: input.registrantFirstName,
    registrant_last_name: input.registrantLastName,
    registrant_primary_phone: input.registrantPrimaryPhone
      ? input.registrantPrimaryPhone.replace(" ", "")
      : undefined,
    registrant_secondary_phone: input.registrantSecondaryPhone
      ? input.registrantSecondaryPhone.replace(" ", "")
      : undefined,
    registrant_fax_number: input.registrantFaxNumber
      ? input.registrantFaxNumber.replace(" ", "")
      : undefined,
    registrant_email_address: input.registrantEmail,
    process_comments: input.processComments,
    create_userid: input.createdBy,
    create_timestamp: input.createdOn,
    update_userid: input.updatedBy,
    update_timestamp: input.updatedOn,
  };

  return output;
}

function convertToUpdatePhysicalModel(input, date) {
  const output = {
    where: { id: input.id },
    data: convertToPhysicalModel(populateAuditColumnsUpdate(input, date), true),
  };

  return output;
}

module.exports = {
  convertToPhysicalModel,
  convertToLogicalModel,
  convertToUpdatePhysicalModel,
};
