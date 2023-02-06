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
  DOWNLOAD_DAIRYTANKNOTICES_PATHNAME,
} from "../../utilities/constants";
import {
  pluralize,
  formatDateString,
  formatListShorten,
} from "../../utilities/formatting.ts";

import PageHeading from "../../components/PageHeading";

import {
  fetchQueuedDairyTankNotices,
  selectQueuedDairyTankNotices,
  startDairyTankNoticeJob,
  selectDairyTankNoticesJob,
  clearDairyTankNoticeJob,
} from "./dairyTankNoticesSlice";

export default function SelectDairyTankNoticesPage() {
  const [isCheckAll, setIsCheckAll] = useState(true);
  const [isChecked, setIsChecked] = useState([]);

  const queuedDairyTankNotices = useSelector(selectQueuedDairyTankNotices);
  const dairyTankNoticeJob = useSelector(selectDairyTankNoticesJob);

  const dispatch = useDispatch();
  const history = useHistory();

  const { control, reset, handleSubmit, watch } = useForm();
  const { fields } = useFieldArray({
    control,
    name: "licences",
  });

  useEffect(() => {
    dispatch(clearDairyTankNoticeJob());
    dispatch(fetchQueuedDairyTankNotices());
  }, [dispatch]);

  useEffect(() => {
    reset({
      licences: queuedDairyTankNotices.data
        ? queuedDairyTankNotices.data.map((licence) => ({
          id: licence.id,
          licenceType: licence.licenceType,
          licenceId: licence.licenceId,
          licenceNumber: licence.licenceNumber,
          irmaNumber: licence.irmaNumber,
          recheckYear: licence.recheckYear,
          lastName: licence.lastName,
          regionName: licence.regionName,
          districtName: licence.districtName,
          printRecheckNotice: licence.printRecheckNotice,
          recheckNoticeJson: licence.recheckNoticeJson,
        }))
        : [],
    });
  }, [reset, queuedDairyTankNotices.data]);

  const watchLicences = watch("licences", []);

  const onSubmit = (data) => {
    dispatch(startDairyTankNoticeJob(isChecked));
    history.push(DOWNLOAD_DAIRYTANKNOTICES_PATHNAME);
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
      setIsCheckAll(isChecked.length + 1 === watchLicences.length);
    }
  };

  let content = null;
  const generateButton = (
    <Button
      variant="primary"
      type="submit"
      disabled={
        isChecked.length === 0 ||
        dairyTankNoticeJob.status !== REQUEST_STATUS.IDLE
      }
    >
      Generate
    </Button>
  );

  if (queuedDairyTankNotices.status === REQUEST_STATUS.PENDING) {
    content = (
      <div>
        <Spinner animation="border" role="status">
          <span className="sr-only">Retrieving...</span>
        </Spinner>
      </div>
    );
  } else if (queuedDairyTankNotices.status === REQUEST_STATUS.REJECTED) {
    content = (
      <Alert variant="danger">
        <Alert.Heading>
          An error was encountered while retrieving data.
        </Alert.Heading>
        <p>
          {queuedDairyTankNotices.error.code}:{" "}
          {queuedDairyTankNotices.error.description}
        </p>
      </Alert>
    );
  } else if (
    queuedDairyTankNotices.status === REQUEST_STATUS.FULFILLED &&
    queuedDairyTankNotices.data.length === 0
  ) {
    content = (
      <>
        <Alert variant="success" className="mt-3">
          <div>
            No dairy tanks have been flagged for dairy tank notice generation.
          </div>
        </Alert>
      </>
    );
  } else if (
    queuedDairyTankNotices.status === REQUEST_STATUS.FULFILLED &&
    queuedDairyTankNotices.data.length > 0
  ) {
    content = (
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Row className="mt-3 d-flex justify-content-end">
          <Col md="auto">
            {isCheckAll ? watchLicences.length : isChecked.length} {pluralize(isCheckAll ? watchLicences.length : isChecked.length, "dairy tank notice")} selected for generation.
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
              <th className="text-nowrap">Last Name</th>
              <th className="text-nowrap">Company Name</th>
              <th className="text-nowrap">Re-Check Year</th>
              <th className="text-nowrap">Issued On Date</th>
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
                    {formatListShorten(item.lastName)}
                  </td>
                  <td className="text-nowrap">
                    {formatListShorten(
                      item.recheckNoticeJson.LicenceHolderCompany
                    )}
                  </td>
                  <td className="text-nowrap">{item.recheckYear}</td>
                  <td className="text-nowrap">
                    {formatDateString(item.issuedOnDate)}
                  </td>
                  <td className="text-nowrap">{item.regionName}</td>
                  <td className="text-nowrap">{item.districtName}</td>
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
      <PageHeading>Generate Dairy Tank Notices</PageHeading>
      <Container>{content}</Container>
    </section>
  );
}
