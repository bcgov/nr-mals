import React, { useEffect } from "react";
import PropTypes from "prop-types";
import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { Container, Form } from "react-bootstrap";

import { LICENCE_MODE, REQUEST_STATUS } from "../../utilities/constants";
import { formatNumber } from "../../utilities/formatting.ts";
import { parseAsInt, parseAsFloat, parseAsDate } from "../../utilities/parsing";

import ErrorMessageRow from "../../components/ErrorMessageRow";
import SectionHeading from "../../components/SectionHeading";
import SubmissionButtons from "../../components/SubmissionButtons";

import { fetchRegions } from "../lookups/regionsSlice";
import { fetchLicenceStatuses } from "../lookups/licenceStatusesSlice";
import {
  updateLicence,
  setCurrentLicenceModeToEdit,
  setCurrentLicenceModeToView,
} from "./licencesSlice";

import LicenceDetailsEdit from "./LicenceDetailsEdit";
import LicenceDetailsView from "./LicenceDetailsView";

export default function LicenceDetailsViewEdit({ licence }) {
  const { status, error, mode } = licence;

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchRegions());
    dispatch(fetchLicenceStatuses());
  }, [dispatch]);

  const form = useForm({
    reValidateMode: "onBlur",
  });
  const { register, handleSubmit, setValue } = form;

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
    mode,
  ]);

  if (mode === LICENCE_MODE.VIEW) {
    const onEdit = () => {
      dispatch(setCurrentLicenceModeToEdit());
    };
    return (
      <section>
        <SectionHeading onEdit={onEdit} showEditButton>
          License Details
        </SectionHeading>
        <Container className="mt-3 mb-4">
          <LicenceDetailsView licence={licence.data} />
        </Container>
      </section>
    );
  }

  const submitting = status === REQUEST_STATUS.PENDING;

  let errorMessage = null;
  if (status === REQUEST_STATUS.REJECTED) {
    errorMessage = `${error.code}: ${error.description}`;
  }

  const submissionLabel = submitting ? "Saving..." : "Save";

  const onSubmit = async (data) => {
    const payload = {
      ...data,
      feePaidAmount: data.paymentReceived
        ? parseAsFloat(data.feePaidAmount)
        : null,
      licenceStatus: parseAsInt(data.licenceStatus),
      region: parseAsInt(data.region),
      regionalDistrict: parseAsInt(data.regionalDistrict),
      originalRegion: licence.data.regionId,
      originalRegionalDistrict: licence.data.regionalDistrictId,
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
            licenceTypeId={licence.data.licenceTypeId}
            mode={LICENCE_MODE.EDIT}
          />
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
