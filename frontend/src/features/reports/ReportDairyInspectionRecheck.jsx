import React from "react";
import { startOfToday, getYear } from "date-fns";

import ReportRecheckYear from "./ReportRecheckYear";

import { startDairyInspectionRecheckJob } from "./reportsSlice";

import { REPORTS } from "../../utilities/constants";

export default function ReportDairyInspectionRecheck() {
  return (
    <ReportRecheckYear
      reportType={REPORTS.DAIRY_FARM_INSPECTION_RECHECK}
      startJob={startDairyInspectionRecheckJob}
      initialYear={getYear(startOfToday())}
    />
  );
}
