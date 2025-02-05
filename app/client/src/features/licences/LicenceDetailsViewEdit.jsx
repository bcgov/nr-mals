import React, { useEffect } from "react";
import PropTypes from "prop-types";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { Button, Container, Form, Row, Col } from "react-bootstrap";
import { startOfDay, startOfToday, add, set } from "date-fns";

import {
  LICENCE_MODE,
  REQUEST_STATUS,
  SYSTEM_ROLES,
} from "../../utilities/constants";
import {
  LICENCE_TYPE_ID_DAIRY_FARM,
  LICENCE_TYPE_ID_DAIRY_TANK_TRUCK,
  LICENCE_TYPE_ID_LIVESTOCK_DEALER,
  LICENCE_TYPE_ID_PUBLIC_SALE_YARD_OPERATOR,
  LICENCE_TYPE_ID_PURCHASE_LIVE_POULTRY,
} from "./constants";
import { formatNumber, formatDate } from "../../utilities/formatting.ts";
import { parseAsInt, parseAsFloat, parseAsDate } from "../../utilities/parsing";

import ErrorMessageRow from "../../components/ErrorMessageRow";
import SectionHeading from "../../components/SectionHeading";
import SubmissionButtons from "../../components/SubmissionButtons";
import CustomCheckBox from "../../components/CustomCheckBox";

import { fetchRegions } from "../lookups/regionsSlice";
import { fetchLicenceStatuses } from "../lookups/licenceStatusesSlice";
import {
  fetchLicenceTypes,
  selectLicenceTypes,
} from "../lookups/licenceTypesSlice";
import { fetchCities } from "../lookups/citiesSlice";

import {
  updateLicence,
  setCurrentLicenceModeToEdit,
  setCurrentLicenceModeToView,
  renewLicence,
  updateLicenceCheckboxes,
} from "./licencesSlice";
import { getLicenceTypeConfiguration } from "./licenceTypeUtility";

import { validateIrmaNumber, parseIrmaNumber } from "./irmaNumberUtility";

import LicenceDetailsEdit from "./LicenceDetailsEdit";
import LicenceDetailsView from "./LicenceDetailsView";
import BondInformationEdit from "./BondInformationEdit";
import BondInformationView from "./BondInformationView";

import { openModal, selectCurrentUser } from "../../app/appSlice";

import { CONFIRMATION } from "../../modals/ConfirmationModal";

export default function LicenceDetailsViewEdit({ licence }) {
  const { status, error, mode } = licence;

  const dispatch = useDispatch();

  const currentUser = useSelector(selectCurrentUser);
  const licenceTypesConfig = useSelector(selectLicenceTypes);

  useEffect(() => {
    dispatch(fetchRegions());
    dispatch(fetchLicenceStatuses());
    dispatch(fetchCities());
    dispatch(fetchLicenceTypes());
  }, [dispatch]);

  const form = useForm({
    reValidateMode: "onBlur",
  });
  const { register, handleSubmit, clearErrors, setError, setValue, getValues } =
    form;

  useEffect(() => {
    register("applicationDate");
    register("issuedOnDate", { required: true });
    register("expiryDate");
  }, [register]);

  const initialFormValues = {
    applicationDate: parseAsDate(licence.data.applicationDate),
    region: formatNumber(licence.data.regionId),
    issuedOnDate: parseAsDate(licence.data.issuedOnDate),
    regionalDistrict: formatNumber(licence.data.regionalDistrictId),
    expiryDate: parseAsDate(licence.data.expiryDate),
    licenceStatus: licence.data.licenceStatusId,
    paymentReceived: licence.data.paymentReceived,
    feePaidAmount: licence.data.feePaidAmount,
    actionRequired: licence.data.actionRequired,
    printLicence: licence.data.printLicence,
    renewalNotice: licence.data.renewalNotice,
    irmaNumber: licence.data.irmaNumber,
    totalHives: licence.data.totalHives,
    hivesPerApiary: licence.data.hivesPerApiary,
    addresses: licence.data.addresses,
    phoneNumbers: licence.data.phoneNumbers,
    bondCarrierPhoneNumber: licence.data.bondCarrierPhoneNumber,
    bondNumber: licence.data.bondNumber,
    bondValue: licence.data.bondValue,
    bondCarrierName: licence.data.bondCarrierName,
    bondContinuationExpiryDate: parseAsDate(
      licence.data.bondContinuationExpiryDate
    ),
  };

  useEffect(() => {
    setValue("applicationDate", parseAsDate(licence.data.applicationDate));
    setValue("region", formatNumber(licence.data.regionId));
    setValue("issuedOnDate", parseAsDate(licence.data.issuedOnDate));
    setValue("regionalDistrict", formatNumber(licence.data.regionalDistrictId));
    setValue("expiryDate", parseAsDate(licence.data.expiryDate));
    setValue("licenceStatus", licence.data.licenceStatusId);
    setValue("paymentReceived", licence.data.paymentReceived);
    setValue("feePaidAmount", licence.data.feePaidAmount);
    setValue("actionRequired", licence.data.actionRequired);
    setValue("printLicence", licence.data.printLicence);
    setValue("renewalNotice", licence.data.renewalNotice);
    setValue("irmaNumber", licence.data.irmaNumber);
    setValue("totalHives", licence.data.totalHives);
    setValue("hivesPerApiary", licence.data.hivesPerApiary);
  }, [
    setValue,
    licence.data.applicationDate,
    licence.data.regionId,
    licence.data.issuedOnDate,
    licence.data.regionalDistrictId,
    licence.data.expiryDate,
    licence.data.licenceStatusId,
    licence.data.paymentReceived,
    licence.data.feePaidAmount,
    licence.data.actionRequired,
    licence.data.printLicence,
    licence.data.renewalNotice,
    licence.data.irmaNumber,
    licence.data.totalHives,
    licence.data.hivesPerApiary,
    mode,
  ]);

  const submitting = status === REQUEST_STATUS.PENDING;

  let errorMessage = null;
  if (status === REQUEST_STATUS.REJECTED) {
    errorMessage = `${error.code}: ${error.description}`;
  }

  const REQUIRES_BOND_INFORMATION = [
    LICENCE_TYPE_ID_PUBLIC_SALE_YARD_OPERATOR,
    LICENCE_TYPE_ID_PURCHASE_LIVE_POULTRY,
    LICENCE_TYPE_ID_LIVESTOCK_DEALER,
  ];

  const showBondInformation =
    REQUIRES_BOND_INFORMATION.find((x) => x === licence.data.licenceTypeId) !==
    undefined;

  const config = getLicenceTypeConfiguration(licence.data.licenceTypeId);

  const getRenewLicenceDates = () => {
    const licenceTypeConfig = licenceTypesConfig.data.find(
      (x) => x.id === licence.data.licenceTypeId
    );

    const today = startOfToday();
    let expiryDate;

    if (config.expiryInTwoYears) {
      expiryDate = add(today, { years: 2 });
    } else if (config.replaceExpiryDateWithIrmaNumber) {
      expiryDate = undefined;
    } else {
      expiryDate = add(
        startOfDay(new Date(licenceTypeConfig.standardExpiryDate)),
        { days: 1 }
      );
    }

    return { issueDate: today, expiryDate };
  };

  const [isPrintLicenceChecked, setIsPrintLicenceChecked] = React.useState(
    initialFormValues.printLicence
  );

  const onRenewCallback = (data) => {
    const dates = data;
    dispatch(renewLicence({ data: dates, id: licence.data.id }));
    setIsPrintLicenceChecked(true);
  };

  const onRenew = () => {
    const dates = getRenewLicenceDates();
    dispatch(
      openModal(
        CONFIRMATION,
        onRenewCallback,
        {
          data: dates,
          modalContent: (
            <>
              <Row>
                <div className="justify-content-center">
                  The Issued On date will be updated to today&apos;s date, and
                  the Expiry Date for Licence Number{" "}
                  {licence.data.licenceNumber} will be updated to{" "}
                  {formatDate(dates.expiryDate)}
                </div>
              </Row>
              <br />
              <Row>
                <div className="justify-content-center">
                  Do you wish to proceed?
                </div>
              </Row>
            </>
          ),
        },
        "md"
      )
    );
  };

  const onLicenceDetailsCheckboxChange = (target, value) => {
    setValue(target, value);

    let actionRequired = getValues("actionRequired");
    let printLicence = getValues("printLicence");
    let renewalNotice = getValues("renewalNotice");

    // Some hokeyness because setValue most likely wont have actually updated state yet
    switch (target) {
      case "actionRequired":
        actionRequired = value;
        break;
      case "printLicence":
        printLicence = value;
        setIsPrintLicenceChecked(value);
        break;
      case "renewalNotice":
        renewalNotice = value;
        break;
      default:
        break;
    }

    dispatch(
      updateLicenceCheckboxes({
        data: { actionRequired, printLicence, renewalNotice },
        id: licence.data.id,
      })
    );
  };

  const licenceDetailsCheckboxes = (
    <Form.Row>
      <Col lg={4}>
        <Form.Group controlId="actionRequired">
          <CustomCheckBox
            id="actionRequired"
            label="Action Required"
            defaultChecked={initialFormValues.actionRequired}
            onChange={(e) =>
              onLicenceDetailsCheckboxChange("actionRequired", e.target.checked)
            }
            disabled={
              submitting ||
              currentUser.data.roleId === SYSTEM_ROLES.READ_ONLY ||
              currentUser.data.roleId === SYSTEM_ROLES.INSPECTOR
            }
          />
        </Form.Group>
      </Col>
      <Col lg={4}>
        <Form.Group controlId="printLicence">
          <CustomCheckBox
            id="printLicence"
            label="Print Licence"
            defaultChecked={initialFormValues.printLicence}
            checked={isPrintLicenceChecked}
            onChange={(e) =>
              onLicenceDetailsCheckboxChange("printLicence", e.target.checked)
            }
            disabled={
              submitting ||
              currentUser.data.roleId === SYSTEM_ROLES.READ_ONLY ||
              currentUser.data.roleId === SYSTEM_ROLES.INSPECTOR
            }
          />
        </Form.Group>
      </Col>
      <Col lg={4}>
        <Form.Group controlId="renewalNotice">
          <CustomCheckBox
            id="renewalNotice"
            label="Renewal Notice"
            defaultChecked={initialFormValues.renewalNotice}
            onChange={(e) =>
              onLicenceDetailsCheckboxChange("renewalNotice", e.target.checked)
            }
            disabled={
              submitting ||
              currentUser.data.roleId === SYSTEM_ROLES.READ_ONLY ||
              currentUser.data.roleId === SYSTEM_ROLES.INSPECTOR ||
              licence.data.licenceTypeId === LICENCE_TYPE_ID_DAIRY_FARM ||
              licence.data.licenceTypeId === LICENCE_TYPE_ID_DAIRY_TANK_TRUCK
            }
          />
        </Form.Group>
      </Col>
    </Form.Row>
  );

  if (mode === LICENCE_MODE.VIEW) {
    const onEdit = () => {
      dispatch(setCurrentLicenceModeToEdit());
    };
    return (
      <section>
        <SectionHeading
          onEdit={onEdit}
          showEditButton={
            currentUser.data.roleId !== SYSTEM_ROLES.READ_ONLY &&
            currentUser.data.roleId !== SYSTEM_ROLES.INSPECTOR
          }
        >
          License Details
        </SectionHeading>
        <Container className="mt-3 mb-4">
          <LicenceDetailsView licence={licence.data} />
          {licenceDetailsCheckboxes}
        </Container>
        {showBondInformation ? (
          <>
            <SectionHeading>Bond Information</SectionHeading>
            <Container className="mt-3 mb-4">
              <BondInformationView licence={licence.data} />
            </Container>
          </>
        ) : null}
        <Container className="mt-3 mb-4">
          {currentUser.data.roleId !== SYSTEM_ROLES.READ_ONLY &&
          currentUser.data.roleId !== SYSTEM_ROLES.INSPECTOR ? (
            <Form.Row className="mt-3 mb-3">
              <Col sm={2}>
                <Button
                  type="button"
                  onClick={onRenew}
                  disabled={submitting}
                  variant="secondary"
                  block
                >
                  Renew Licence
                </Button>
              </Col>
            </Form.Row>
          ) : null}
          <ErrorMessageRow errorMessage={errorMessage} />
        </Container>
      </section>
    );
  }

  const submissionLabel = submitting ? "Saving..." : "Save";

  const onSubmit = async (data) => {
    clearErrors("irmaNumber");

    // validate phone numbers
    let errorCount = 0;
    if (
      data.bondCarrierPhoneNumber &&
      !data.bondCarrierPhoneNumber.match(/^$|\(\d{3}\) \d{3}-\d{4}/g)
    ) {
      setError(`bondCarrierPhoneNumber`, {
        type: "invalid",
      });
      errorCount += 1;
    }

    if (!validateIrmaNumber(data.irmaNumber)) {
      setError("irmaNumber", {
        type: "invalid",
      });
      errorCount += 1;
    }

    if (errorCount > 0) {
      return;
    }

    if (data.speciesCodeId === undefined) {
      data.speciesCodeId = licence.data.speciesCodeId;
    }

    const payload = {
      ...data,
      feePaidAmount: data.paymentReceived
        ? parseAsFloat(data.feePaidAmount)
        : null,
      bondValue: data.bondValue ? parseAsFloat(data.bondValue) : undefined,
      bondCarrierPhoneNumber: data.bondCarrierPhoneNumber
        ? data.bondCarrierPhoneNumber.replace(/\D/g, "")
        : null,
      licenceType: parseAsInt(licence.data.licenceTypeId),
      licenceStatus: parseAsInt(data.licenceStatus),
      region: parseAsInt(data.region),
      regionalDistrict: parseAsInt(data.regionalDistrict),
      originalRegion: licence.data.regionId,
      originalRegionalDistrict: licence.data.regionalDistrictId,
      primaryRegistrantId: licence.data.primaryRegistrantId,
      irmaNumber: parseIrmaNumber(data.irmaNumber),
    };

    dispatch(updateLicence({ licence: payload, id: licence.data.id }));
  };

  const onCancel = () => {
    dispatch(setCurrentLicenceModeToView());
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)} noValidate>
      <section>
        <SectionHeading>License Details</SectionHeading>
        <Container className="mt-3 mb-4">
          <LicenceDetailsEdit
            form={form}
            initialValues={initialFormValues}
            licence={licence.data}
            licenceTypeId={licence.data.licenceTypeId}
            mode={LICENCE_MODE.EDIT}
          />
        </Container>
        {showBondInformation ? (
          <section>
            <SectionHeading>Bond Information</SectionHeading>
            <Container className="mt-3 mb-4">
              <BondInformationEdit
                form={form}
                initialValues={initialFormValues}
                licenceTypeId={licence.data.licenceTypeId}
                mode={LICENCE_MODE.EDIT}
              />
            </Container>
          </section>
        ) : null}
        <Container className="mt-3 mb-4">
          <SubmissionButtons
            submitButtonLabel={submissionLabel}
            submitButtonDisabled={submitting}
            cancelButtonVisible
            cancelButtonOnClick={onCancel}
          />
          <ErrorMessageRow errorMessage={errorMessage} />
        </Container>
      </section>
    </Form>
  );
}

LicenceDetailsViewEdit.propTypes = {
  licence: PropTypes.object.isRequired,
};
