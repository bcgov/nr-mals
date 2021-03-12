/* eslint-disable */
import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Container, Button, ProgressBar } from "react-bootstrap";

import useInterval from "../../hooks/useInterval";

import Api from "../../utilities/api.ts";
import {
  createDownload,
  getDispositionFilename,
} from "../../utilities/downloading";

import PageHeading from "../../components/PageHeading";

import {
  selectCertificateJob,
  fetchCertificateJob,
  selectPendingDocuments,
  generateCertificates,
  generateCertificate,
} from "./certificatesSlice";

async function download(jobId) {
  try {
    // perform API call
    const response = await Api.getApiInstance().post(
      `/documents/download/${jobId}`,
      null,
      {
        responseType: "arraybuffer", // needed for binaries unless you want pain
        timeout: 30000, // override default timeout as this call could take a while
      }
    );

    // create file to download
    const filename = getDispositionFilename(
      response.headers["content-disposition"]
    );

    const blob = new Blob([response.data], {
      type: "attachment",
    });

    // generate temporary download link
    createDownload(blob, filename);
  } catch (e) {
    console.error(e);
    if (e.response) {
      const data = new TextDecoder().decode(e.response.data);
      const parsed = JSON.parse(data);
      console.warn("CDOGS Response:", parsed);
    }
  }
}

export default function DownloadCertificatesPage() {
  const job = useSelector(selectCertificateJob);
  const jobDetails = job.details;
  const { pendingDocuments } = job;

  const dispatch = useDispatch();

  const jobExists = job.id !== undefined;
  const jobInProgress =
    jobDetails?.completedDocumentCount === undefined ||
    jobDetails?.completedDocumentCount < jobDetails?.totalDocumentCount;

  useInterval(
    () => {
      dispatch(fetchCertificateJob());
    },
    jobExists && jobInProgress ? 2000 : null
  );

  useInterval(
    () => {
      dispatch(fetchCertificateJob());
      if (pendingDocuments?.length > 0) {
        dispatch(
          generateCertificates(
            pendingDocuments.map((document) => document.documentId)
          )
        );
      }
    },
    pendingDocuments?.length > 0 ? 10000 : null
  );

  useEffect(() => {
    if (job.id && pendingDocuments?.length > 0) {
      dispatch(
        generateCertificates(
          pendingDocuments.map((document) => document.documentId)
        )
      );
    }
  }, [job.id]);

  let content = null;

  const tenPercent = jobDetails?.totalDocumentCount * 0.1;
  const percentage =
    jobDetails?.totalDocumentCount > 0
      ? ((jobDetails.completedDocumentCount + tenPercent) * 100) /
        (jobDetails.totalDocumentCount + tenPercent)
      : 0;

  const progressLabel =
    jobDetails === undefined
      ? undefined
      : `${jobDetails.completedDocumentCount}/${jobDetails.totalDocumentCount}`;

  if (jobInProgress) {
    return (
      <section>
        <PageHeading>Generate Certificates</PageHeading>
        <Container>
          <ProgressBar animated now={percentage} label={progressLabel} />
        </Container>
      </section>
    );
  }
  content = (
    <>
      <ProgressBar now={percentage} label={progressLabel} />
      <Button
        variant="primary"
        type="submit"
        className="mt-3 mb-4"
        onClick={() => download(job.id)}
      >
        Download
      </Button>
    </>
  );

  return (
    <section>
      <PageHeading>Download Certificates</PageHeading>
      <Container>{content}</Container>
    </section>
  );
}
