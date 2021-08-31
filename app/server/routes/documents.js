const express = require("express");
const { PrismaClient } = require("@prisma/client");
const axios = require("axios");
const oauth = require("axios-oauth-client");
const tokenProvider = require("axios-token-interceptor");
const AdmZip = require("adm-zip");
const path = require("path");
const fs = require("fs").promises;

const licence = require("../models/licence");
const dairyFarmInfractionView = require("../models/dairyFarmInfractionView");
const dairyFarmTankRecheckView = require("../models/dairyFarmTankRecheckView");
const constants = require("../utilities/constants");
const { getCurrentUser } = require("../utilities/user");
const {
  formatCdogsBody,
  getCertificateTemplateName,
  getRenewalTemplateName,
  getDairyNoticeTemplateName,
  getDairyTankNoticeTemplateName,
  getReportsTemplateName,
} = require("../utilities/documents");
const { formatDate } = require("../utilities/formatting");
const { parseAsInt } = require("../utilities/parsing");
const { REPORTS } = require("../utilities/constants");

const prisma = new PrismaClient();
const router = express.Router();

const certificateTemplateDir = path.join(
  __dirname,
  "../static/templates/certificates"
);
const renewalsTemplateDir = path.join(__dirname, "../static/templates/notices");
const dairyNoticeTemplateDir = path.join(
  __dirname,
  "../static/templates/notices/dairy"
);
const reportsTemplateDir = path.join(__dirname, "../static/templates/reports");

// As templates are converted to base 64 for the first time they will be pushed to this for reuse
const templateBuffers = [];

const cdogs = axios.create({
  baseURL: process.env.CDOGS_URL,
  timeout: 10000,
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
      client_id: "MALS_SERVICE_CLIENT",
      client_secret: process.env.CDOGS_SECRET,
      scope: "",
    })
  )
);

//#region Certificate Functions

async function getQueuedCertificates() {
  const activeStatus = await prisma.mal_status_code_lu.findFirst({
    where: { code_name: "ACT" },
  });

  return prisma.mal_licence_summary_vw.findMany({
    where: { print_certificate: true, status_code_id: activeStatus.id },
  });
}

async function startCertificateJob(licenceIds) {
  const licenceFilterCriteria = {
    id: {
      in: licenceIds,
    },
  };

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
    prisma.$queryRaw(
      "CALL mals_app.pr_generate_print_json('CERTIFICATE', NULL, NULL, NULL)"
    ),
    prisma.mal_licence.updateMany({
      data: { print_certificate: false },
    }),
  ]);

  const jobId = procedureResult[0].iop_print_job_id;

  const documents = await getPendingDocuments(jobId);

  return { jobId, documents };
}

async function generateCertificate(documentId) {
  const document = await getDocument(documentId);

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
      templateFileName: templateFileName,
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

//#endregion

//#region Renewal Functions

async function getQueuedRenewals() {
  const activeStatus = await prisma.mal_status_code_lu.findFirst({
    where: { code_name: "ACT" },
  });

  return prisma.mal_licence_summary_vw.findMany({
    where: { print_renewal: true, status_code_id: activeStatus.id },
  });
}

async function getQueuedApiaryRenewals(startDate, endDate) {
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

async function startRenewalJob(licenceIds) {
  const licenceFilterCriteria = {
    id: {
      in: licenceIds,
    },
  };

  const [, , procedureResult, ,] = await prisma.$transaction([
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
    prisma.$queryRaw(
      "CALL mals_app.pr_generate_print_json('RENEWAL', NULL, NULL, NULL)"
    ),
    prisma.mal_licence.updateMany({
      data: { print_renewal: false },
    }),
  ]);

  const jobId = procedureResult[0].iop_print_job_id;

  const documents = await getPendingDocuments(jobId);

  return { jobId, documents };
}

async function generateRenewal(documentId) {
  const document = await getDocument(documentId);

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
      templateFileName: templateFileName,
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

//#endregion

//#region Dairy Notices Functions

async function getQueuedDairyNotices(startDate, endDate) {
  const activeStatus = await prisma.mal_status_code_lu.findFirst({
    where: { code_name: "ACT" },
  });

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

async function startDairyNoticeJob(licenceIds, startDate, endDate) {
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
    prisma.$queryRaw(
      `CALL mals_app.pr_generate_print_json('DAIRY_INFRACTION', '${startDate}', '${endDate}', NULL)`
    ),
    prisma.mal_licence.updateMany({
      data: { print_dairy_infraction: false },
    }),
  ]);

  const jobId = procedureResult[0].iop_print_job_id;

  const documents = await getPendingDocuments(jobId);

  return { jobId, documents };
}

async function generateDairyNotice(documentId) {
  const document = await getDocument(documentId);

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
      templateFileName: templateFileName,
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

//#endregion

//#region Dairy Tank Notices Functions

async function getQueuedDairyTankNotices() {
  const activeStatus = await prisma.mal_status_code_lu.findFirst({
    where: { code_name: "ACT" },
  });

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

async function startDairyTankNoticeJob(tankIds) {
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
    prisma.$queryRaw(
      `CALL mals_app.pr_generate_print_json('RECHECK_NOTICE', NULL, NULL, NULL)`
    ),
    prisma.mal_dairy_farm_tank.updateMany({
      data: { print_recheck_notice: false },
    }),
  ]);

  const jobId = procedureResult[0].iop_print_job_id;

  const documents = await getPendingDocuments(jobId);

  return { jobId, documents };
}

async function generateDairyTankNotice(documentId) {
  const document = await getDocument(documentId);

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
      templateFileName: templateFileName,
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

//#endregion

//#region Reports Functions

async function startActionRequiredJob(licenceTypeId) {
  const [procedureResult] = await prisma.$transaction([
    prisma.$queryRaw(
      `CALL mals_app.pr_generate_print_json_action_required(${licenceTypeId}, NULL)`
    ),
  ]);

  const jobId = procedureResult[0].iop_print_job_id;
  const documents = await getPendingDocuments(jobId);
  return { jobId, documents };
}

async function startApiaryHiveInspectionJob(startDate, endDate) {
  const [procedureResult] = await prisma.$transaction([
    prisma.$queryRaw(
      `CALL mals_app.pr_generate_print_json_apiary_inspection('${startDate}', '${endDate}', NULL)`
    ),
  ]);

  const jobId = procedureResult[0].iop_print_job_id;
  const documents = await getPendingDocuments(jobId);
  return { jobId, documents };
}

async function startProducersAnalysisRegionJob() {
  const [procedureResult] = await prisma.$transaction([
    prisma.$queryRaw(
      `CALL mals_app.pr_generate_print_json_apiary_producer_region(NULL)`
    ),
  ]);

  const jobId = procedureResult[0].iop_print_job_id;
  const documents = await getPendingDocuments(jobId);
  return { jobId, documents };
}

async function startProducersAnalysisCityJob(city, minHives, maxHives) {
  const [procedureResult] = await prisma.$transaction([
    prisma.$queryRaw(
      `CALL mals_app.pr_generate_print_json_apiary_producer_city('${city}', ${minHives}, ${maxHives}, NULL)`
    ),
  ]);

  const jobId = procedureResult[0].iop_print_job_id;
  const documents = await getPendingDocuments(jobId);
  return { jobId, documents };
}

async function startApiarySiteJob(region) {
  const [procedureResult] = await prisma.$transaction([
    prisma.$queryRaw(
      `CALL mals_app.pr_generate_print_json_apiary_site('${region}', NULL)`
    ),
  ]);

  const jobId = procedureResult[0].iop_print_job_id;
  const documents = await getPendingDocuments(jobId);
  return { jobId, documents };
}

async function startClientDetailsJob() {
  const [procedureResult] = await prisma.$transaction([
    prisma.$queryRaw(
      `CALL mals_app.pr_generate_print_json_veterinary_drug_details(NULL)`
    ),
  ]);

  const jobId = procedureResult[0].iop_print_job_id;
  const documents = await getPendingDocuments(jobId);
  return { jobId, documents };
}

async function startDairyClientDetailsJob(irmaNumber, startDate, endDate) {
  const [procedureResult] = await prisma.$transaction([
    prisma.$queryRaw(
      `CALL mals_app.pr_generate_print_json_dairy_farm_details('${irmaNumber}', '${startDate}', '${endDate}', NULL)`
    ),
  ]);

  const jobId = procedureResult[0].iop_print_job_id;
  const documents = await getPendingDocuments(jobId);
  return { jobId, documents };
}

async function startProvincialFarmQualityJob(startDate, endDate) {
  const [procedureResult] = await prisma.$transaction([
    prisma.$queryRaw(
      `CALL mals_app.pr_generate_print_json_dairy_farm_quality('${startDate}', '${endDate}', NULL)`
    ),
  ]);

  const jobId = procedureResult[0].iop_print_job_id;

  const documents = await getPendingDocuments(jobId);

  return { jobId, documents };
}

async function startDairyThresholdJob(startDate, endDate) {
  const [procedureResult] = await prisma.$transaction([
    prisma.$queryRaw(
      `CALL mals_app.pr_generate_print_json_dairy_farm_test_threshold('${startDate}', '${endDate}', NULL)`
    ),
  ]);

  const jobId = procedureResult[0].iop_print_job_id;

  const documents = await getPendingDocuments(jobId);

  return { jobId, documents };
}

async function startDairyTankRecheckJob(recheckYear) {
  const [procedureResult] = await prisma.$transaction([
    prisma.$queryRaw(
      `CALL mals_app.pr_generate_print_json_dairy_farm_tank_recheck('${recheckYear}', NULL)`
    ),
  ]);

  const jobId = procedureResult[0].iop_print_job_id;

  const documents = await getPendingDocuments(jobId);

  return { jobId, documents };
}

async function startLicenceTypeLocationJob(licenceTypeId) {
  const [procedureResult] = await prisma.$transaction([
    prisma.$queryRaw(
      `CALL mals_app.pr_generate_print_json_licence_location(${licenceTypeId}, NULL)`
    ),
  ]);

  const jobId = procedureResult[0].iop_print_job_id;

  const documents = await getPendingDocuments(jobId);

  return { jobId, documents };
}

async function startLicenceExpiryJob(startDate, endDate) {
  const [procedureResult] = await prisma.$transaction([
    prisma.$queryRaw(
      `CALL mals_app.pr_generate_print_json_licence_expiry('${startDate}', '${endDate}', NULL)`
    ),
  ]);

  const jobId = procedureResult[0].iop_print_job_id;

  const documents = await getPendingDocuments(jobId);

  return { jobId, documents };
}

async function generateReport(documentId) {
  const document = await getDocument(documentId);

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
      templateFileName: templateFileName,
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

//#endregion

//#region General Functions

async function getPendingDocuments(jobId) {
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

async function getDocument(documentId) {
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

async function getJob(jobId) {
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

async function getJobBlobs(jobId) {
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

//#endregion

//#region Certificates Endpoints

router.get("/certificates/queued", async (req, res, next) => {
  await getQueuedCertificates()
    .then(async (records) => {
      const payload = records.map((record) =>
        licence.convertCertificateToLogicalModel(record)
      );

      return res.send(payload);
    })
    .catch(next)
    .finally(async () => prisma.$disconnect());
});

router.post("/certificates/startJob", async (req, res, next) => {
  const licenceIds = req.body.map((licenceId) => parseInt(licenceId, 10));

  await startCertificateJob(licenceIds)
    .then(({ jobId, documents }) => {
      return res.send({ jobId, documents });
    })
    .catch(next)
    .finally(async () => prisma.$disconnect());
});

router.post(
  "/certificates/generate/:documentId(\\d+)",
  async (req, res, next) => {
    const documentId = parseInt(req.params.documentId, 10);

    await generateCertificate(documentId)
      .then(({ status, payload }) => {
        return res.status(status).send(payload);
      })
      .catch(next)
      .finally(async () => prisma.$disconnect());
  }
);

router.post(
  "/certificates/completeJob/:jobId(\\d+)",
  async (req, res, next) => {
    const jobId = parseInt(req.params.jobId, 10);

    await prisma.mal_print_job.update({
      where: {
        id: jobId,
      },
      data: {
        document_end_time: new Date(),
      },
    });

    return res.status(200).send(true);
  }
);

//#endregion

//#region Renewals Endpoints

router.get("/renewals/queued", async (req, res, next) => {
  await getQueuedRenewals()
    .then(async (records) => {
      const payload = records.map((record) =>
        licence.convertRenewalToLogicalModel(record)
      );

      return res.send(payload);
    })
    .catch(next)
    .finally(async () => prisma.$disconnect());
});

router.post("/renewals/apiary/queued", async (req, res, next) => {
  const startDate = formatDate(new Date(req.body.startDate));
  const endDate = formatDate(new Date(req.body.endDate));

  await getQueuedApiaryRenewals(startDate, endDate)
    .then(async (records) => {
      const payload = records.map((record) =>
        licence.convertRenewalToLogicalModel(record)
      );

      return res.send(payload);
    })
    .catch(next)
    .finally(async () => prisma.$disconnect());
});

router.post("/renewals/startJob", async (req, res, next) => {
  const licenceIds = req.body.map((licenceId) => parseInt(licenceId, 10));

  await startRenewalJob(licenceIds)
    .then(({ jobId, documents }) => {
      return res.send({ jobId, documents });
    })
    .catch(next)
    .finally(async () => prisma.$disconnect());
});

router.post("/renewals/generate/:documentId(\\d+)", async (req, res, next) => {
  const documentId = parseInt(req.params.documentId, 10);

  await generateRenewal(documentId)
    .then(({ status, payload }) => {
      return res.status(status).send(payload);
    })
    .catch(next)
    .finally(async () => prisma.$disconnect());
});

router.post("/renewals/completeJob/:jobId(\\d+)", async (req, res, next) => {
  const jobId = parseInt(req.params.jobId, 10);

  await prisma.mal_print_job.update({
    where: {
      id: jobId,
    },
    data: {
      document_end_time: new Date(),
    },
  });

  return res.status(200).send(true);
});

//#endregion

//#region Dairy Notices Endpoints

router.post("/dairyNotices/queued", async (req, res, next) => {
  const startDate = formatDate(new Date(req.body.startDate));
  const endDate = formatDate(new Date(req.body.endDate));

  await getQueuedDairyNotices(startDate, endDate)
    .then(async (records) => {
      const payload = records.map((record) =>
        dairyFarmInfractionView.convertToLogicalModel(record)
      );

      return res.send(payload);
    })
    .catch(next)
    .finally(async () => prisma.$disconnect());
});

router.post("/dairyNotices/startJob", async (req, res, next) => {
  const licenceIds = req.body.licenceIds.map((licenceId) =>
    parseInt(licenceId, 10)
  );

  const startDate = formatDate(new Date(req.body.startDate));
  const endDate = formatDate(new Date(req.body.endDate));

  await startDairyNoticeJob(licenceIds, startDate, endDate)
    .then(({ jobId, documents }) => {
      return res.send({ jobId, documents });
    })
    .catch(next)
    .finally(async () => prisma.$disconnect());
});

router.post(
  "/dairyNotices/generate/:documentId(\\d+)",
  async (req, res, next) => {
    const documentId = parseInt(req.params.documentId, 10);

    await generateDairyNotice(documentId)
      .then(({ status, payload }) => {
        return res.status(status).send(payload);
      })
      .catch(next)
      .finally(async () => prisma.$disconnect());
  }
);

router.post(
  "/dairyNotices/completeJob/:jobId(\\d+)",
  async (req, res, next) => {
    const jobId = parseInt(req.params.jobId, 10);

    await prisma.mal_print_job.update({
      where: {
        id: jobId,
      },
      data: {
        document_end_time: new Date(),
      },
    });

    return res.status(200).send(true);
  }
);

//#endregion

//#region Dairy Tank Notices Endpoints

router.get("/dairyTankNotices/queued", async (req, res, next) => {
  await getQueuedDairyTankNotices()
    .then(async (records) => {
      const payload = records.map((record) =>
        dairyFarmTankRecheckView.convertToLogicalModel(record)
      );

      return res.send(payload);
    })
    .catch(next)
    .finally(async () => prisma.$disconnect());
});

router.post("/dairyTankNotices/startJob", async (req, res, next) => {
  const tankIds = req.body.map((tankId) => parseInt(tankId, 10));

  await startDairyTankNoticeJob(tankIds)
    .then(({ jobId, documents }) => {
      return res.send({ jobId, documents });
    })
    .catch(next)
    .finally(async () => prisma.$disconnect());
});

router.post(
  "/dairyTankNotices/generate/:documentId(\\d+)",
  async (req, res, next) => {
    const documentId = parseInt(req.params.documentId, 10);

    await generateDairyTankNotice(documentId)
      .then(({ status, payload }) => {
        return res.status(status).send(payload);
      })
      .catch(next)
      .finally(async () => prisma.$disconnect());
  }
);

router.post(
  "/dairyTankNotices/completeJob/:jobId(\\d+)",
  async (req, res, next) => {
    const jobId = parseInt(req.params.jobId, 10);

    await prisma.mal_print_job.update({
      where: {
        id: jobId,
      },
      data: {
        document_end_time: new Date(),
      },
    });

    return res.status(200).send(true);
  }
);

//#endregion

//#region Reports Endpoints

router.post(
  "/reports/startJob/actionRequired/:licenceTypeId(\\d+)",
  async (req, res, next) => {
    const licenceTypeId = parseInt(req.params.licenceTypeId, 10);

    await startActionRequiredJob(licenceTypeId)
      .then(({ jobId, documents }) => {
        return res.send({ jobId, documents, type: REPORTS.ACTION_REQUIRED });
      })
      .catch(next)
      .finally(async () => prisma.$disconnect());
  }
);

router.post(
  "/reports/startJob/apiaryHiveInspection",
  async (req, res, next) => {
    const startDate = formatDate(new Date(req.body.startDate));
    const endDate = formatDate(new Date(req.body.endDate));

    await startApiaryHiveInspectionJob(startDate, endDate)
      .then(({ jobId, documents }) => {
        return res.send({ jobId, documents, type: REPORTS.APIARY_INSPECTION });
      })
      .catch(next)
      .finally(async () => prisma.$disconnect());
  }
);

router.post(
  "/reports/startJob/producersAnalysisRegion",
  async (req, res, next) => {
    await startProducersAnalysisRegionJob()
      .then(({ jobId, documents }) => {
        return res.send({
          jobId,
          documents,
          type: REPORTS.APIARY_PRODUCER_REGION,
        });
      })
      .catch(next)
      .finally(async () => prisma.$disconnect());
  }
);

router.post(
  "/reports/startJob/producersAnalysisCity",
  async (req, res, next) => {
    const city = req.body.city;
    const minHives = parseAsInt(req.body.minHives);
    const maxHives = parseAsInt(req.body.maxHives);

    await startProducersAnalysisCityJob(city, minHives, maxHives)
      .then(({ jobId, documents }) => {
        return res.send({
          jobId,
          documents,
          type: REPORTS.APIARY_PRODUCER_CITY,
        });
      })
      .catch(next)
      .finally(async () => prisma.$disconnect());
  }
);

router.post("/reports/startJob/apiarySite", async (req, res, next) => {
  const region = req.body.region;

  await startApiarySiteJob(region)
    .then(({ jobId, documents }) => {
      return res.send({
        jobId,
        documents,
        type: REPORTS.APIARY_SITE,
      });
    })
    .catch(next)
    .finally(async () => prisma.$disconnect());
});

router.post("/reports/startJob/clientDetails", async (req, res, next) => {
  await startClientDetailsJob()
    .then(({ jobId, documents }) => {
      return res.send({
        jobId,
        documents,
        type: REPORTS.CLIENT_DETAILS,
      });
    })
    .catch(next)
    .finally(async () => prisma.$disconnect());
});

router.post("/reports/startJob/dairyClientDetails", async (req, res, next) => {
  const irmaNumber = req.body.irmaNumber;
  const startDate = formatDate(new Date(req.body.startDate));
  const endDate = formatDate(new Date(req.body.endDate));

  await startDairyClientDetailsJob(irmaNumber, startDate, endDate)
    .then(({ jobId, documents }) => {
      return res.send({
        jobId,
        documents,
        type: REPORTS.DAIRY_FARM_DETAIL,
      });
    })
    .catch(next)
    .finally(async () => prisma.$disconnect());
});

router.post(
  "/reports/startJob/provincialFarmQuality",
  async (req, res, next) => {
    const startDate = formatDate(new Date(req.body.startDate));
    const endDate = formatDate(new Date(req.body.endDate));

    await startProvincialFarmQualityJob(startDate, endDate)
      .then(({ jobId, documents }) => {
        return res.send({ jobId, documents, type: REPORTS.DAIRY_FARM_QUALITY });
      })
      .catch(next)
      .finally(async () => prisma.$disconnect());
  }
);

router.post("/reports/startJob/dairyThreshold", async (req, res, next) => {
  const startDate = formatDate(new Date(req.body.startDate));
  const endDate = formatDate(new Date(req.body.endDate));

  await startDairyThresholdJob(startDate, endDate)
    .then(({ jobId, documents }) => {
      return res.send({ jobId, documents, type: REPORTS.DAIRY_TEST_THRESHOLD });
    })
    .catch(next)
    .finally(async () => prisma.$disconnect());
});

router.post("/reports/startJob/dairyTankRecheck", async (req, res, next) => {
  await startDairyTankRecheckJob(req.body.recheckYear)
    .then(({ jobId, documents }) => {
      return res.send({ jobId, documents, type: REPORTS.DAIRY_FARM_TANK });
    })
    .catch(next)
    .finally(async () => prisma.$disconnect());
});

router.post("/reports/startJob/licenceTypeLocation", async (req, res, next) => {
  const licenceTypeId = parseAsInt(req.body.licenceTypeId);

  await startLicenceTypeLocationJob(licenceTypeId)
    .then(({ jobId, documents }) => {
      return res.send({ jobId, documents, type: REPORTS.LICENCE_LOCATION });
    })
    .catch(next)
    .finally(async () => prisma.$disconnect());
});

router.post("/reports/startJob/licenceExpiry", async (req, res, next) => {
  const startDate = formatDate(new Date(req.body.startDate));
  const endDate = formatDate(new Date(req.body.endDate));

  await startLicenceExpiryJob(startDate, endDate)
    .then(({ jobId, documents }) => {
      return res.send({ jobId, documents, type: REPORTS.LICENCE_EXPIRY });
    })
    .catch(next)
    .finally(async () => prisma.$disconnect());
});

router.post("/reports/generate/:documentId(\\d+)", async (req, res, next) => {
  const documentId = parseInt(req.params.documentId, 10);

  await generateReport(documentId)
    .then(({ status, payload }) => {
      return res.status(status).send(payload);
    })
    .catch(next)
    .finally(async () => prisma.$disconnect());
});

//#endregion

//#region General Endpoints

router.get("/jobs/:jobId(\\d+)", async (req, res, next) => {
  const jobId = parseInt(req.params.jobId, 10);

  await getJob(jobId)
    .then((job) => {
      return res.send(job);
    })
    .catch(next)
    .finally(async () => prisma.$disconnect());
});

router.get("/pending/:jobId(\\d+)", async (req, res, next) => {
  const jobId = parseInt(req.params.jobId, 10);

  await getPendingDocuments(jobId)
    .then(async (records) => {
      return res.send(records);
    })
    .catch(next)
    .finally(async () => prisma.$disconnect());
});

router.post("/completeJob/:jobId(\\d+)", async (req, res, next) => {
  const jobId = parseInt(req.params.jobId, 10);

  await prisma.mal_print_job.update({
    where: {
      id: jobId,
    },
    data: {
      document_end_time: new Date(),
    },
  });

  return res.status(200).send(true);
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
  const job = await getJob(jobId);
  await getJobBlobs(jobId)
    .then((documents) => {
      const zip = new AdmZip();
      let fileName = null;
      documents.forEach((document) => {
        if (job.printCategory === constants.DOCUMENT_TYPE_REPORT) {
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
    })
    .catch(next)
    .finally(async () => prisma.$disconnect());
});

module.exports = router;

//#endregion
