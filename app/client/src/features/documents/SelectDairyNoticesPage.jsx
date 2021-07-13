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
import { startOfToday, sub } from "date-fns";

import {
  REQUEST_STATUS,
  LICENSES_PATHNAME,
  DOWNLOAD_DAIRYNOTICES_PATHNAME,
} from "../../utilities/constants";
import {
  pluralize,
  formatDateString,
  formatListShorten,
} from "../../utilities/formatting.ts";

import PageHeading from "../../components/PageHeading";
import CustomDatePicker from "../../components/CustomDatePicker";

import {
  fetchQueuedDairyNotices,
  selectQueuedDairyNotices,
  startDairyNoticeJob,
  selectDairyNoticesJob,
  clearDairyNoticeJob,
} from "./dairyNoticesSlice";

function getSelectedLicences(licences) {
  return licences
    .filter((licence) => licence.selected === "true")
    .map((licence) => licence.licenceId)
    .filter((value, index, self) => self.indexOf(value) === index);
}

export default function SelectDairyNoticesPage() {
  const [toggleAllChecked, setToggleAllChecked] = useState(true);

  const queuedDairyNotices = useSelector(selectQueuedDairyNotices);
  const dairyNoticeJob = useSelector(selectDairyNoticesJob);

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
    dispatch(clearDairyNoticeJob());
    dispatch(fetchQueuedDairyNotices());
  }, [dispatch]);

  useEffect(() => {
    reset({
      licences: queuedDairyNotices.data
        ? queuedDairyNotices.data.map((licence) => licence)
        : [],
    });
  }, [reset, queuedDairyNotices.data]);

  const watchLicences = watch("licences", []);
  const selectedLicencesCount = getSelectedLicences(watchLicences).length;

  const onSubmit = (data) => {
    const selectedIds = getSelectedLicences(data.licences);
    const payload = {
      licenceIds: selectedIds,
      startDate: data.startDate,
      endDate: data.endDate,
    };
    dispatch(startDairyNoticeJob(payload));
    history.push(DOWNLOAD_DAIRYNOTICES_PATHNAME);
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
        selectedLicencesCount === 0 ||
        dairyNoticeJob.status !== REQUEST_STATUS.IDLE
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
    const endDate = startOfToday();
    const startDate = sub(endDate, { days: 30 });
    setValue("startDate", startDate);
    setValue("endDate", endDate);

    content = (
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Row>
          <CustomDatePicker
            id="startDate"
            label="Start Date"
            notifyOnChange={handleFieldChange("startDate")}
            defaultValue={startDate}
          />
          <CustomDatePicker
            id="endDate"
            label="End Date"
            notifyOnChange={handleFieldChange("endDate")}
            defaultValue={endDate}
          />
        </Row>
        <Row className="mt-3 d-flex justify-content-end">
          <Col md="auto">
            {selectedLicencesCount}{" "}
            {pluralize(selectedLicencesCount, "Dairy Notice")} selected for
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
              <th className="text-nowrap">Recorded Date</th>
              <th className="text-nowrap">Species Sub Code</th>
              <th className="text-nowrap">Description</th>
              <th className="text-nowrap">Levy</th>
            </tr>
          </thead>
          <tbody>
            {fields.map((item, index) => {
              const url = `${LICENSES_PATHNAME}/${item.licenceId}`;
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
                    <input
                      hidden
                      name={`licences[${index}].licenceId`}
                      ref={register()}
                      defaultValue={item.licenceId}
                    />
                    <input
                      hidden
                      name={`licences[${index}].infractionJson`}
                      ref={register()}
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
      <Container>{content}</Container>
    </section>
  );
}
