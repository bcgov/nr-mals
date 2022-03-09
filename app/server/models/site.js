const { formatDate } = require("../utilities/formatting");
const { parseAsInt } = require("../utilities/parsing");
const dairyTank = require("./dairyTank");

function convertToLogicalModel(input) {
  const coordinates = input.gps_coordinates
    ? input.gps_coordinates.split(",")
    : null;
  const name = input.contact_name ? input.contact_name.split(" ") : null;
  let firstName = null;
  let lastName = null;
  if (name) {
    firstName = name[0];
    name[0] = null;
    lastName = name.join(" ");
  }

  const output = {
    id: input.id,
    licenceId: input.licence_id,

    region:
      input.mal_region_lu == null
        ? null
        : `${input.mal_region_lu.region_number} ${input.mal_region_lu.region_name}`,
    regionId: input.region_id,
    siteStatus:
      input.mal_status_code_lu == null
        ? null
        : input.mal_status_code_lu.code_description,
    siteStatusId: input.status_code_id,
    regionalDistrict:
      input.mal_regional_district_lu == null
        ? null
        : `${input.mal_regional_district_lu.district_number} ${input.mal_regional_district_lu.district_name}`,
    regionalDistrictId: input.regional_district_id,

    addressLine1: input.address_line_1,
    addressLine2: input.address_line_2,
    city: input.city,
    province: input.province,
    postalCode: input.postal_code,
    country: input.country,
    latitude:
      coordinates !== null && coordinates !== undefined ? coordinates[0] : null,
    longitude:
      coordinates !== null && coordinates !== undefined ? coordinates[1] : null,

    firstName: firstName,
    lastName: lastName,
    primaryPhone: input.primary_phone,
    secondaryPhone: input.secondary_phone,
    faxNumber: input.fax_number,
    legalDescriptionText: input.legal_description,
    hiveCount: input.hive_count,
    apiarySiteId: input.apiary_site_id,
    premisesId: input.premises_id,

    dairyTanks: input.mal_dairy_farm_tank
      ? input.mal_dairy_farm_tank.map((xref, index) => ({
          ...dairyTank.convertToLogicalModel(xref),
          key: index,
        }))
      : null,

    inspections: [],

    createdBy: input.create_userid,
    createdOn: input.create_timestamp,
    updatedBy: input.update_userid,
    updatedOn: input.update_timestamp,
  };

  return output;
}

function convertSearchResultToLogicalModel(input) {
  const output = {
    siteId: input.site_id_pk,
    licenceId: input.licence_id,
    siteStatus: input.site_status,
    siteStatusId: input.site_status_id,
    licenceNumber: input.licence_number,
    licenceIrmaNumber: input.licence_irma_number,
    licenceType: input.licence_type,
    licenceTypeId: input.licence_type_id,
    licenceStatus: input.licence_status,
    licenceStatusId: input.licence_status_id,
    apiarySiteId: input.apiary_site_id,
    apiarySiteIdDisplay: input.apiary_site_id_display,
    siteContactName: input.site_contact_name,
    siteAddressLine1: input.site_address_line_1,
    registrantFirstName: input.registrant_first_name,
    registrantLastName: input.registrant_last_name,
    registrantFirstLast: input.registrant_first_last,
    registrantLastFirst: input.registrant_last_first,
    registrantPrimaryghone: input.registrant_primary_phone,
    registrantEmailAddress: input.registrant_email_address,
    licenceCity: input.licence_city,
    licenceRegionId: input.licence_region_number,
    licenceRegion: input.licence_region_name,
    licenceDistrictId: input.licence_regional_district_number,
    licenceDistrict: input.licence_regional_district_name,
  };

  return output;
}

function convertToPhysicalModel(input, update) {
  const disconnectRelation = {
    disconnect: true,
  };

  let emptyRegion;
  if (input.originalRegion !== undefined && input.originalRegion !== null) {
    emptyRegion = disconnectRelation;
  }

  let emptyRegionalDistrict;
  if (
    input.originalRegionalDistrict !== undefined &&
    input.originalRegionalDistrict !== null
  ) {
    emptyRegionalDistrict = disconnectRelation;
  }

  let contactName = null;
  if (
    input.firstName !== null &&
    input.firstName !== undefined &&
    input.lastName !== null &&
    input.lastName !== undefined
  ) {
    contactName = `${input.firstName} ${input.lastName}`;
  }

  let gpsCoordinates = null;
  if (input.latitude !== null && input.latitude !== undefined) {
    gpsCoordinates = input.latitude;
  }
  if (input.longitude !== null && input.longitude !== undefined) {
    gpsCoordinates += `,${input.longitude}`;
  }

  const output = {
    mal_licence: {
      connect: { id: input.licenceId },
    },
    mal_region_lu:
      input.region === null
        ? emptyRegion
        : {
            connect: { id: input.region },
          },
    mal_status_code_lu: {
      connect: { id: input.siteStatus },
    },
    mal_regional_district_lu:
      input.regionalDistrict === null
        ? emptyRegionalDistrict
        : {
            connect: { id: input.regionalDistrict },
          },
    address_line_1: input.addressLine1,
    address_line_2: input.addressLine2,
    city: input.city,
    province: input.province,
    postal_code: input.postalCode,
    country: input.country,
    gps_coordinates: gpsCoordinates,

    contact_name: contactName,
    primary_phone: input.primaryPhone,
    secondary_phone: input.secondaryPhone,
    fax_number: input.faxNumber,
    //email: input.email,
    legal_description: input.legalDescriptionText,
    hive_count: input.hiveCount,
    apiary_site_id: input.apiarySiteId,

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
