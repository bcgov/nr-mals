const express = require("express");
// const { PrismaClient } = require("@prisma/client");
const { withPrisma } = require("../../db/prisma");
const axios = require("axios");
const oauth = require("axios-oauth-client");
const tokenProvider = require("axios-token-interceptor");
const AdmZip = require("adm-zip");
const path = require("path");
const fs = require("fs").promises;

const licence = require("../../models/licence");
const dairyFarmInfractionView = require("../../models/dairyFarmInfractionView");
const dairyFarmTankRecheckView = require("../../models/dairyFarmTankRecheckView");
const constants = require("../../utilities/constants");
const { getCurrentUser } = require("../../utilities/user");
const {
  formatCdogsBody,
  getCertificateTemplateName,
  getRenewalTemplateName,
  getDairyNoticeTemplateName,
  getDairyTankNoticeTemplateName,
  getReportsTemplateName,
} = require("../../utilities/documents");
const { formatDate } = require("../../utilities/formatting");
const { parseAsInt } = require("../../utilities/parsing");
const { REPORTS } = require("../../utilities/constants");
const router = express.Router();

const certificateTemplateDir = path.join(
  __dirname,
  "../../static/templates/certificates"
);
const renewalsTemplateDir = path.join(
  __dirname,
  "../../static/templates/notices"
);
const dairyNoticeTemplateDir = path.join(
  __dirname,
  "../../static/templates/notices/dairy"
);
const reportsTemplateDir = path.join(
  __dirname,
  "../../static/templates/reports"
);

// As templates are converted to base 64 for the first time they will be pushed to this for reuse
const templateBuffers = [];

const cdogs = axios.create({
  baseURL: process.env.CDOGS_URL,
  timeout: 30000,
});

cdogs.interceptors.request.use(
  // Wraps axios-token-interceptor with oauth-specific configuration,
  // fetches the token using the desired claim method, and caches
  // until the token expires
  oauth.interceptor(
    tokenProvider,
    oauth.client(axios.create(), {
      url: process.env.CDOGS_OAUTH_URL,
      grant_type: "client_credentials",
      client_id: process.env.CDOGS_CLIENT_ID,
      client_secret: process.env.CDOGS_SECRET,
    })
  )
);

async function getPendingDocuments(prisma, jobId) {
  const documents = await prisma.mal_print_job_output.findMany({
    where: { document_binary: null, print_job_id: jobId },
    select: {
      id: true,
      print_job_id: true,
      licence_number: true,
      licence_type: true,
      document_type: true,
    },
  });
  return documents.map((document) => {
    return {
      documentId: document.id,
      jobId: document.print_job_id,
      licenceNumber: document.licence_number,
      licenceType: document.licence_type,
      documentType: document.document_type,
    };
  });
}

async function getDocument(prisma, documentId) {
  return prisma.mal_print_job_output.findUnique({
    where: { id: documentId },
    select: {
      id: true,
      licence_type: true,
      document_type: true,
      document_json: true,
    },
  });
}

async function getJob(prisma, jobId) {
  const job = await prisma.mal_print_job.findUnique({
    where: {
      id: jobId,
    },
  });

  if (job === null) {
    return null;
  }

  const printCategory = job.print_category;
  const jobStatus = job.job_status;
  const executionStartTime = job.execution_start_time;
  const jsonEndTime = job.json_end_time;
  const documentEndTime = job.document_end_time;
  const totalCertificateCount = job.certificate_json_count;
  const totalEnvelopeCount = job.envelope_json_count;
  const totalCardCount = job.card_json_count;
  const totalRenewalCount = job.renewal_json_count;
  const totalDairyNoticeCount = job.dairy_infraction_json_count;
  const totalDairyTankNoticeCount = job.recheck_notice_json_count;
  const totalReportCount = job.report_json_count;
  const totalDocumentCount =
    totalCertificateCount +
    totalEnvelopeCount +
    totalCardCount +
    totalRenewalCount +
    totalDairyNoticeCount +
    totalDairyTankNoticeCount +
    totalReportCount;

  const completedDocuments = await prisma.mal_print_job_output.findMany({
    where: {
      print_job_id: jobId,
      NOT: {
        document_binary: null,
      },
    },
    select: {
      document_type: true,
    },
  });

  const completedDocumentCount = completedDocuments.length;
  const completedCertificateCount = completedDocuments.filter(
    (document) => document.document_type === constants.DOCUMENT_TYPE_CERTIFICATE
  ).length;
  const completedEnvelopeCount = completedDocuments.filter(
    (document) => document.document_type === constants.DOCUMENT_TYPE_ENVELOPE
  ).length;
  const completedCardCount = completedDocuments.filter(
    (document) => document.document_type === constants.DOCUMENT_TYPE_CARD
  ).length;
  const completedRenewalCount = completedDocuments.filter(
    (document) => document.document_type === constants.DOCUMENT_TYPE_RENEWAL
  ).length;
  const completedDairyNoticeCount = completedDocuments.filter(
    (document) =>
      document.document_type === constants.DOCUMENT_TYPE_DAIRY_INFRACTION
  ).length;
  const completedDairyTankNoticeCount = completedDocuments.filter(
    (document) =>
      document.document_type ===
      constants.DOCUMENT_TYPE_DAIRY_TANK_RECHECK_NOTICE
  ).length;
  const completedReportCount = completedDocuments.filter(
    (document) => document.document_type === constants.DOCUMENT_TYPE_REPORT
  ).length;

  return {
    printCategory,
    jobStatus,
    executionStartTime,
    jsonEndTime,
    documentEndTime,
    totalCertificateCount,
    completedCertificateCount,
    totalEnvelopeCount,
    completedEnvelopeCount,
    totalCardCount,
    completedCardCount,
    totalRenewalCount,
    completedRenewalCount,
    totalDairyNoticeCount,
    completedDairyNoticeCount,
    totalDairyTankNoticeCount,
    completedDairyTankNoticeCount,
    totalDocumentCount,
    completedDocumentCount,
    totalReportCount,
    completedReportCount,
  };
}

async function getJobBlobs(prisma, jobId) {
  return prisma.mal_print_job_output.findMany({
    where: {
      print_job_id: jobId,
      NOT: {
        document_binary: null,
      },
    },
    select: {
      document_binary: true,
      licence_number: true,
      document_type: true,
      document_json: true,
    },
  });
}

async function getQueuedCertificates(prisma) {
  const activeStatus = await prisma.mal_status_code_lu.findFirst({
    where: { code_name: "ACT" },
  });

  return prisma.mal_licence_summary_vw.findMany({
    where: { print_certificate: true, status_code_id: activeStatus.id },
  });
}

async function startCertificateJob(prisma, licenceIds) {
  const licenceFilterCriteria = {
    id: {
      in: licenceIds,
    },
  };

  /** */
  // Reissue licences Logic
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Los_Angeles', year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-');
  const licencesToReissue = await prisma.mal_licence.findMany({
    where: {
      id: { in: licenceIds },
      reissue_licence: true
    },
    select: {
      id: true,
      licence_number: true,
      licence_type_id: true,
      irma_number: true,
    }
  });

  const currentUser = getCurrentUser();
  const now = new Date();

  await prisma.$transaction(async (tx) => {
    for (const licence of licencesToReissue) {
      console.log(licence)
      console.log(licence.irma_number)
      await tx.mal_licence.update({
        where: { id: licence.id },
        data: { reissue_date: new Date(today), reissue_licence: false }
      });
      // don't create duplicate reissue dates for a license
      const existing = await tx.mal_licence_reissue_date.findFirst({
        where: {
          licence_id: licence.id,
          reissue_date: new Date(today)
        }
      });
      // if no duplicates, create an entry in the mal_licence_reissue_date table
      if (!existing) {
        await tx.mal_licence_reissue_date.create({
          data: {
            reissue_date: new Date(today),
            licence_id: licence.id,
            licence_number: licence.licence_number.toString(),
            licence_type_id: licence.licence_type_id,
            irma_number: licence.irma_number,
            create_userid: currentUser.idir,
            create_timestamp: now,
            update_userid: currentUser.idir,
            update_timestamp: now
          }
        });
      }
    }
  });
  /** */

  const [, , procedureResult, ,] = await prisma.$transaction([
    // ensure selected licences have print_certificate set to true
    prisma.mal_licence.updateMany({
      where: licenceFilterCriteria,
      data: { print_certificate: true },
    }),
    // ensure other licences have print_certificate set to false
    prisma.mal_licence.updateMany({
      where: { NOT: licenceFilterCriteria },
      data: { print_certificate: false },
    }),
    prisma.$queryRawUnsafe(
      "CALL mals_app.pr_generate_print_json('CERTIFICATE', NULL, NULL, NULL)"
    ),
    prisma.mal_licence.updateMany({
      data: { print_certificate: false },
    }),
  ]);

  const jobId = procedureResult[0].iop_print_job_id;

  const documents = await getPendingDocuments(prisma, jobId);

  return { jobId, documents };
}

async function generateCertificate(prisma, documentId) {
  const document = await getDocument(prisma, documentId);

  const templateFileName = getCertificateTemplateName(
    document.document_type,
    document.licence_type
  );

  if (templateFileName === undefined) {
    return {
      status: 500,
      payload: {
        code: 500,
        description: `Could not find template matching the given document and licence types [${document.document_type}, ${document.licence_type}] for document ${document.id}`,
      },
    };
  }

  if (
    templateBuffers.find((x) => x.templateFileName === templateFileName) ===
    undefined
  ) {
    const buffer = await fs.readFile(
      path.join(certificateTemplateDir, `${templateFileName}.docx`)
    );
    const bufferBase64 = buffer.toString("base64");
    templateBuffers.push({
      templateFileName,
      templateBuffer: bufferBase64,
    });
  }

  const template = templateBuffers.find(
    (x) => x.templateFileName === templateFileName
  );
  // MALS2-6 to re-apply this, uncomment this code and use the 3 updated templates
  // // check if certificate is CARD (3 templates), if so, split into two arrays
  // if (
  //   document.document_type === "CARD" &&
  //   (document.licence_type === "BULK TANK MILK GRADER" ||
  //     document.licence_type === "LIVESTOCK DEALER" ||
  //     document.licence_type === "LIVESTOCK DEALER AGENT")
  // ) {
  //   /**
  //    * The Card templates have a table that is 2 columns by N rows, this function effectively combines
  //    * those two columns into one so that we don't have to deal with bi-directional looping
  //    * (which cdogs doesn't support yet)  */

  //   function combineEntries(licenceType, documentJson) {
  //     let combinedJson = [];
  //     switch (licenceType) {
  //       case "BULK TANK MILK GRADER":
  //         for (let i = 0; i < documentJson.length; i += 2) {
  //           let combinedEntry = { ...documentJson[i] };
  //           if (documentJson[i + 1]) {
  //             combinedEntry.LicenceHolderName2 =
  //               documentJson[i + 1].LicenceHolderName;
  //             combinedEntry.LicenceHolderCompany2 =
  //               documentJson[i + 1].LicenceHolderCompany;
  //             combinedEntry.LicenceNumber2 = documentJson[i + 1].LicenceNumber;
  //             combinedEntry.ExpiryDate2 = documentJson[i + 1].ExpiryDate;
  //             combinedEntry.CardLabel2 = documentJson[i + 1].CardLabel;
  //           } else {
  //             combinedEntry.LicenceHolderName2 = null;
  //             combinedEntry.LicenceHolderCompany2 = null;
  //             combinedEntry.LicenceNumber2 = null;
  //             combinedEntry.ExpiryDate2 = null;
  //             combinedEntry.CardLabel2 = null;
  //           }
  //           combinedJson.push(combinedEntry);
  //         }
  //         return combinedJson;
  //       case "LIVESTOCK DEALER AGENT":
  //         for (let i = 0; i < documentJson.length; i += 2) {
  //           let combinedEntry = { ...documentJson[i] };
  //           if (documentJson[i + 1]) {
  //             combinedEntry.CardType2 = documentJson[i + 1].CardType;
  //             combinedEntry.LicenceHolderName2 =
  //               documentJson[i + 1].LicenceHolderName;
  //             combinedEntry.LastFirstName2 = documentJson[i + 1].LastFirstName;
  //             combinedEntry.AgentFor2 = documentJson[i + 1].AgentFor;
  //             combinedEntry.LicenceNumber2 = documentJson[i + 1].LicenceNumber;
  //             combinedEntry.StartDate2 = documentJson[i + 1].StartDate;
  //             combinedEntry.ExpiryDate2 = documentJson[i + 1].ExpiryDate;
  //           } else {
  //             combinedEntry.CardType2 = null;
  //             combinedEntry.LicenceHolderName2 = null;
  //             combinedEntry.LastFirstName2 = null;
  //             combinedEntry.AgentFor2 = null;
  //             combinedEntry.LicenceNumber2 = null;
  //             combinedEntry.StartDate2 = null;
  //             combinedEntry.ExpiryDate2 = null;
  //           }
  //           combinedJson.push(combinedEntry);
  //         }
  //         return combinedJson;
  //       case "LIVESTOCK DEALER":
  //         for (let i = 0; i < documentJson.length; i += 2) {
  //           let combinedEntry = { ...documentJson[i] };
  //           if (documentJson[i + 1]) {
  //             combinedEntry.CardType2 = documentJson[i + 1].CardType;
  //             combinedEntry.LicenceHolderCompany2 =
  //               documentJson[i + 1].LicenceHolderCompany;
  //             combinedEntry.LicenceNumber2 = documentJson[i + 1].LicenceNumber;
  //             combinedEntry.StartDate2 = documentJson[i + 1].StartDate;
  //             combinedEntry.ExpiryDate2 = documentJson[i + 1].ExpiryDate;
  //           } else {
  //             combinedEntry.CardType2 = null;
  //             combinedEntry.LicenceHolderCompany2 = null;
  //             combinedEntry.LicenceNumber2 = null;
  //             combinedEntry.StartDate2 = null;
  //             combinedEntry.ExpiryDate2 = null;
  //           }
  //           combinedJson.push(combinedEntry);
  //         }
  //         return combinedJson;
  //       default:
  //         return null;
  //     }
  //   }

  //   let updatedJson = combineEntries(
  //     document.licence_type,
  //     document.document_json
  //   );

  //   document.document_json = updatedJson;
  // }

  const generate = async () => {
    const { data, status } = await cdogs.post(
      "template/render",
      formatCdogsBody(document.document_json, template.templateBuffer),
      {
        responseType: "arraybuffer", // Needed for binaries unless you want pain
      }
    );

    if (status !== 200) {
      return {
        status,
        payload: {
          code: status,
          description: "Error encountered in CDOGS",
        },
      };
    }

    const currentUser = getCurrentUser();
    const now = new Date();

    await prisma.mal_print_job_output.update({
      where: { id: document.id },
      data: {
        document_binary: data,
        update_userid: currentUser.idir,
        update_timestamp: now,
      },
    });

    return { status: 200, payload: { documentId: document.id } };
  };

  const result = await generate();

  return result;
}

async function getQueuedRenewals(prisma) {
  const activeStatus = await prisma.mal_status_code_lu.findFirst({
    where: { code_name: "ACT" },
  });

  return prisma.mal_licence_summary_vw.findMany({
    where: { print_renewal: true, status_code_id: activeStatus.id },
  });
}

async function getQueuedApiaryRenewals(prisma, startDate, endDate) {
  const activeStatus = await prisma.mal_status_code_lu.findFirst({
    where: { code_name: "ACT" },
  });

  const andArray = [];
  andArray.push({ licence_type_id: constants.LICENCE_TYPE_ID_APIARY });
  andArray.push({ status_code_id: activeStatus.id });
  andArray.push({ expiry_date: { gte: new Date(startDate) } });
  andArray.push({ expiry_date: { lte: new Date(endDate) } });

  return prisma.mal_licence_summary_vw.findMany({
    where: { AND: andArray },
    orderBy: [
      {
        licence_id: "asc",
      },
    ],
  });
}

async function startRenewalJob(prisma, licenceIds) {
  const licenceFilterCriteria = {
    id: {
      in: licenceIds,
    },
  };

  const [, , procedureResult] = await prisma.$transaction([
    // ensure selected licences have print_renewal set to true
    prisma.mal_licence.updateMany({
      where: licenceFilterCriteria,
      data: { print_renewal: true },
    }),
    // ensure other licences have print_renewal set to false
    prisma.mal_licence.updateMany({
      where: { NOT: licenceFilterCriteria },
      data: { print_renewal: false },
    }),
    prisma.$queryRawUnsafe(
      "CALL mals_app.pr_generate_print_json('RENEWAL', NULL, NULL, NULL)"
    ),
    prisma.mal_licence.updateMany({
      data: { print_renewal: false },
    }),
  ]);

  const jobId = procedureResult[0].iop_print_job_id;
  const documents = await getPendingDocuments(prisma, jobId);

  return { jobId, documents };
}

async function generateRenewal(prisma, documentId) {
  const document = await getDocument(prisma, documentId);

  const templateFileName = getRenewalTemplateName(
    document.document_type,
    document.licence_type
  );

  if (templateFileName === undefined) {
    return {
      status: 500,
      payload: {
        code: 500,
        description: `Could not find template matching the given document and licence types [${document.document_type}, ${document.licence_type}] for document ${document.id}`,
      },
    };
  }

  if (
    templateBuffers.find((x) => x.templateFileName === templateFileName) ===
    undefined
  ) {
    const buffer = await fs.readFile(
      path.join(renewalsTemplateDir, `${templateFileName}.docx`)
    );
    const bufferBase64 = buffer.toString("base64");
    templateBuffers.push({
      templateFileName,
      templateBuffer: bufferBase64,
    });
  }

  const template = templateBuffers.find(
    (x) => x.templateFileName === templateFileName
  );
  const generate = async () => {
    const { data, status } = await cdogs.post(
      "template/render",
      formatCdogsBody(document.document_json, template.templateBuffer),
      {
        responseType: "arraybuffer", // Needed for binaries unless you want pain
      }
    );

    if (status !== 200) {
      return {
        status,
        payload: {
          code: status,
          description: "Error encountered in CDOGS",
        },
      };
    }

    const currentUser = getCurrentUser();
    const now = new Date();

    await prisma.mal_print_job_output.update({
      where: { id: document.id },
      data: {
        document_binary: data,
        update_userid: currentUser.idir,
        update_timestamp: now,
      },
    });

    return { status: 200, payload: { documentId: document.id } };
  };

  const result = await generate();

  return result;
}

async function getQueuedDairyNotices(prisma, startDate, endDate) {
  const andArray = [];
  andArray.push({ recorded_date: { gte: new Date(startDate) } });
  andArray.push({ recorded_date: { lte: new Date(endDate) } });

  return prisma.mal_print_dairy_farm_infraction_vw.findMany({
    where: { AND: andArray },
    orderBy: [
      {
        licence_id: "asc",
      },
    ],
  });
}

async function startDairyNoticeJob(prisma, licenceIds, startDate, endDate) {
  const licenceFilterCriteria = {
    id: {
      in: licenceIds,
    },
  };

  const [, , procedureResult, ,] = await prisma.$transaction([
    // ensure selected licences have print_dairy_infraction set to true
    prisma.mal_licence.updateMany({
      where: licenceFilterCriteria,
      data: { print_dairy_infraction: true },
    }),
    // ensure other licences have print_dairy_infraction set to false
    prisma.mal_licence.updateMany({
      where: { NOT: licenceFilterCriteria },
      data: { print_dairy_infraction: false },
    }),
    prisma.$queryRawUnsafe(
      `CALL mals_app.pr_generate_print_json('DAIRY_INFRACTION', '${startDate}', '${endDate}', NULL)`
    ),
    prisma.mal_licence.updateMany({
      data: { print_dairy_infraction: false },
    }),
  ]);

  const jobId = procedureResult[0].iop_print_job_id;

  const documents = await getPendingDocuments(prisma, jobId);

  return { jobId, documents };
}

async function generateDairyNotice(prisma, documentId) {
  const document = await getDocument(prisma, documentId);

  const templateFileName = getDairyNoticeTemplateName(
    document.document_type,
    document.document_json.SpeciesSubCode,
    document.document_json.CorrespondenceCode
  );

  if (templateFileName === undefined) {
    return {
      status: 500,
      payload: {
        code: 500,
        description: `Could not find template matching the given document and licence types [${document.document_type}, ${document.licence_type}] for document ${document.id}`,
      },
    };
  }

  if (
    templateBuffers.find((x) => x.templateFileName === templateFileName) ===
    undefined
  ) {
    const buffer = await fs.readFile(
      path.join(dairyNoticeTemplateDir, `${templateFileName}.docx`)
    );
    const bufferBase64 = buffer.toString("base64");
    templateBuffers.push({
      templateFileName,
      templateBuffer: bufferBase64,
    });
  }

  const template = templateBuffers.find(
    (x) => x.templateFileName === templateFileName
  );
  const generate = async () => {
    const { data, status } = await cdogs.post(
      "template/render",
      formatCdogsBody(document.document_json, template.templateBuffer),
      {
        responseType: "arraybuffer", // Needed for binaries unless you want pain
      }
    );

    if (status !== 200) {
      return {
        status,
        payload: {
          code: status,
          description: "Error encountered in CDOGS",
        },
      };
    }

    const currentUser = getCurrentUser();
    const now = new Date();

    await prisma.mal_print_job_output.update({
      where: { id: document.id },
      data: {
        document_binary: data,
        update_userid: currentUser.idir,
        update_timestamp: now,
      },
    });

    return { status: 200, payload: { documentId: document.id } };
  };

  const result = await generate();

  return result;
}

async function getQueuedDairyTankNotices(prisma) {
  return prisma.mal_print_dairy_farm_tank_recheck_vw.findMany({
    where: {
      print_recheck_notice: true,
    },
    orderBy: [
      {
        tank_id: "asc",
      },
    ],
  });
}

async function startDairyTankNoticeJob(prisma, tankIds) {
  const tankFilterCriteria = {
    id: {
      in: tankIds,
    },
  };

  const [, , procedureResult, ,] = await prisma.$transaction([
    // ensure selected licences have print_recheck_notice set to true
    prisma.mal_dairy_farm_tank.updateMany({
      where: tankFilterCriteria,
      data: { print_recheck_notice: true },
    }),
    // ensure other licences have print_recheck_notice set to false
    prisma.mal_dairy_farm_tank.updateMany({
      where: { NOT: tankFilterCriteria },
      data: { print_recheck_notice: false },
    }),
    prisma.$queryRawUnsafe(
      `CALL mals_app.pr_generate_print_json('RECHECK_NOTICE', NULL, NULL, NULL)`
    ),
    prisma.mal_dairy_farm_tank.updateMany({
      data: { print_recheck_notice: false },
    }),
  ]);

  const jobId = procedureResult[0].iop_print_job_id;

  const documents = await getPendingDocuments(prisma, jobId);

  return { jobId, documents };
}

async function generateDairyTankNotice(prisma, documentId) {
  const document = await getDocument(prisma, documentId);

  const templateFileName = getDairyTankNoticeTemplateName(
    document.document_type
  );

  if (templateFileName === undefined) {
    return {
      status: 500,
      payload: {
        code: 500,
        description: `Could not find template matching the given document and licence types [${document.document_type}, ${document.licence_type}] for document ${document.id}`,
      },
    };
  }

  if (
    templateBuffers.find((x) => x.templateFileName === templateFileName) ===
    undefined
  ) {
    const buffer = await fs.readFile(
      path.join(dairyNoticeTemplateDir, `${templateFileName}.docx`)
    );
    const bufferBase64 = buffer.toString("base64");
    templateBuffers.push({
      templateFileName,
      templateBuffer: bufferBase64,
    });
  }

  const template = templateBuffers.find(
    (x) => x.templateFileName === templateFileName
  );
  const generate = async () => {
    const { data, status } = await cdogs.post(
      "template/render",
      formatCdogsBody(document.document_json, template.templateBuffer),
      {
        responseType: "arraybuffer", // Needed for binaries unless you want pain
      }
    );

    if (status !== 200) {
      return {
        status,
        payload: {
          code: status,
          description: "Error encountered in CDOGS",
        },
      };
    }

    const currentUser = getCurrentUser();
    const now = new Date();

    await prisma.mal_print_job_output.update({
      where: { id: document.id },
      data: {
        document_binary: data,
        update_userid: currentUser.idir,
        update_timestamp: now,
      },
    });

    return { status: 200, payload: { documentId: document.id } };
  };

  const result = await generate();

  return result;
}

async function startActionRequiredJob(prisma, licenceTypeId) {
  const [procedureResult] = await prisma.$transaction([
    prisma.$queryRawUnsafe(
      `CALL mals_app.pr_generate_print_json_action_required(${licenceTypeId}, NULL)`
    ),
  ]);

  const jobId = procedureResult[0].iop_print_job_id;
  const documents = await getPendingDocuments(prisma, jobId);
  return { jobId, documents };
}

async function startApiaryHiveInspectionJob(prisma, startDate, endDate) {
  const [procedureResult] = await prisma.$transaction([
    prisma.$queryRawUnsafe(
      `CALL mals_app.pr_generate_print_json_apiary_inspection('${startDate}', '${endDate}', NULL)`
    ),
  ]);

  const jobId = procedureResult[0].iop_print_job_id;
  const documents = await getPendingDocuments(prisma, jobId);
  return { jobId, documents };
}

async function startDairyTrailerInspectionJob(prisma, licenceNumber) {
  const [procedureResult] = await prisma.$transaction([
    prisma.$queryRawUnsafe(
      `CALL mals_app.pr_generate_print_json_dairy_farm_trailer_inspection(${licenceNumber}, NULL)`
    ),
  ]);

  const jobId = procedureResult[0].iop_print_job_id;
  const documents = await getPendingDocuments(prisma, jobId);
  return { jobId, documents };
}

async function startProducersAnalysisRegionJob(prisma) {
  const [procedureResult] = await prisma.$transaction([
    prisma.$queryRawUnsafe(
      `CALL mals_app.pr_generate_print_json_apiary_producer_region(NULL)`
    ),
  ]);

  const jobId = procedureResult[0].iop_print_job_id;
  const documents = await getPendingDocuments(prisma, jobId);
  return { jobId, documents };
}

async function startProducersAnalysisCityJob(prisma, city, minHives, maxHives) {
  const [procedureResult] = await prisma.$transaction([
    prisma.$queryRawUnsafe(
      `CALL mals_app.pr_generate_print_json_apiary_producer_city('${city}', ${minHives}, ${maxHives}, NULL)`
    ),
  ]);

  const jobId = procedureResult[0].iop_print_job_id;
  const documents = await getPendingDocuments(prisma, jobId);
  return { jobId, documents };
}

async function startApiarySiteJob(prisma, region) {
  const [procedureResult] = await prisma.$transaction([
    prisma.$queryRawUnsafe(
      `CALL mals_app.pr_generate_print_json_apiary_site('${region}', NULL)`
    ),
  ]);

  const jobId = procedureResult[0].iop_print_job_id;
  const documents = await getPendingDocuments(prisma, jobId);
  return { jobId, documents };
}

async function startApiarySiteSummaryJob(prisma, region) {
  const [procedureResult] = await prisma.$transaction([
    prisma.$queryRawUnsafe(
      `CALL mals_app.pr_generate_print_json_apiary_site_summary('${region}', NULL)`
    ),
  ]);

  const jobId = procedureResult[0].iop_print_job_id;
  const documents = await getPendingDocuments(prisma, jobId);
  return { jobId, documents };
}

async function startClientDetailsJob(prisma) {
  const [procedureResult] = await prisma.$transaction([
    prisma.$queryRawUnsafe(
      `CALL mals_app.pr_generate_print_json_veterinary_drug_details(NULL)`
    ),
  ]);

  const jobId = procedureResult[0].iop_print_job_id;
  const documents = await getPendingDocuments(prisma, jobId);
  return { jobId, documents };
}

async function startDairyClientDetailsJob(prisma, irmaNumber, startDate, endDate) {
  const [procedureResult] = await prisma.$transaction([
    prisma.$queryRawUnsafe(
      `CALL mals_app.pr_generate_print_json_dairy_farm_details('${irmaNumber}', '${startDate}', '${endDate}', NULL)`
    ),
  ]);

  const jobId = procedureResult[0].iop_print_job_id;
  const documents = await getPendingDocuments(prisma, jobId);
  return { jobId, documents };
}

async function startDairyFarmProducersJob(prisma) {
  const [procedureResult] = await prisma.$transaction([
    prisma.$queryRawUnsafe(
      `CALL mals_app.pr_generate_print_json_dairy_farm_producers(NULL)`
    ),
  ]);

  const jobId = procedureResult[0].iop_print_job_id;
  const documents = await getPendingDocuments(prisma, jobId);
  return { jobId, documents };
}

async function startProvincialFarmQualityJob(prisma, startDate, endDate) {
  const [procedureResult] = await prisma.$transaction([
    prisma.$queryRawUnsafe(
      `CALL mals_app.pr_generate_print_json_dairy_farm_quality('${startDate}', '${endDate}', NULL)`
    ),
  ]);

  const jobId = procedureResult[0].iop_print_job_id;

  const documents = await getPendingDocuments(prisma, jobId);

  return { jobId, documents };
}

async function startDairyThresholdJob(prisma, startDate, endDate) {
  const [procedureResult] = await prisma.$transaction([
    prisma.$queryRawUnsafe(
      `CALL mals_app.pr_generate_print_json_dairy_farm_test_threshold('${startDate}', '${endDate}', NULL)`
    ),
  ]);

  const jobId = procedureResult[0].iop_print_job_id;

  const documents = await getPendingDocuments(prisma, jobId);

  return { jobId, documents };
}

async function startDairyTankRecheckJob(prisma, recheckYear) {
  const [procedureResult] = await prisma.$transaction([
    prisma.$queryRawUnsafe(
      `CALL mals_app.pr_generate_print_json_dairy_farm_tank_recheck('${recheckYear}', NULL)`
    ),
  ]);

  const jobId = procedureResult[0].iop_print_job_id;

  const documents = await getPendingDocuments(prisma, jobId);

  return { jobId, documents };
}

async function startLicenceTypeLocationJob(prisma, licenceTypeId) {
  const [procedureResult] = await prisma.$transaction([
    prisma.$queryRawUnsafe(
      `CALL mals_app.pr_generate_print_json_licence_location(${licenceTypeId}, NULL)`
    ),
  ]);

  const jobId = procedureResult[0].iop_print_job_id;

  const documents = await getPendingDocuments(prisma, jobId);

  return { jobId, documents };
}

async function startLicenceCommentsJob(prisma, licenceNumber) {
  const [procedureResult] = await prisma.$transaction([
    prisma.$queryRawUnsafe(
      `CALL mals_app.pr_generate_print_json_licence_comments('${licenceNumber}', NULL)`,
      licenceNumber
    ),
  ]);

  const jobId = procedureResult[0].iop_print_job_id;

  const documents = await getPendingDocuments(prisma, jobId);

  return { jobId, documents };
}

async function startLicenceExpiryJob(prisma, startDate, endDate) {
  const [procedureResult] = await prisma.$transaction([
    prisma.$queryRawUnsafe(
      `CALL mals_app.pr_generate_print_json_licence_expiry('${startDate}', '${endDate}', NULL)`
    ),
  ]);

  const jobId = procedureResult[0].iop_print_job_id;

  const documents = await getPendingDocuments(prisma, jobId);

  return { jobId, documents };
}

async function generateReport(prisma, documentId) {
  const document = await getDocument(prisma, documentId);
  const templateFileName = getReportsTemplateName(document.document_type);

  if (templateFileName === undefined) {
    return {
      status: 500,
      payload: {
        code: 500,
        description: `Could not find template matching the given document and licence types [${document.document_type}, ${document.licence_type}] for document ${document.id}`,
      },
    };
  }

  if (
    templateBuffers.find((x) => x.templateFileName === templateFileName) ===
    undefined
  ) {
    const buffer = await fs.readFile(
      path.join(reportsTemplateDir, `${templateFileName}.xlsx`)
    );
    const bufferBase64 = buffer.toString("base64");
    templateBuffers.push({
      templateFileName,
      templateBuffer: bufferBase64,
    });
  }

  const template = templateBuffers.find(
    (x) => x.templateFileName === templateFileName
  );
  const generate = async () => {
    const { data, status } = await cdogs.post(
      "template/render",
      formatCdogsBody(
        document.document_json,
        template.templateBuffer,
        "document",
        "xlsx",
        "xlsx"
      ),
      {
        responseType: "arraybuffer", // Needed for binaries unless you want pain
      }
    );

    if (status !== 200) {
      return {
        status,
        payload: {
          code: status,
          description: "Error encountered in CDOGS",
        },
      };
    }

    const currentUser = getCurrentUser();
    const now = new Date();

    await prisma.mal_print_job_output.update({
      where: { id: document.id },
      data: {
        document_binary: data,
        update_userid: currentUser.idir,
        update_timestamp: now,
      },
    });

    return { status: 200, payload: { documentId: document.id } };
  };

  const result = await generate();

  return result;
}

router.get("/certificates/queued", async (req, res, next) => {
  await withPrisma(async (prisma) => {
    const records = await getQueuedCertificates(prisma);
    const payload = records.map((record) =>
      licence.convertCertificateToLogicalModel(record)
    );
    return res.send(payload);
  }).catch(next);
});

router.post("/certificates/startJob", async (req, res, next) => {
  const licenceIds = req.body.map((licenceId) => parseInt(licenceId, 10));

  await withPrisma(async (prisma) => {
    const { jobId, documents } = await startCertificateJob(prisma, licenceIds);
    return res.send({ jobId, documents });
  }).catch(next);
});

router.post(
  "/certificates/generate/:documentId(\\d+)",
  async (req, res, next) => {
    const documentId = parseInt(req.params.documentId, 10);

    await withPrisma(async (prisma) => {
      const result = await generateCertificate(prisma, documentId);
      return res.status(result.status).send(result.payload);
    }).catch(next);
  }
);

router.post(
  "/certificates/completeJob/:jobId(\\d+)",
  async (req, res, next) => {
    const jobId = parseInt(req.params.jobId, 10);

    await withPrisma(async (prisma) => {
      await prisma.mal_print_job.update({
        where: {
          id: jobId,
        },
        data: {
          document_end_time: new Date(),
        },
      });
      return res.status(200).send(true);
    }).catch(next);
  }
);

router.get("/renewals/queued", async (req, res, next) => {
  await withPrisma(async (prisma) => {
    const records = await getQueuedRenewals(prisma);
    const payload = records.map((record) =>
      licence.convertRenewalToLogicalModel(record)
    );
    return res.send(payload);
  }).catch(next);
});

router.post("/renewals/apiary/queued", async (req, res, next) => {
  const startDate = formatDate(new Date(req.body.startDate));
  const endDate = formatDate(new Date(req.body.endDate));

  await withPrisma(async (prisma) => {
    const records = await getQueuedApiaryRenewals(prisma, startDate, endDate);
    const payload = records.map((record) =>
      licence.convertRenewalToLogicalModel(record)
    );
    return res.send(payload);
  }).catch(next);
});

router.post("/renewals/startJob", async (req, res, next) => {
  const licenceIds = req.body.map((licenceId) => parseInt(licenceId, 10));

  await withPrisma(async (prisma) => {
    const { jobId, documents } = await startRenewalJob(prisma, licenceIds);
    return res.send({ jobId, documents });
  }).catch(next);
});

router.post("/renewals/generate/:documentId(\\d+)", async (req, res, next) => {
  const documentId = parseInt(req.params.documentId, 10);

  await withPrisma(async (prisma) => {
    const result = await generateRenewal(prisma, documentId);
    return res.status(result.status).send(result.payload);
  }).catch(next);
});

router.post("/renewals/completeJob/:jobId(\\d+)", async (req, res, next) => {
  const jobId = parseInt(req.params.jobId, 10);

  await withPrisma(async (prisma) => {
    await prisma.mal_print_job.update({
      where: {
        id: jobId,
      },
      data: {
        document_end_time: new Date(),
      },
    });
    return res.status(200).send(true);
  }).catch(next);
});

router.post("/dairyNotices/queued", async (req, res, next) => {
  const startDate = formatDate(new Date(req.body.startDate));
  const endDate = formatDate(new Date(req.body.endDate));

  await withPrisma(async (prisma) => {
    const records = await getQueuedDairyNotices(prisma, startDate, endDate);
    const payload = records.map((record) =>
      dairyFarmInfractionView.convertToLogicalModel(record)
    );

    return res.send(payload);
  }).catch(next);
});

router.post("/dairyNotices/startJob", async (req, res, next) => {
  const licenceIds = req.body.licenceIds.map((licenceId) =>
    parseInt(licenceId, 10)
  );

  const startDate = formatDate(new Date(req.body.startDate));
  const endDate = formatDate(new Date(req.body.endDate));

  await withPrisma(async (prisma) => {
    const { jobId, documents } = await startDairyNoticeJob(prisma, licenceIds, startDate, endDate);
    return res.send({ jobId, documents });
  }).catch(next);
});

router.post(
  "/dairyNotices/generate/:documentId(\\d+)",
  async (req, res, next) => {
    const documentId = parseInt(req.params.documentId, 10);

    await withPrisma(async (prisma) => {
      const result = await generateDairyNotice(prisma, documentId);
      return res.status(result.status).send(result.payload);
    }).catch(next);
  }
);

router.post(
  "/dairyNotices/completeJob/:jobId(\\d+)",
  async (req, res, next) => {
    const jobId = parseInt(req.params.jobId, 10);

    await withPrisma(async (prisma) => {
      await prisma.mal_print_job.update({
        where: {
          id: jobId,
        },
        data: {
          document_end_time: new Date(),
        },
      });
      return res.status(200).send(true);
    }).catch(next);
  }
);

router.get("/dairyTankNotices/queued", async (req, res, next) => {
  await withPrisma(async (prisma) => {
    const records = await getQueuedDairyTankNotices(prisma);
    const payload = records.map((record) =>
      dairyFarmTankRecheckView.convertToLogicalModel(record)
    );

    return res.send(payload);
  }).catch(next);
});

router.post("/dairyTankNotices/startJob", async (req, res, next) => {
  const tankIds = req.body.map((tankId) => parseInt(tankId, 10));

  await withPrisma(async (prisma) => {
    const { jobId, documents } = await startDairyTankNoticeJob(prisma, tankIds);
    return res.send({ jobId, documents });
  }).catch(next);
});

router.post(
  "/dairyTankNotices/generate/:documentId(\\d+)",
  async (req, res, next) => {
    const documentId = parseInt(req.params.documentId, 10);

    await withPrisma(async (prisma) => {
      const result = await generateDairyTankNotice(prisma, documentId);
      return res.status(result.status).send(result.payload);
    }).catch(next);
  }
);

router.post(
  "/dairyTankNotices/completeJob/:jobId(\\d+)",
  async (req, res, next) => {
    const jobId = parseInt(req.params.jobId, 10);

    await withPrisma(async (prisma) => {
      await prisma.mal_print_job.update({
        where: {
          id: jobId,
        },
        data: {
          document_end_time: new Date(),
        },
      });
      return res.status(200).send(true);
    }).catch(next);
  }
);

router.post(
  "/reports/startJob/actionRequired/:licenceTypeId(\\d+)",
  async (req, res, next) => {
    const licenceTypeId = parseInt(req.params.licenceTypeId, 10);

    await withPrisma(async (prisma) => {
      const { jobId, documents } = await startActionRequiredJob(prisma, licenceTypeId);
      return res.send({ jobId, documents, type: REPORTS.ACTION_REQUIRED });
    }).catch(next);
  }
);

router.post(
  "/reports/startJob/apiaryHiveInspection",
  async (req, res, next) => {
    const startDate = formatDate(new Date(req.body.startDate));
    const endDate = formatDate(new Date(req.body.endDate));

    await withPrisma(async (prisma) => {
      const { jobId, documents } = await startApiaryHiveInspectionJob(prisma, startDate, endDate);
      return res.send({ jobId, documents, type: REPORTS.APIARY_INSPECTION });
    }).catch(next);
  }
);

router.post(
  "/reports/startJob/dairyTrailerInspection",
  async (req, res, next) => {
    const licenceNumber = parseAsInt(req.body.licenceNumber);

    await withPrisma(async (prisma) => {
      const { jobId, documents } = await startDairyTrailerInspectionJob(prisma, licenceNumber);
      return res.send({
        jobId,
        documents,
        type: REPORTS.DAIRY_TRAILER_INSPECTION,
      });
    }).catch(next);
  }
);

router.post(
  "/reports/startJob/producersAnalysisRegion",
  async (req, res, next) => {
    await withPrisma(async (prisma) => {
      const { jobId, documents } = await startProducersAnalysisRegionJob(prisma);
      return res.send({
        jobId,
        documents,
        type: REPORTS.APIARY_PRODUCER_REGION,
      });
    }).catch(next);
  }
);

router.post(
  "/reports/startJob/producersAnalysisCity",
  async (req, res, next) => {
    const { city } = req.body;
    const minHives = parseAsInt(req.body.minHives);
    const maxHives = parseAsInt(req.body.maxHives);

    await withPrisma(async (prisma) => {
      const { jobId, documents } = await startProducersAnalysisCityJob(prisma, city, minHives, maxHives);
      return res.send({
        jobId,
        documents,
        type: REPORTS.APIARY_PRODUCER_CITY,
      });
    }).catch(next);
  }
);

router.post("/reports/startJob/apiarySite", async (req, res, next) => {
  const { region } = req.body;

  await withPrisma(async (prisma) => {
    const { jobId, documents } = await startApiarySiteJob(prisma, region);
    return res.send({
      jobId,
      documents,
      type: REPORTS.APIARY_SITE,
    });
  }).catch(next);
});

router.post("/reports/startJob/apiarySiteSummary", async (req, res, next) => {
  const { region } = req.body;

  await withPrisma(async (prisma) => {
    const { jobId, documents } = await startApiarySiteSummaryJob(prisma, region);
    return res.send({
      jobId,
      documents,
      type: REPORTS.APIARY_SITE_SUMMARY,
    });
  }).catch(next);
});

router.post("/reports/startJob/clientDetails", async (req, res, next) => {
  await withPrisma(async (prisma) => {
    const { jobId, documents } = await startClientDetailsJob(prisma);
    return res.send({
      jobId,
      documents,
      type: REPORTS.CLIENT_DETAILS,
    });
  }).catch(next);
});

router.post("/reports/startJob/dairyClientDetails", async (req, res, next) => {
  const { irmaNumber } = req.body;
  const startDate = formatDate(new Date(req.body.startDate));
  const endDate = formatDate(new Date(req.body.endDate));

  await withPrisma(async (prisma) => {
    const { jobId, documents } = await startDairyClientDetailsJob(prisma, irmaNumber, startDate, endDate);
    return res.send({
      jobId,
      documents,
      type: REPORTS.DAIRY_FARM_DETAIL,
    });
  }).catch(next);
});

router.post("/reports/startJob/dairyFarmProducers", async (req, res, next) => {
  await withPrisma(async (prisma) => {
    const { jobId, documents } = await startDairyFarmProducersJob(prisma);
    return res.send({
      jobId,
      documents,
      type: REPORTS.DAIRY_FARM_PRODUCERS,
    });
  }).catch(next);
});

router.post(
  "/reports/startJob/provincialFarmQuality",
  async (req, res, next) => {
    const startDate = formatDate(new Date(req.body.startDate));
    const endDate = formatDate(new Date(req.body.endDate));

    await withPrisma(async (prisma) => {
      const { jobId, documents } = await startProvincialFarmQualityJob(prisma, startDate, endDate);
      return res.send({ jobId, documents, type: REPORTS.DAIRY_FARM_QUALITY });
    }).catch(next);
  }
);

router.post("/reports/startJob/dairyThreshold", async (req, res, next) => {
  const startDate = formatDate(new Date(req.body.startDate));
  const endDate = formatDate(new Date(req.body.endDate));

  await withPrisma(async (prisma) => {
    const { jobId, documents } = await startDairyThresholdJob(prisma, startDate, endDate);
    return res.send({ jobId, documents, type: REPORTS.DAIRY_TEST_THRESHOLD });
  }).catch(next);
});

router.post("/reports/startJob/dairyTankRecheck", async (req, res, next) => {
  await withPrisma(async (prisma) => {
    const { jobId, documents } = await startDairyTankRecheckJob(prisma, req.body.recheckYear);
    return res.send({ jobId, documents, type: REPORTS.DAIRY_FARM_TANK });
  }).catch(next);
});

router.post("/reports/startJob/licenceTypeLocation", async (req, res, next) => {
  const licenceTypeId = parseAsInt(req.body.licenceTypeId);

  await withPrisma(async (prisma) => {
    const { jobId, documents } = await startLicenceTypeLocationJob(prisma, licenceTypeId);
    return res.send({ jobId, documents, type: REPORTS.LICENCE_LOCATION });
  }).catch(next);
});

router.post("/reports/startJob/licenceComments", async (req, res, next) => {
  const licenceNumber = req.body.licenceNumber;

  await withPrisma(async (prisma) => {
    const { jobId, documents } = await startLicenceCommentsJob(prisma, licenceNumber);
    return res.send({ jobId, documents, type: REPORTS.LICENCE_COMMENTS });
  }).catch(next);
});

router.post("/reports/startJob/licenceExpiry", async (req, res, next) => {
  const startDate = formatDate(new Date(req.body.startDate));
  const endDate = formatDate(new Date(req.body.endDate));

  await withPrisma(async (prisma) => {
    const { jobId, documents } = await startLicenceExpiryJob(prisma, startDate, endDate);
    return res.send({ jobId, documents, type: REPORTS.LICENCE_EXPIRY });
  }).catch(next);
});

router.post("/reports/generate/:documentId(\\d+)", async (req, res, next) => {
  const documentId = parseInt(req.params.documentId, 10);

  await withPrisma(async (prisma) => {
    const result = await generateReport(prisma, documentId);
    return res.status(result.status).send(result.payload);
  }).catch(next);
});

router.get("/jobs/:jobId(\\d+)", async (req, res, next) => {
  const jobId = parseInt(req.params.jobId, 10);

  await withPrisma(async (prisma) => {
    const job = await getJob(prisma, jobId);
    return res.send(job);
  }).catch(next);
});

router.get("/pending/:jobId(\\d+)", async (req, res, next) => {
  const jobId = parseInt(req.params.jobId, 10);

  await withPrisma(async (prisma) => {
    const records = await getPendingDocuments(prisma, jobId);
    return res.send(records);
  }).catch(next);
});

router.post("/completeJob/:jobId(\\d+)", async (req, res, next) => {
  const jobId = parseInt(req.params.jobId, 10);

  await withPrisma(async (prisma) => {
    await prisma.mal_print_job.update({
      where: {
        id: jobId,
      },
      data: {
        document_end_time: new Date(),
      },
    });
    return res.status(200).send(true);
  }).catch(next);
});

router.post("/generator-health", async (req, res, next) => {
  await cdogs
    .get("health", {
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then(({ data, status }) => {
      res.status(status).json(data);
    })
    .catch(next);
});

router.post("/download/:jobId(\\d+)", async (req, res, next) => {
  const jobId = parseInt(req.params.jobId, 10);
  await withPrisma(async (prisma) => {
    const job = await getJob(prisma, jobId);
    const documents = await getJobBlobs(prisma, jobId);
    const zip = new AdmZip();
    let fileName = null;
    const today = new Date()
      .toLocaleDateString("en-US", {
        timeZone: "America/Los_Angeles",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
      .replace(/\//g, "_");
    documents.forEach((document) => {
      if (
        job.printCategory === constants.DOCUMENT_TYPE_REPORT &&
        document.document_type === constants.REPORTS.LICENCE_COMMENTS
      ) {
        fileName = `${document.document_json.Licence_Number}-${document.document_type}.xlsx`;
      } else if (
        job.printCategory === constants.DOCUMENT_TYPE_REPORT &&
        document.document_type === constants.REPORTS.DAIRY_TRAILER_INSPECTION
      ) {
        fileName = `${document.document_json.LicenceNumber}-${document.document_type}.xlsx`;
      } else if (
        job.printCategory === constants.DOCUMENT_TYPE_REPORT &&
        document.document_type === constants.REPORTS.DAIRY_FARM_PRODUCERS
      ) {
        fileName = `${document.document_type}-${today}.xlsx`;
      } else if (job.printCategory === constants.DOCUMENT_TYPE_REPORT) {
        fileName = `${document.document_json.Licence_Type}-${document.document_type}.xlsx`;
      } else if (
        document.document_type === constants.DOCUMENT_TYPE_DAIRY_INFRACTION
      ) {
        fileName = `${document.licence_number}-${document.document_type}-${document.document_json.SpeciesSubCode}-${document.document_json.CorrespondenceCode}.docx`;
      } else {
        fileName = `${document.licence_number}-${document.document_type}.docx`;
      }
      zip.addFile(fileName, document.document_binary);
    });

    res
      .set({
        "content-disposition": `attachment; filename=${jobId}.zip`,
        "content-type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      })
      .send(zip.toBuffer());
  }).catch(next);
});

module.exports = router;
