const constants = require("./constants");

function formatCdogsBody(
  jsonData,
  templateBlobBase64,
  outputFileName,
  templateFileType = "docx",
  outputFileType = "docx"
) {
  return {
    data: jsonData,
    options: {
      reportName: outputFileName,
      convertTo: outputFileType,
      overwrite: true,
    },
    template: {
      content: templateBlobBase64,
      encodingType: "base64",
      fileType: templateFileType,
    },
  };
}

function getCertificateTemplateName(documentType, licenceType) {
  if (documentType === "ENVELOPE") {
    return "Envelope";
  }
  if (documentType === "CARD" && licenceType === "BULK TANK MILK GRADER") {
    return "Bulk-Tank-Milk-Grader-Card";
  }
  if (documentType === "CARD" && licenceType === "LIVESTOCK DEALER") {
    return "Livestock-Dealer-Card";
  }
  if (documentType === "CARD" && licenceType === "LIVESTOCK DEALER AGENT") {
    return "Livestock-Dealer-Agent-Card";
  }

  if (documentType !== "CERTIFICATE") {
    return undefined;
  }

  switch (licenceType) {
    case "APIARY":
      return "Apiary";
    case "BULK TANK MILK GRADER":
      return "Bulk-Tank-Milk-Grader";
    case "DAIRY FARM":
      return "Dairy-Farm";
    case "FUR FARM":
      return "Fur-Farm";
    case "GAME FARM":
      return "Game-Farm";
    case "HIDE DEALER":
      return "Hide-Dealer";
    case "LIMITED MEDICATED FEED":
      return "Limited-Medicated-Feed";
    case "LIVESTOCK DEALER":
      return "Livestock-Dealer";
    case "LIVESTOCK DEALER AGENT":
      return "Livestock-Dealer-Agent";
    case "MEDICATED FEED":
      return "Medicated-Feed";
    case "PUBLIC SALE YARD OPERATOR":
      return "Public-Sale-Yard-Operator";
    case "PURCHASE LIVE POULTRY":
      return "Purchase-Live-Poultry";
    case "SLAUGHTERHOUSE":
      return "Slaughterhouse";
    case "VETERINARY DRUG":
      return "Veterinary-Drug-Outlet";
    case "DISPENSER":
      return "Veterinary-Drug-Dispenser";
    default:
      return undefined;
  }
}

function getRenewalTemplateName(documentType, licenceType) {
  if (documentType !== "RENEWAL") {
    return undefined;
  }

  switch (licenceType) {
    case "APIARY":
      return "Renewal_Apiary_Template";
    case "BULK TANK MILK GRADER":
      return "Renewal_BTMG_Template";
    case "FUR FARM":
      return "Renewal_FurFarm_Template";
    case "GAME FARM":
      return "Renewal_GameFarm_Template";
    case "HIDE DEALER":
      return "Renewal_HideDealer_Template";
    case "LIMITED MEDICATED FEED":
      return "Renewal_LimitedMedicatedFeed_Template";
    case "LIVESTOCK DEALER":
      return "Renewal_LivestockDealer_Template";
    case "LIVESTOCK DEALER AGENT":
      return "Renewal_LivestockDealerAgent_Template";
    case "MEDICATED FEED":
      return "Renewal_MedicatedFeed_Template";
    case "PUBLIC SALE YARD OPERATOR":
      return "Renewal_PublicSaleYard_Template";
    case "PURCHASE LIVE POULTRY":
      return "Renewal_PurchaseLivePoultry_Template";
    case "SLAUGHTERHOUSE":
      return "Renewal_Slaughterhouse_Template";
    case "VETERINARY DRUG":
      return "Renewal_VetDrugLicence_Template";
    case "DISPENSER":
      return "Renewal_VetDrugDispenser_Template";
    default:
      return undefined;
  }
}

function getDairyNoticeTemplateName(
  documentType,
  speciesSubCode,
  correspondenceCode
) {
  if (documentType !== "DAIRY_INFRACTION") {
    return undefined;
  }

  let templateSubCode = speciesSubCode;
  switch (speciesSubCode) {
    case "WATER":
    case "WATER1":
    case "WATER2":
      templateSubCode = "CRY";
      break;
    case "SPC1":
      templateSubCode = "IBC";
      break;
    default:
      break;
  }

  let templateCorrespondenceCode = correspondenceCode;
  switch (correspondenceCode) {
    case "W":
      templateCorrespondenceCode = "Warning";
      break;
    case "L":
      templateCorrespondenceCode = "Levy";
      break;
    case "S":
      templateCorrespondenceCode = "Suspension";
      break;
    default:
      break;
  }

  return `${templateSubCode}_${templateCorrespondenceCode}_Template`;
}

function getDairyTankNoticeTemplateName(documentType) {
  if (documentType !== "RECHECK_NOTICE") {
    return undefined;
  }

  return `Dairy_Tank_Recheck_Template`;
}

function getReportsTemplateName(documentType) {
  switch (documentType) {
    case constants.REPORTS.ACTION_REQUIRED:
      return "Action_Required_Template";
    case constants.REPORTS.APIARY_INSPECTION:
      return "Apiary_Hive_Inspection_Template";
    case constants.REPORTS.APIARY_PRODUCER_REGION:
      return "Apiary_Producer_Analysis_Region_Template";
    case constants.REPORTS.APIARY_PRODUCER_DISTRICT:
      return "Apiary_Producer_Analysis_Region_Template";
    case constants.REPORTS.APIARY_PRODUCER_CITY:
      return "Apiary_Producer_Report_City_Template";
    case constants.REPORTS.APIARY_SITE:
      return "Apiary_Sites_Template";
    case constants.REPORTS.CLIENT_DETAILS:
      return "Client_Details_Template";
    case constants.REPORTS.DAIRY_FARM_DETAIL:
      return "Dairy_Client_Details_Template";
    case constants.REPORTS.DAIRY_FARM_QUALITY:
      return "Dairy_Provincial_Producer_Farm_Quality_Template";
    case constants.REPORTS.DAIRY_FARM_TANK:
      return "Tank_Recheck_Report_Template";
    case constants.REPORTS.DAIRY_TEST_THRESHOLD:
      return "Dairy_Test_Threshold_Template";
    case constants.REPORTS.LICENCE_LOCATION:
      return "LicenceType_Location_Template";
    case constants.REPORTS.LICENCE_EXPIRY:
      return "Licence_Expiry_Species_NoSpecies_Template";
    default:
      return null;
  }
}

module.exports = {
  formatCdogsBody,
  getCertificateTemplateName,
  getRenewalTemplateName,
  getDairyNoticeTemplateName,
  getDairyTankNoticeTemplateName,
  getReportsTemplateName,
};
