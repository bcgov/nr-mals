import fs from "fs";
import path from "path";
import AdmZip from "adm-zip";
import { describe, it, expect } from "vitest";
import { getReportsTemplateName } from "./documents";
import { REPORTS } from "./constants";

const templatePath = (reportType) =>
  path.join(
    __dirname,
    "../static/templates/reports",
    `${getReportsTemplateName(reportType)}.xlsx`
  );

describe("report templates", () => {
  it.each(Object.values(REPORTS))(
    "has a template file for %s",
    (reportType) => {
      expect(fs.existsSync(templatePath(reportType))).toBe(true);
    }
  );

  it("uses the fields produced by the dairy inspection recheck procedure", () => {
    const strings = new AdmZip(
      templatePath(REPORTS.DAIRY_FARM_INSPECTION_RECHECK)
    ).readAsText("xl/sharedStrings.xml");

    expect(strings.match(/\{d\.[^}]+\}/g).sort()).toEqual(
      [
        "{d.DateTime}",
        "{d.RecheckYear}",
        "{d.Reg[i].IRMA_Num}",
        "{d.Reg[i].LicenceHolderCompany}",
        "{d.Reg[i].RecheckYear}",
        "{d.Reg[i].LastInspectionDate}",
        "{d.Reg[i].FarmAddress}",
        "{d.Reg[i+1].IRMA_Num}",
        "{d.Total_Num_Licences}",
      ].sort()
    );
  });
});
