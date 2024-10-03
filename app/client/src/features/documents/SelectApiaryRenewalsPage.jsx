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

let licences = [];

export default function SelectApiaryRenewalsPage() {
  const [isCheckAll, setIsCheckAll] = useState(true);
  const [isChecked, setIsChecked] = useState([]);

  const queuedRenewals = useSelector(selectQueuedRenewals);
  const renewalJob = useSelector(selectRenewalsJob);

  const dispatch = useDispatch();
  const history = useHistory();

  const { handleSubmit, watch, setValue } = useForm();

  const startDate = startOfToday();
  const endDate = add(startOfToday(), { days: 15 });

  const watchLicences = watch("licences", []);
  const watchStartDate = watch("startDate", startDate);
  const watchEndDate = watch("endDate", endDate);

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
          licenceId: licence.licenceId,
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
    const checked = isCheckAll
      ? watchLicences.map((x) => x.licenceId)
      : isChecked;
    dispatch(startRenewalJob(checked));
    history.push(DOWNLOAD_RENEWALS_PATHNAME);
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
      setIsCheckAll(isChecked.length + 1 === licences.length);
    }
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
        !isCheckAll &&
        (isChecked.length === 0 || renewalJob.status !== REQUEST_STATUS.IDLE)
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
            {isCheckAll ? licences.length : isChecked.length}{" "}
            {pluralize(
              isCheckAll ? licences.length : isChecked.length,
              "renewal"
            )}{" "}
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
            {licences.map((item, index) => {
              const url = `${LICENSES_PATHNAME}/${item.licenceId}`;
              return (
                <tr key={item.licenceId}>
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
