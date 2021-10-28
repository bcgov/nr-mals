const { formatDate } = require("../utilities/formatting");
const { parseAsInt } = require("../utilities/parsing");
const registrant = require("./registrant");
const inventory = require("./inventory");
const constants = require("../utilities/constants");

function convertToLogicalModel(input) {
  const output = {
    id: input.id,
    licenceNumber: input.licence_number,
    licenceType:
      input.mal_licence_type_lu == null
        ? null
        : input.mal_licence_type_lu.licence_type,
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
    primaryRegistrantId: input.primary_registrant_id,
    primaryPhone: input.primary_phone,
    secondaryPhone: input.secondary_phone,
    faxNumber: input.fax_number,
    companyName: input.company_name,
    companyNameOverride: input.company_name_override,
    regionalDistrictId: input.regional_district_id,
    applicationDate: formatDate(input.application_date),
    issuedOnDate: formatDate(input.issue_date),
    expiryDate: formatDate(input.expiry_date),
    feePaidAmount: input.fee_collected,
    paymentReceived: input.fee_collected_ind,
    actionRequired: input.action_required,
    printLicence: input.print_certificate,
    renewalNotice: input.print_renewal,
    irmaNumber: input.irma_number,
    totalHives: input.total_hives,
    hivesPerApiary: input.hives_per_apiary,
    bondCarrierPhoneNumber: input.bond_carrier_phone_number,
    bondNumber: input.bond_number,
    bondValue: input.bond_value,
    bondCarrierName: input.bond_carrier_name,
    bondContinuationExpiryDate: formatDate(input.bond_continuation_expiry_date),
    speciesCodeId: input.species_code_id,
    createdBy: input.create_userid,
    createdOn: input.create_timestamp,
    updatedBy: input.update_userid,
    updatedOn: input.update_timestamp,
    registrants: input.mal_licence_registrant_xref.map((xref, index) => ({
      ...registrant.convertToLogicalModel(xref.mal_registrant),
      key: index,
    })),
    associatedLicences: input.mal_licence_parent_child_xref_mal_licenceTomal_licence_parent_child_xref_parent_licence_id.map(
      (xref, index) => ({
        ...convertAssociatdLicenceToLogicalModel({
          associatedOnDate: xref.create_timestamp,
          ...xref.mal_licence_mal_licenceTomal_licence_parent_child_xref_child_licence_id,
        }),
        key: index,
      })
    ),
  };

  let primaryRegistrant = output.registrants.find(
    (x) => x.id === output.primaryRegistrantId
  );
  if (primaryRegistrant !== undefined) {
    primaryRegistrant.companyName = output.companyName;
    primaryRegistrant.companyNameOverride = output.companyNameOverride;
  }

  switch (input.licence_type_id) {
    case constants.LICENCE_TYPE_ID_GAME_FARM:
      output.inventory = input.mal_game_farm_inventory.map((x) => ({
        ...inventory.convertToLogicalModel(x),
        speciesCodeId: input.species_code_id,
      }));
      break;
    case constants.LICENCE_TYPE_ID_FUR_FARM:
      output.inventory = input.mal_fur_farm_inventory.map((x) => ({
        ...inventory.convertToLogicalModel(x),
        speciesCodeId: input.species_code_id,
      }));
      break;
    default:
      break;
  }

  const hasPrimaryAddress = input.address_line_1 !== null;
  const hasMailingAddress = input.mail_address_line_1 !== null;
  output.addresses = [];
  if (hasPrimaryAddress) {
    output.addresses.push({
      key: output.addresses.length,
      addressLine1: input.address_line_1,
      addressLine2: input.address_line_2,
      city: input.city,
      province: input.province,
      postalCode: input.postal_code,
      country: input.country,
      addressType: "Primary",
    });
  }
  if (hasMailingAddress) {
    output.addresses.push({
      key: output.addresses.length,
      addressLine1: input.mail_address_line_1,
      addressLine2: input.mail_address_line_2,
      city: input.mail_city,
      province: input.mail_province,
      postalCode: input.mail_postal_code,
      country: input.mail_country,
      addressType: "Mailing",
    });
  }

  output.phoneNumbers = [];
  const primaryPhone = input.primary_phone;
  const secondaryPhone = input.secondary_phone;
  const faxNumber = input.fax_number;
  if (primaryPhone) {
    output.phoneNumbers.push({
      key: output.phoneNumbers.length,
      number: primaryPhone,
      phoneNumberType: "Primary",
    });
  }
  if (secondaryPhone) {
    output.phoneNumbers.push({
      key: output.phoneNumbers.length,
      number: secondaryPhone,
      phoneNumberType: "Secondary",
    });
  }
  if (faxNumber) {
    output.phoneNumbers.push({
      key: output.phoneNumbers.length,
      number: faxNumber,
      phoneNumberType: "Fax",
    });
  }

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

function convertCertificateToLogicalModel(input) {
  const output = {
    licenceId: input.licence_id,
    licenceType: input.licence_type,
    licenceStatus: input.licence_status,
    region: input.region_name,
    regionalDistrict: input.district_name,
    licenceNumber: input.licence_number,
    lastNames: input.last_name,
    companyNames: input.company_name,
    issuedOnDate: input.issue_date,
    expiryDate: input.expiry_date,
  };

  return output;
}

function convertRenewalToLogicalModel(input) {
  const output = {
    licenceId: input.licence_id,
    licenceType: input.licence_type,
    licenceStatus: input.licence_status,
    region: input.region_name,
    regionalDistrict: input.district_name,
    licenceNumber: input.licence_number,
    lastNames: input.last_name,
    companyNames: input.company_name,
    issuedOnDate: input.issue_date,
    expiryDate: input.expiry_date,
  };

  return output;
}

function convertAssociatdLicenceToLogicalModel(input) {
  const output = {
    id: input.id,
    licenceNumber: input.licence_number,
    licenceType:
      input.mal_licence_type_lu == null
        ? null
        : input.mal_licence_type_lu.licence_type,
    licenceTypeId: input.licence_type_id,
    licenceStatus:
      input.mal_status_code_lu == null
        ? null
        : input.mal_status_code_lu.code_description,
    licenceStatusId: input.status_code_id,
    issuedOnDate: formatDate(input.issue_date),
    primaryRegistrantId: input.primary_registrant_id,
    registrants: input.mal_licence_registrant_xref.map((xref, index) => ({
      ...registrant.convertToLogicalModel(xref.mal_registrant),
      key: index,
    })),
    associatedOnDate: formatDate(
      input.associatedOnDate !== undefined && input.associatedOnDate !== null
        ? input.associatedOnDate
        : input.create_timestamp
    ),
    companyName: input.company_name,
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

  let emptyPrimaryRegistrant;
  if (
    input.primaryRegistrantId !== undefined &&
    input.primaryRegistrantId !== null
  ) {
    emptyPrimaryRegistrant = disconnectRelation;
  }

  let speciesCode = undefined;
  if (
    input.licenceType === constants.LICENCE_TYPE_ID_GAME_FARM ||
    input.licenceType === constants.LICENCE_TYPE_ID_FUR_FARM
  ) {
    speciesCode = {
      connect: { id: parseAsInt(input.speciesCodeId) },
    };
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
    mal_registrant:
      input.primaryRegistrantId === null
        ? emptyPrimaryRegistrant
        : {
            connect: { id: input.primaryRegistrantId },
          },
    mal_licence_species_code_lu: speciesCode,
    issue_date: input.issuedOnDate,
    expiry_date: input.expiryDate,
    company_name: input.companyName,
    company_name_override: input.companyNameOverride,
    fee_collected: input.feePaidAmount,
    fee_collected_ind: input.paymentReceived || false,
    action_required: input.actionRequired,
    print_certificate: input.printLicence,
    print_renewal: input.renewalNotice,
    irma_number: input.irmaNumber,
    total_hives: parseAsInt(input.totalHives),
    hives_per_apiary: parseAsInt(input.hivesPerApiary),
    bond_carrier_phone_number: input.bondCarrierPhoneNumber,
    bond_number: input.bondNumber,
    bond_value: input.bondValue,
    bond_carrier_name: input.bondCarrierName,
    bond_continuation_expiry_date: input.bondContinuationExpiryDate,
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

  var primary =
    input.addresses && input.addresses.find((x) => x.addressType === "Primary");
  var secondary =
    input.addresses && input.addresses.find((x) => x.addressType === "Mailing");
  if (primary !== undefined) {
    output.address_line_1 = primary.addressLine1;
    output.address_line_2 = primary.addressLine2;
    output.city = primary.city;
    output.province = primary.province;
    output.postal_code = primary.postalCode;
    output.country = primary.country;
  }
  if (secondary !== undefined) {
    output.mail_address_line_1 = secondary.addressLine1;
    output.mail_address_line_2 = secondary.addressLine2;
    output.mail_city = secondary.city;
    output.mail_province = secondary.province;
    output.mail_postal_code = secondary.postalCode;
    output.mail_country = secondary.country;
  }

  var primaryPhone =
    input.phoneNumbers &&
    input.phoneNumbers.find((x) => x.phoneNumberType === "Primary");
  var secondaryPhone =
    input.phoneNumbers &&
    input.phoneNumbers.find((x) => x.phoneNumberType === "Secondary");
  var faxNumber =
    input.phoneNumbers &&
    input.phoneNumbers.find((x) => x.phoneNumberType === "Fax");
  if (primaryPhone !== undefined) {
    output.primary_phone = primaryPhone.number;
  }
  if (secondaryPhone !== undefined) {
    output.secondary_phone = secondaryPhone.number;
  }
  if (faxNumber !== undefined) {
    output.fax_number = faxNumber.number;
  }

  return output;
}

function convertToAssociatedLicencePhysicalModel(input, update) {
  const output = {
    mal_licence_mal_licenceTomal_licence_parent_child_xref_parent_licence_id: {
      connect: { id: input.parentLicenceId },
    },
    mal_licence_mal_licenceTomal_licence_parent_child_xref_child_licence_id: {
      connect: { id: input.childLicenceId },
    },
    create_userid: input.createdBy,
    create_timestamp: input.createdOn,
    update_userid: input.updatedBy,
    update_timestamp: input.updatedOn,
  };

  return output;
}

module.exports = {
  convertToPhysicalModel,
  convertToLogicalModel,
  convertSearchResultToLogicalModel,
  convertCertificateToLogicalModel,
  convertRenewalToLogicalModel,
  convertAssociatdLicenceToLogicalModel,
  convertToAssociatedLicencePhysicalModel,
};
