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
  };

  return output;
}

function convertApiaryHiveInspectionToLogicalModel(input) {
  const output = {
    licenceId: input.licence_id,
    licenceNumber: input.licence_number,
    licenceStatus: input.licence_status,
    apiarySiteId: input.apiary_site_id,
    regionName: input.region_name,
    lastName: input.last_name,
    firstName: input.first_name,
    inspectionDate: formatDate(input.inspection_date),
    coloniesTested: input.colonies_tested,
    americanFoulbroodResult: input.american_foulbrood_result,
    europeanFoulbroodResult: input.european_foulbrood_result,
    nosemaResult: input.nosema_result,
    chalkbroodResult: input.chalkbrood_result,
    sacbroodResult: input.sacbrood_result,
    varroaTested: input.varroa_tested,
    varroaMiteResult: input.varroa_mite_result,
    varroaMiteResultPercent: input.varroa_mite_result_percent,
    smallHiveBeetleTested: input.small_hive_beetle_tested,
    smallHiveBeetleResult: input.small_hive_beetle_result,
    supersInspected: input.supers_inspected,
    supersDestroyed: input.supers_destroyed,
    hivesPerApiary: input.hives_per_apiary,
    hiveCount: input.hive_count,
  };

  return output;
}

function convertProducersAnalysisToLogicalModel(input) {
  const output = {
    siteId: input.site_id,
    licenceId: input.licence_id,
    licenceNumber: input.licence_number,
    siteStatus: input.site_status,
    apiarySiteId: input.apiary_site_id,
    registrantLastName: input.registrant_last_name,
    registrantFirstName: input.registrant_first_name,
    registrantEmailAddress: input.registrant_email_address,
    siteRegionId: input.site_region_id,
    siteRegionName: input.site_region_name,
    siteRegionalDistrictId: input.site_regional_district_id,
    siteDistrictName: input.site_district_name,
    siteAddress: input.site_address,
    siteCity: input.site_city,
    sitePrimaryPhone: input.site_primary_phone,
    registrationDate: formatDate(input.registration_date),
    hiveCount: input.hive_count,
  };

  return output;
}

function convertProvincialFarmQualityToLogicalModel(input) {
  const output = {
    licenceId: input.licence_id,
    licenceNumber: input.licence_number,
    irmaNumber: input.irma_number,
    derivedLicenceHolderName: input.derived_licence_holder_name,
    registrantLastName: input.registrant_last_name,
    registrantFirstName: input.registrant_first_name,
    spc1Date: formatDate(input.spc1_date),
    spc1Value: input.spc1_value,
    sccDate: formatDate(input.scc_date),
    sccValue: input.scc_value,
    cryDate: formatDate(input.cry_date),
    cryValue: input.cry_value,
    ffaDate: formatDate(input.ffa_date),
    ffaValue: input.ffa_value,
    ihDate: formatDate(input.ih_date),
    ihValue: input.ih_value,
  };

  return output;
}

module.exports = {
  convertActionRequiredToLogicalModel,
  convertApiaryHiveInspectionToLogicalModel,
  convertProducersAnalysisToLogicalModel,
  convertProvincialFarmQualityToLogicalModel,
};
