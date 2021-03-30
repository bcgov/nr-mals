const express = require("express");
const { PrismaClient } = require("@prisma/client");
const axios = require("axios");
const oauth = require("axios-oauth-client");
const tokenProvider = require("axios-token-interceptor");
const AdmZip = require("adm-zip");
const path = require("path");
const fs = require("fs").promises;

const licence = require("../models/licence");
const constants = require("../utilities/constants");
const { getCurrentUser } = require("../utilities/user");
const {
  formatCdogsBody,
  getCertificateTemplateName,
} = require("../utilities/documents");

const prisma = new PrismaClient();
const router = express.Router();

const certificateTemplateDir = path.join(
  __dirname,
  "../static/templates/certificates"
);

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

async function getQueuedCertificates() {
  const activeStatus = await prisma.mal_status_code_lu.findFirst({
    where: { code_name: "ACT" },
  });

  return prisma.mal_licence_summary_vw.findMany({
    where: { print_certificate: true, status_code_id: activeStatus.id },
  });
}

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

  const result = await fs
    .readFile(path.join(certificateTemplateDir, `${templateFileName}.docx`))
    .then(async (templateBuffer) => {
      const { data, status } = await cdogs.post(
        "template/render",
        formatCdogsBody(
          document.document_json,
          templateBuffer.toString("base64")
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
    });

  return result;
}

async function generateCertificates(documentIds) {
  return Promise.allSettled(
    documentIds.map((documentId) => generateCertificate(documentId))
  );
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
      "CALL mals_app.pr_generate_print_json('CERTIFICATE', NULL)"
    ),
    prisma.mal_licence.updateMany({
      where: licenceFilterCriteria,
      data: { print_certificate: false },
    }),
  ]);

  const jobId = procedureResult[0].iop_print_job_id;

  const documents = await getPendingDocuments(jobId);

  return { jobId, documents };
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
  const totalDocumentCount =
    totalCertificateCount +
    totalEnvelopeCount +
    totalCardCount +
    totalRenewalCount;

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
    totalDocumentCount,
    completedDocumentCount,
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
    },
  });
}

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

router.post("/certificates/generate", async (req, res, next) => {
  const documentIds = req.body.map((documentId) => parseInt(documentId, 10));

  await generateCertificates(documentIds)
    .then((results) => {
      const payload = results
        .filter((result) => result.status === "fulfilled")
        .map((result) => result.value.payload.documentId);
      return res.send(payload);
    })
    .catch(next)
    .finally(async () => prisma.$disconnect());
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
  await getJobBlobs(jobId)
    .then((documents) => {
      const zip = new AdmZip();
      documents.forEach((document) => {
        zip.addFile(
          `${document.licence_number}-${document.document_type}.docx`,
          document.document_binary
        );
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
