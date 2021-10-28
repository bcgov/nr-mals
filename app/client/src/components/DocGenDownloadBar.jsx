import React from "react";
import PropTypes from "prop-types";
import { Alert, Button, ProgressBar } from "react-bootstrap";

import Api from "../utilities/api.ts";
import {
  createDownload,
  getDispositionFilename,
} from "../utilities/downloading";

import { REQUEST_STATUS } from "../utilities/constants";

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
    if (e.response) {
      const data = new TextDecoder().decode(e.response.data);
      const parsed = JSON.parse(data);
      console.warn("CDOGS Response:", parsed); // eslint-disable-line no-console
    }
  }
}

function DocGenDownloadBar({ job }) {
  let content = null;

  const jobDetails = job.details;

  const jobInProgress =
    jobDetails?.completedDocumentCount === undefined ||
    jobDetails?.completedDocumentCount < jobDetails?.totalDocumentCount;

  if (job.status === REQUEST_STATUS.REJECTED) {
    content = (
      <Alert variant="danger">
        <Alert.Heading>
          An error was encountered while retrieving data.
        </Alert.Heading>
        <p>
          {job.error.code}: {job.error.description}
        </p>
      </Alert>
    );
  } else if (job.status !== REQUEST_STATUS.IDLE) {
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
      content = (
        <>
          <ProgressBar animated now={percentage} label={progressLabel} />
        </>
      );
    } else {
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
    }
  }

  return <>{content}</>;
}

DocGenDownloadBar.propTypes = {
  job: PropTypes.object.isRequired,
};

export default DocGenDownloadBar;
