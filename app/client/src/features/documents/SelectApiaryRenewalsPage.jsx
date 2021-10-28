import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useHistory } from "react-router-dom";
import { useForm } from "react-hook-form";
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
import { startOfToday, add } from "date-fns";

import {
  REQUEST_STATUS,
  LICENSES_PATHNAME,
  DOWNLOAD_RENEWALS_PATHNAME,
} from "../../utilities/constants";
import {
  pluralize,
  formatDateString,
  formatListShorten,
} from "../../utilities/formatting.ts";

import PageHeading from "../../components/PageHeading";
import CustomDatePicker from "../../components/CustomDatePicker";

import {
  fetchQueuedApiaryRenewals,
  selectQueuedRenewals,
  startRenewalJob,
  selectRenewalsJob,
  clearRenewalJob,
} from "./renewalsSlice";

function getSelectedLicences(licences) {
  return licences
    .filter((licence) => licence.selected === "true")
    .map((licence) => licence.licenceId);
}

let licences = [];

export default function SelectApiaryRenewalsPage() {
  const [toggleAllChecked, setToggleAllChecked] = useState(true);

  const queuedRenewals = useSelector(selectQueuedRenewals);
  const renewalJob = useSelector(selectRenewalsJob);

  const dispatch = useDispatch();
  const history = useHistory();

  const { register, handleSubmit, watch, getValues, setValue } = useForm();

  const startDate = startOfToday();
  const endDate = add(startOfToday(), { days: 15 });

  const watchLicences = watch("licences", []);
  const watchStartDate = watch("startDate", startDate);
  const watchEndDate = watch("endDate", endDate);
  const selectedLicencesCount = getSelectedLicences(watchLicences).length;

  useEffect(() => {
    dispatch(clearRenewalJob());
    dispatch(
      fetchQueuedApiaryRenewals({
        startDate: watchStartDate,
        endDate: watchEndDate,
      })
    );

    setValue("startDate", startDate);
    setValue("endDate", endDate);
    setValue("licences", licences);
  }, [dispatch]);

  useEffect(() => {
    licences = queuedRenewals.data
      ? queuedRenewals.data.map((licence) => ({
          ...licence,
          issuedOnDate: formatDateString(licence.issuedOnDate),
          expiryDate: formatDateString(licence.expiryDate),
          selected: "true",
        }))
      : [];
    setValue("licences", licences);
  }, [queuedRenewals.data]);

  useEffect(() => {
    dispatch(
      fetchQueuedApiaryRenewals({
        startDate: watchStartDate,
        endDate: watchEndDate,
      })
    );
  }, [watchStartDate, watchEndDate]);

  const onSubmit = (data) => {
    const selectedIds = getSelectedLicences(data.licences);
    dispatch(startRenewalJob(selectedIds));
    history.push(DOWNLOAD_RENEWALS_PATHNAME);
  };

  const updateToggleAllChecked = () => {
    const values = getValues();
    const selectedLicences = getSelectedLicences(values.licences);
    setToggleAllChecked(selectedLicences.length === values.licences.length);
  };

  const toggleAllLicences = () => {
    const values = getValues();
    const selectedLicences = getSelectedLicences(values.licences);
    if (selectedLicences.length === values.licences.length) {
      values.licences = values.licences.map((licence) => ({
        ...licence,
        selected: false,
      }));
    } else {
      values.licences = values.licences.map((licence) => ({
        ...licence,
        selected: true,
      }));
    }
    setValue("licences", values.licences);
    updateToggleAllChecked();
  };

  const handleFieldChange = (field) => {
    return (value) => {
      setValue(field, value);
    };
  };

  let content = null;
  const generateButton = (
    <Button
      variant="primary"
      type="submit"
      disabled={
        selectedLicencesCount === 0 || renewalJob.status !== REQUEST_STATUS.IDLE
      }
    >
      Generate
    </Button>
  );

  if (queuedRenewals.status === REQUEST_STATUS.PENDING) {
    content = (
      <div>
        <Spinner animation="border" role="status">
          <span className="sr-only">Retrieving...</span>
        </Spinner>
      </div>
    );
  } else if (queuedRenewals.status === REQUEST_STATUS.REJECTED) {
    content = (
      <Alert variant="danger">
        <Alert.Heading>
          An error was encountered while retrieving licences.
        </Alert.Heading>
        <p>
          {queuedRenewals.error.code}: {queuedRenewals.error.description}
        </p>
      </Alert>
    );
  } else if (
    queuedRenewals.status === REQUEST_STATUS.FULFILLED &&
    queuedRenewals.data.length === 0
  ) {
    content = (
      <>
        <Alert variant="success" className="mt-3">
          <div>No licences have been flagged for renewal generation.</div>
        </Alert>
      </>
    );
  } else if (
    queuedRenewals.status === REQUEST_STATUS.FULFILLED &&
    queuedRenewals.data.length > 0
  ) {
    content = (
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Row className="mt-3 d-flex justify-content-end">
          <Col md="auto">
            {selectedLicencesCount}{" "}
            {pluralize(selectedLicencesCount, "renewal")} selected for
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
            {licences.map((item, index) => {
              const url = `${LICENSES_PATHNAME}/${item.licenceId}`;
              return (
                <tr key={item.licenceId}>
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
                      name={`licences[${index}].licenceId`}
                      ref={register()}
                      defaultValue={item.licenceId}
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
      <PageHeading>Generate Apiary Renewals</PageHeading>
      <Container>
        <Row>
          <Col lg={3}>
            <CustomDatePicker
              id="startDate"
              label="Expiry Date - From"
              notifyOnChange={handleFieldChange("startDate")}
              defaultValue={startDate}
            />
          </Col>
          <Col lg={3}>
            <CustomDatePicker
              id="endDate"
              label="Expiry Date - To"
              notifyOnChange={handleFieldChange("endDate")}
              defaultValue={endDate}
            />
          </Col>
        </Row>
        {content}
      </Container>
    </section>
  );
}
