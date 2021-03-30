import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useHistory } from "react-router-dom";
import { useForm, useFieldArray } from "react-hook-form";
import {
  Alert,
  Container,
  Spinner,
  Table,
  Row,
  Col,
  Form,
  Button,
} from "react-bootstrap";
import { FaPrint } from "react-icons/fa";

import {
  REQUEST_STATUS,
  LICENSES_PATHNAME,
  DOWNLOAD_CERTIFICATES_PATHNAME,
} from "../../utilities/constants";
import {
  pluralize,
  formatDateString,
  formatListShorten,
} from "../../utilities/formatting.ts";

import PageHeading from "../../components/PageHeading";

import {
  fetchQueuedCertificates,
  selectQueuedCertificates,
  startCertificateJob,
  selectCertificateJob,
  clearCertificateJob,
} from "./certificatesSlice";

function getSelectedLicences(licences) {
  return licences
    .filter((licence) => licence.selected === "true")
    .map((licence) => licence.id);
}

export default function SelectCertificatesPage() {
  const [toggleAllChecked, setToggleAllChecked] = useState(true);

  const queuedCertificates = useSelector(selectQueuedCertificates);
  const certificateJob = useSelector(selectCertificateJob);

  const dispatch = useDispatch();
  const history = useHistory();

  const {
    control,
    reset,
    register,
    handleSubmit,
    watch,
    getValues,
    setValue,
  } = useForm();
  const { fields } = useFieldArray({
    control,
    name: "licences",
  });

  useEffect(() => {
    dispatch(clearCertificateJob());
    dispatch(fetchQueuedCertificates());
  }, [dispatch]);

  useEffect(() => {
    reset({
      licences: queuedCertificates.data
        ? queuedCertificates.data.map((licence) => ({
            id: licence.licenceId,
            licenceNumber: licence.licenceNumber,
            licenceType: licence.licenceType,
            lastNames: licence.lastNames,
            companyNames: licence.companyNames,
            licenceStatus: licence.licenceStatus,
            issuedOnDate: licence.issuedOnDate,
            expiryDate: licence.expiryDate,
            region: licence.region,
            regionalDistrict: licence.regionalDistrict,
          }))
        : [],
    });
  }, [reset, queuedCertificates.data]);

  const watchLicences = watch("licences", []);
  const selectedLicencesCount = getSelectedLicences(watchLicences).length;

  const onSubmit = (data) => {
    const selectedIds = getSelectedLicences(data.licences);
    dispatch(startCertificateJob(selectedIds));
    history.push(DOWNLOAD_CERTIFICATES_PATHNAME);
  };

  const updateToggleAllChecked = () => {
    const { licences } = getValues();
    const selectedLicences = getSelectedLicences(licences);
    setToggleAllChecked(selectedLicences.length === licences.length);
  };

  const toggleAllLicences = () => {
    let { licences } = getValues();
    const selectedLicences = getSelectedLicences(licences);
    if (selectedLicences.length === licences.length) {
      licences = licences.map((licence) => ({ ...licence, selected: false }));
    } else {
      licences = licences.map((licence) => ({ ...licence, selected: true }));
    }
    setValue("licences", licences);
    updateToggleAllChecked();
  };

  let content = null;
  const generateButton = (
    <Button
      variant="primary"
      type="submit"
      disabled={
        selectedLicencesCount === 0 ||
        certificateJob.status !== REQUEST_STATUS.IDLE
      }
    >
      Generate
    </Button>
  );

  if (queuedCertificates.status === REQUEST_STATUS.PENDING) {
    content = (
      <div>
        <Spinner animation="border" role="status">
          <span className="sr-only">Retrieving...</span>
        </Spinner>
      </div>
    );
  } else if (queuedCertificates.status === REQUEST_STATUS.REJECTED) {
    content = (
      <Alert variant="danger">
        <Alert.Heading>
          An error was encountered while retrieving licences.
        </Alert.Heading>
        <p>
          {queuedCertificates.error.code}:{" "}
          {queuedCertificates.error.description}
        </p>
      </Alert>
    );
  } else if (
    queuedCertificates.status === REQUEST_STATUS.FULFILLED &&
    queuedCertificates.data.length === 0
  ) {
    content = (
      <>
        <Alert variant="success" className="mt-3">
          <div>No licences have been flagged for certificate generation.</div>
        </Alert>
      </>
    );
  } else if (
    queuedCertificates.status === REQUEST_STATUS.FULFILLED &&
    queuedCertificates.data.length > 0
  ) {
    content = (
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Row className="mt-3 d-flex justify-content-end">
          <Col md="auto">
            {selectedLicencesCount}{" "}
            {pluralize(selectedLicencesCount, "certificate")} selected for
            generation.
          </Col>
        </Row>
        <Table striped size="sm" responsive className="mt-3" hover>
          <thead className="thead-dark">
            <tr>
              <th>
                <Form.Check
                  id="toggleAllCheckbox"
                  onChange={(event) => toggleAllLicences(event)}
                  label={<FaPrint />}
                  checked={toggleAllChecked}
                />
              </th>
              <th>Licence</th>
              <th className="text-nowrap">Licence Type</th>
              <th className="text-nowrap">Last Names</th>
              <th className="text-nowrap">Company Names</th>
              <th className="text-nowrap">Licence Status</th>
              <th className="text-nowrap">Issued On Date</th>
              <th className="text-nowrap">Expiry Date</th>
              <th>Region</th>
              <th>District</th>
            </tr>
          </thead>
          <tbody>
            {fields.map((item, index) => {
              const url = `${LICENSES_PATHNAME}/${item.id}`;
              return (
                <tr key={item.id}>
                  <td>
                    <Form.Check
                      name={`licences[${index}].selected`}
                      ref={register()}
                      defaultChecked
                      defaultValue
                      onChange={() => updateToggleAllChecked()}
                    />
                    <input
                      hidden
                      name={`licences[${index}].id`}
                      ref={register()}
                      defaultValue={item.id}
                    />
                  </td>
                  <td className="text-nowrap">
                    <Link to={url}>{item.licenceNumber}</Link>
                  </td>
                  <td className="text-nowrap">{item.licenceType}</td>
                  <td className="text-nowrap">
                    {formatListShorten(item.lastNames)}
                  </td>
                  <td className="text-nowrap">
                    {formatListShorten(item.companyNames)}
                  </td>
                  <td className="text-nowrap">{item.licenceStatus}</td>
                  <td className="text-nowrap">
                    {formatDateString(item.issuedOnDate)}
                  </td>
                  <td className="text-nowrap">
                    {formatDateString(item.expiryDate)}
                  </td>
                  <td className="text-nowrap">{item.region}</td>
                  <td className="text-nowrap">{item.regionalDistrict}</td>
                </tr>
              );
            })}
          </tbody>
        </Table>
        <Row className="mt-3 d-flex justify-content-end">
          <Col md="auto">{generateButton}</Col>
        </Row>
      </Form>
    );
  }

  return (
    <section>
      <PageHeading>Generate Certificates</PageHeading>
      <Container>{content}</Container>
    </section>
  );
}
