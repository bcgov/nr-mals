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

module.exports = { formatCdogsBody, getCertificateTemplateName };
