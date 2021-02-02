import React, { useEffect } from "react";
import { useSelector, useDispatch, mapStateToProps } from "react-redux";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Alert, Button, Col, Container, Form } from "react-bootstrap";

import CustomCheckBox from "../../components/CustomCheckBox";
import ErrorMessageRow from "../../components/ErrorMessageRow";
import LinkButton from "../../components/LinkButton";
import PageHeading from "../../components/PageHeading";
import SectionHeading from "../../components/SectionHeading";
import SubmissionButtons from "../../components/SubmissionButtons";
import { REQUEST_STATUS } from "../../utilities/constants";

import { fetchHealth, fetchTemplateRender, selectHealth } from "./cdogsSlice";

import Api, { ApiError } from "../../utilities/api.ts";

function createBody(
  contexts,
  content,
  contentFileType,
  outputFileName,
  outputFileType
) {
  return {
    data: contexts,
    options: {
      reportName: outputFileName,
      convertTo: outputFileType,
      overwrite: true,
    },
    template: {
      content: content,
      encodingType: "base64",
      fileType: contentFileType,
    },
  };
}

function createDownload(blob, filename = undefined) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.style.display = "none";
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
  a.remove();
}

function splitFileName(filename = undefined) {
  let name = undefined;
  let extension = undefined;

  if (filename) {
    const filenameArray = filename.split(".");
    name = filenameArray.slice(0, -1).join(".");
    extension = filenameArray.slice(-1).join(".");
  }

  return { name, extension };
}

function getDispositionFilename(disposition) {
  let filename = undefined;
  if (disposition) {
    filename = disposition.substring(disposition.indexOf("filename=") + 9);
  }
  return filename;
}

function blobToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.replace(/^.*,/, ""));
    reader.onerror = (error) => reject(error);
  });
}

/*
// await fetch(`${process.env.PUBLIC_URL}/cdogs_templates/Fur_Farm_License.json`)
    //   .then(response => response.json())
    //   .then(json => console.log(json) )

    // await fetch(`${process.env.PUBLIC_URL}/cdogs_templates/FurFarm_Template.docx`)
    //   .then(response => templateBlob = response.blob())
    
    // await blobToBase64(templateBlob).then( reader => {console.log(reader);content = reader;},
    //   error => alert(`Error: ${error.message}`) );
    //   contentFileType = "docx";
*/

async function generate(
  dispatch,
  inputJsonName,
  inputTemplateName,
  outputFilename,
  convertToPDF
) {
  let loading = true;
  let templateBlob = null;
  let content = null;
  let contentFileType = "";
  let outputFileType = "";
  let parsedContexts = "";

  try {
    // Load json file
    const loadJsonContext = async () => {
      const response = await fetch(
        `${process.env.PUBLIC_URL}/cdogs_templates/${inputJsonName}`
      );
      parsedContexts = await JSON.parse(await response.text());
    };
    await loadJsonContext();

    // Load template and convert to base64
    const loadTemplateToBase64 = async () => {
      const response = await fetch(
        `${process.env.PUBLIC_URL}/cdogs_templates/${inputTemplateName}`
      );
      templateBlob = await response.blob();
      content = await blobToBase64(templateBlob);

      // Set output type to same as input template
      const split = splitFileName(inputTemplateName);
      contentFileType = split["extension"];
    };
    await loadTemplateToBase64();

    // Check if output has an extension type - use that if found
    // Convert to PDF if checked
    if (outputFilename.lastIndexOf(".") > -1) {
      const split = splitFileName(outputFilename);
      outputFilename = split["name"];
      outputFileType = convertToPDF ? "pdf" : split["extension"];
    } else {
      outputFileType = convertToPDF ? "pdf" : contentFileType;
    }

    // if the outputFilename has a template string...
    // then it needs an extension in order to populate the template correctly.
    // it does not matter what the extension is, but outputFilename requires an extension for logic to kick in.
    // outputFileType still determines what type of file is generated.
    if (outputFilename.lastIndexOf("}") > -1) {
      outputFilename = `${outputFilename}.docx`;
    }

    // create payload to send to CDOGS API
    const body = createBody(
      parsedContexts,
      content,
      contentFileType,
      outputFilename,
      outputFileType
    );

    // Perform API Call
    const response = await Api.getApiInstance().post(
      "/cdogs/template/render",
      body,
      {
        responseType: "arraybuffer", // Needed for binaries unless you want pain
        timeout: 30000, // Override default timeout as this call could take a while
      }
    );

    // create file to download
    const filename = getDispositionFilename(
      response.headers["content-disposition"]
    );

    const blob = new Blob([response.data], {
      type: "attachment",
    });

    // Generate Temporary Download Link
    createDownload(blob, filename);
  } catch (e) {
    console.error(e);
    if (e.response) {
      const data = new TextDecoder().decode(e.response.data);
      const parsed = JSON.parse(data);
      console.warn("CDOGS Response:", parsed);
    }
  } finally {
    loading = false;
  }
}

function submissionController() {
  const onSubmit = async (data) => {
    return generate(
      null,
      data.inputJSON,
      data.inputTemplate,
      data.outputFilename,
      data.convertToPDF
    );
  };

  return { onSubmit };
}

export default function Reports() {
  const health = useSelector(selectHealth);
  const dispatch = useDispatch();

  const form = useForm({
    reValidateMode: "onBlur",
  });
  const {
    register,
    handleSubmit,
    setValue,
    errors,
    setError,
    clearErrors,
  } = form;

  const { onSubmit } = submissionController();

  const inputJsonFiles = ["Fur_Farm_License.json", "Game_Farm_License.json"];
  const inputTemplates = ["FurFarm_Template.docx", "GameFarm_Template.docx"];

  useEffect(() => {
    dispatch(fetchHealth());
  }, [dispatch]);

  return (
    <section>
      <PageHeading>Reports</PageHeading>
      CDOGS Status:{" "}
      {health.status != REQUEST_STATUS.FULFILLED ? health.status : health.data}
      {health.status === REQUEST_STATUS.FULFILLED ? (
        // <Form.Row>
        //   <Col sm={2}>
        //     <Button
        //       type="button"
        //       onClick={() => generate(dispatch)}
        //       variant="primary"
        //       block
        //     >Generate</Button>
        //   </Col>
        //   <Col/>
        // </Form.Row>
        <Form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Form.Row>
            <Col sm={3}>
              <Form.Group controlId="cdogs_input_json">
                <Form.Label>Input JSON</Form.Label>
                <Form.Control as="select" name="inputJSON" ref={register}>
                  {inputJsonFiles.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>
            </Col>
            <Col sm={3}>
              <Form.Group controlId="cdogs_input_template">
                <Form.Label>Input Template</Form.Label>
                <Form.Control as="select" name="inputTemplate" ref={register}>
                  {inputTemplates.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>
            </Col>
            <Col sm={3}>
              <Form.Group controlId="cdogs_output">
                <Form.Label>Output filename</Form.Label>
                <Form.Control
                  type="text"
                  defaultValue={"output"}
                  name="outputFilename"
                  ref={register}
                  isInvalid={errors.outputFilename}
                />
              </Form.Group>
            </Col>
          </Form.Row>
          <Form.Row>
            <CustomCheckBox
              id="convertToPDF"
              label="Convert to PDF"
              ref={register}
            />
          </Form.Row>
          <Form.Row>
            <Col sm={3}>
              <Form.Label></Form.Label>
              <Button type="button" variant="primary" type="submit" block>
                Generate
              </Button>
            </Col>
          </Form.Row>
        </Form>
      ) : null}
    </section>
  );
}
