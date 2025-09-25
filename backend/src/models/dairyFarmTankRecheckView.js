function convertToLogicalModel(input) {
  const output = {
    id: input.tank_id,
    licenceType: input.licence_type,
    licenceId: input.licence_id,
    licenceNumber: input.licence_number,
    irmaNumber: input.irma_number,
    recheckYear: input.recheck_year,
    lastName: input.last_name,
    regionName: input.region_name,
    districtName: input.district_name,
    printRecheckNotice: input.print_recheck_notice,
    recheckNoticeJson: input.recheck_notice_json,
  };

  return output;
}

module.exports = {
  convertToLogicalModel,
};
