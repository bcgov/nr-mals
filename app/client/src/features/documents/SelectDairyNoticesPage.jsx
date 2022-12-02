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
  DOWNLOAD_DAIRYNOTICES_PATHNAME,
} from "../../utilities/constants";
import { pluralize, formatDateString } from "../../utilities/formatting.ts";

import PageHeading from "../../components/PageHeading";
import CustomDatePicker from "../../components/CustomDatePicker";

import {
  fetchQueuedDairyNotices,
  selectQueuedDairyNotices,
  startDairyNoticeJob,
  selectDairyNoticesJob,
  clearDairyNoticeJob,
} from "./dairyNoticesSlice";

let licences = [];

export default function SelectDairyNoticesPage() {
  const [isCheckAll, setIsCheckAll] = useState(false);
  const [isChecked, setIsChecked] = useState([]);

  const queuedDairyNotices = useSelector(selectQueuedDairyNotices);
  const dairyNoticeJob = useSelector(selectDairyNoticesJob);

  const dispatch = useDispatch();
  const history = useHistory();

  const { register, handleSubmit, watch, setValue } = useForm();

  const startDate = startOfToday();
  const endDate = add(startOfToday(), { days: 15 });

  const watchLicences = watch("licences", []);
  const watchStartDate = watch("startDate", startDate);
  const watchEndDate = watch("endDate", endDate);

  let licenceIdsWithChecks = [];

  useEffect(() => {
    dispatch(clearDairyNoticeJob());
    setValue("startDate", startDate);
    setValue("endDate", endDate);
    setValue("licences", licences);
  }, [dispatch]);

  useEffect(() => {
    // Reset array used to determine when checks are displayed
    licenceIdsWithChecks = [];

    const checked = [];
    licences = queuedDairyNotices.data
      ? queuedDairyNotices.data.map((licence) => {
          const obj = {
            ...licence,
            selected:
              checked.find((x) => x === licence.licenceId) === undefined
                ? true
                : false,
          };
          checked.push(licence.licenceId);
          return obj;
        })
      : [];
    setValue("licences", licences);
  }, [queuedDairyNotices.data]);

  useEffect(() => {
    dispatch(
      fetchQueuedDairyNotices({
        startDate: watchStartDate,
        endDate: watchEndDate,
      })
    );
  }, [watchStartDate, watchEndDate]);

  const onSubmit = (data) => {
    const uniqueSelectedLicences = [...new Set(isChecked.map((x) => x))];
    const payload = {
      licenceIds: uniqueSelectedLicences,
      startDate: data.startDate,
      endDate: data.endDate,
    };
    dispatch(startDairyNoticeJob(payload));
    history.push(DOWNLOAD_DAIRYNOTICES_PATHNAME);
  };

  const handleSelectAll = (e) => {
    setIsCheckAll(!isCheckAll);

    // Check inverse because the state hasn't actually updated yet
    if (isCheckAll) {
      setIsChecked([]);
    } else {
      const uniqueSelectedLicences = [
        ...new Set(watchLicences.map((x) => x.licenceId)),
      ];
      setIsChecked(uniqueSelectedLicences.map((x) => x));
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
        isChecked.length === 0 || dairyNoticeJob.status !== REQUEST_STATUS.IDLE
      }
    >
      Generate
    </Button>
  );

  if (queuedDairyNotices.status === REQUEST_STATUS.PENDING) {
    content = (
      <div>
        <Spinner animation="border" role="status">
          <span className="sr-only">Retrieving...</span>
        </Spinner>
      </div>
    );
  } else if (queuedDairyNotices.status === REQUEST_STATUS.REJECTED) {
    content = (
      <Alert variant="danger">
        <Alert.Heading>
          An error was encountered while retrieving licences.
        </Alert.Heading>
        <p>
          {queuedDairyNotices.error.code}:{" "}
          {queuedDairyNotices.error.description}
        </p>
      </Alert>
    );
  } else if (
    queuedDairyNotices.status === REQUEST_STATUS.FULFILLED &&
    queuedDairyNotices.data.length === 0
  ) {
    content = (
      <>
        <Alert variant="success" className="mt-3">
          <div>No licences have been flagged for notice generation.</div>
        </Alert>
      </>
    );
  } else if (
    queuedDairyNotices.status === REQUEST_STATUS.FULFILLED &&
    queuedDairyNotices.data.length > 0
  ) {
    content = (
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Row className="mt-3 d-flex justify-content-end">
          <Col md="auto">
            {isChecked.length}{" "}
            {pluralize(isChecked.length, "Dairy Notice Licence")} selected for
            generation.
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
              <th className="text-nowrap">Recorded Date</th>
              <th className="text-nowrap">Species Sub Code</th>
              <th className="text-nowrap">Description</th>
              <th className="text-nowrap">Levy</th>
            </tr>
          </thead>
          <tbody>
            {licences.map((item, index) => {
              const url = `${LICENSES_PATHNAME}/${item.licenceId}`;
              const addCheck =
                licenceIdsWithChecks.find((x) => x === item.licenceId) ===
                undefined;
              licenceIdsWithChecks.push(item.licenceId);
              return (
                <tr key={item.id}>
                  <td>
                    {addCheck ? (
                      <Form.Check
                        name={`licences.${index}.check`}
                        id={item.licenceId}
                        checked={isChecked.includes(item.licenceId)}
                        onChange={(e) => handleClick(e, item.licenceId)}
                      />
                    ) : null}
                    <input
                      hidden
                      name={`licences[${index}].id`}
                      {...register(`licences[${index}].id`)}
                      defaultValue={item.id}
                    />
                    <input
                      hidden
                      name={`licences[${index}].licenceId`}
                      {...register(`licences[${index}].licenceId`)}
                      defaultValue={item.licenceId}
                    />
                    <input
                      hidden
                      name={`licences[${index}].infractionJson`}
                      {...register(`licences[${index}].infractionJson`)}
                      defaultValue={item.infractionJson}
                    />
                  </td>
                  <td className="text-nowrap">
                    <Link to={url}>{item.licenceNumber}</Link>
                  </td>
                  <td className="text-nowrap">
                    {formatDateString(item.recordedDate)}
                  </td>
                  <td className="text-nowrap">{item.speciesSubCode}</td>
                  <td className="text-nowrap">
                    {item.correspondenceDescription}
                  </td>
                  <td className="text-nowrap">{item.levyPercent}</td>
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
      <PageHeading>Generate Dairy Notices</PageHeading>
      <Container>
        <Row>
          <Col lg={3}>
            <CustomDatePicker
              id="startDate"
              label="Start Date"
              notifyOnChange={handleFieldChange("startDate")}
              defaultValue={startDate}
            />
          </Col>
          <Col lg={3}>
            <CustomDatePicker
              id="endDate"
              label="End Date"
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
