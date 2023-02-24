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

export default function SelectCertificatesPage() {
  const [isCheckAll, setIsCheckAll] = useState(true);
  const [isChecked, setIsChecked] = useState([]);

  const queuedCertificates = useSelector(selectQueuedCertificates);
  const certificateJob = useSelector(selectCertificateJob);

  const dispatch = useDispatch();
  const history = useHistory();

  const { control, reset, handleSubmit, watch } = useForm();
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
          licenceId: licence.licenceId,
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

  const onSubmit = (data) => {
    dispatch(startCertificateJob(isChecked));
    history.push(DOWNLOAD_CERTIFICATES_PATHNAME);
  };

  const handleSelectAll = (e) => {
    setIsCheckAll(!isCheckAll);

    // Check inverse because the state hasn't actually updated yet
    if (isCheckAll) {
      setIsChecked([]);
    } else {
      setIsChecked(watchLicences.map((x) => x.licenceId));
    }
  };

  const handleClick = (e, id) => {
    const { checked } = e.target;

    if (!checked) {
      // Uncheck checkall if toggling a checkbox off manually
      setIsCheckAll(false);

      // Filter out licence id
      setIsChecked(isChecked.filter((item) => item !== id));
    } else {
      // Add licence id
      setIsChecked([...isChecked, id]);
      setIsCheckAll(isChecked.length + 1 === fields.length);
    }
  };

  let content = null;
  const generateButton = (
    <Button
      variant="primary"
      type="submit"
      disabled={
        isChecked.length === 0 || certificateJob.status !== REQUEST_STATUS.IDLE
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
            {isCheckAll ? fields.length : isChecked.length} {pluralize(isCheckAll ? fields.length : isChecked.length, "certificate")}{" "}
            selected for generation.
          </Col>
        </Row>
        <Table striped size="sm" responsive className="mt-3" hover>
          <thead className="thead-dark">
            <tr>
              <th>
                <Form.Check
                  id="toggleAllCheckbox"
                  onChange={(event) => handleSelectAll(event)}
                  checked={isCheckAll}
                  label={<FaPrint />}
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
              const url = `${LICENSES_PATHNAME}/${item.licenceId}`;
              return (
                <tr key={item.id}>
                  <td>
                    <Form.Check
                      name={`licences.${index}.check`}
                      id={item.licenceId}
                      checked={isCheckAll || isChecked.includes(item.licenceId)}
                      onChange={(e) => handleClick(e, item.licenceId)}
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
