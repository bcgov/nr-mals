const { formatDate } = require("../utilities/formatting");
const { parseAsInt } = require("../utilities/parsing");

function convertActionRequiredToLogicalModel(input) {
  const output = {
    licenceId: input.licence_id,
    licenceNumber: input.licence_number,
    licenceTypeId: input.licence_type_id,
    licenceType: input.licence_type,
    siteRegion: input.site_region,
    licenceStatus: input.licence_status,
    licenceTypeLegislation: input.licence_type_legislation,
    derivedLicenceHolderName: input.derived_licence_holder_name,
    companyName: input.company_name,
    registrantName: input.registrant_name,
    registrantLastName: input.registrant_last_first,
    siteAddress: input.site_address,
    siteCity: input.site_city,
    siteProvince: input.site_province,
    sitePostalCode: input.site_postal_code,
    sitePrimaryPhone: input.site_primary_phone,
    siteSecondaryphone: input.site_secondary_phone,
    siteFaxNumber: input.site_fax_number,
    emailAddress: input.email_address,
    createdBy: input.create_userid,
    createdOn: input.create_timestamp,
    updatedBy: input.update_userid,
    updatedOn: input.update_timestamp,
  };

  return output;
}

module.exports = {
  convertActionRequiredToLogicalModel,
};
