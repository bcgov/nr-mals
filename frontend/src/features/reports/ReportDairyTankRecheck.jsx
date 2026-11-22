import React from "react";
import { startOfToday, getYear } from "date-fns";

import ReportRecheckYear from "./ReportRecheckYear";

import { startDairyTankRecheckJob } from "./reportsSlice";

import { REPORTS } from "../../utilities/constants";

export default function ReportDairyTankRecheck() {
  return (
    <ReportRecheckYear
      reportType={REPORTS.DAIRY_FARM_TANK}
      startJob={startDairyTankRecheckJob}
      initialYear={getYear(startOfToday()) + 1}
    />
  );
}
