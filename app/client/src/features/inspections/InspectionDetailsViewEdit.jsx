/* eslint-disable */
import React, { useEffect } from "react";
import PropTypes from "prop-types";
import { useDispatch, useSelector } from "react-redux";
import { Redirect } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Container, Form } from "react-bootstrap";

import {
  LICENCE_MODE,
  REQUEST_STATUS,
  LICENSES_PATHNAME,
} from "../../utilities/constants";
import { formatNumber } from "../../utilities/formatting.ts";
import { parseAsInt, parseAsFloat, parseAsDate } from "../../utilities/parsing";

import ErrorMessageRow from "../../components/ErrorMessageRow";
import SectionHeading from "../../components/SectionHeading";
import SubmissionButtons from "../../components/SubmissionButtons";

import {
  updateApiaryInspection,
  setCurrentInspectionModeToEdit,
  setCurrentInspectionModeToView,
} from "./inspectionsSlice";

import ApiaryInspectionDetailsEdit from "./ApiaryInspectionDetailsEdit";
import ApiaryInspectionDetailsView from "./ApiaryInspectionDetailsView";

import * as LicenceTypeConstants from "../licences/constants";

export default function InspectionDetailsViewEdit({
  inspection,
  site,
  licence,
}) {
  const { status, error, mode } = inspection;
  console.log(mode);

  const dispatch = useDispatch();

  useEffect(() => {}, [dispatch]);

  const form = useForm({
    reValidateMode: "onBlur",
  });
  const { register, handleSubmit, setValue } = form;

  const initialFormValues = {};

  useEffect(() => {
    // setValue("region", formatNumber(site.data.regionId));
    // setValue("regionalDistrict", formatNumber(site.data.regionalDistrictId));
    // setValue("licenceStatus", site.data.siteStatusId);
    // setValue("addressLine1", site.data.addressLine1);
    // setValue("addressLine2", site.data.addressLine2);
    // setValue("city", site.data.city);
    // setValue("province", site.data.province);
    // setValue("postalCode", site.data.postalCode);
    // setValue("country", site.data.country);
    // setValue("latitude", site.data.latitude);
    // setValue("longitude", site.data.longitude);
    // setValue("firstName", site.data.firstName);
    // setValue("lastName", site.data.lastName);
    // setValue("primaryPhone", site.data.primaryPhone);
    // setValue("secondaryPhone", site.data.secondaryPhone);
    // setValue("email", site.data.email);
    // setValue("legalDescriptionText", site.data.legalDescriptionText);
  }, [
    // setValue,
    // site.data.regionId,
    // site.data.regionalDistrictId,
    // site.data.siteStatusId,
    // site.data.addressLine1,
    // site.data.addressLine2,
    // site.data.city,
    // site.data.province,
    // site.data.postalCode,
    // site.data.country,
    // site.data.latitude,
    // site.data.longitude,
    // site.data.firstName,
    // site.data.lastName,
    // site.data.primaryPhone,
    // site.data.secondaryPhone,
    // site.data.email,
    // site.data.legalDescriptionText,
    mode,
  ]);

  if (mode === LICENCE_MODE.VIEW) {
    const onEdit = () => {
      dispatch(setCurrentInspectionModeToEdit());
    };
    return (
      <section>
        <SectionHeading onEdit={onEdit} showEditButton>
          Inspection Details
        </SectionHeading>
        <Container className="mt-3 mb-4">
          <ApiaryInspectionDetailsView
            inspection={inspection.data}
            site={site.data}
          />
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
    switch (licence.data.licenceTypeId) {
      case LicenceTypeConstants.LICENCE_TYPE_ID_APIARY: {
        const payload = {
          ...data,
          siteId: site.data.id,
          inspectorId: data.inspectorId.length === 0 ? null : data.inspectorId,
          coloniesTested: parseAsInt(data.coloniesTested),
          broodTested: parseAsInt(data.broodTested),
          varroaTested: parseAsInt(data.varroaTested),
          smallHiveBeetleTested: parseAsInt(data.smallHiveBeetleTested),
          americanFoulbroodResult: parseAsInt(data.americanFoulbroodResult),
          europeanFoulbroodResult: parseAsInt(data.europeanFoulbroodResult),
          smallHiveBeetleResult: parseAsInt(data.smallHiveBeetleResult),
          chalkbroodResult: parseAsInt(data.chalkbroodResult),
          sacbroodResult: parseAsInt(data.sacbroodResult),
          nosemaResult: parseAsInt(data.nosemaResult),
          varroaMiteResult: parseAsInt(data.varroaMiteResult),
          varroaMiteResultPercent: parseAsFloat(data.varroaMiteResultPercent),
          otherResultDescription:
            data.otherResultDescription.length === 0
              ? null
              : data.otherResultDescription,
          supersInspected: parseAsInt(data.supersInspected),
          supersDestroyed: parseAsInt(data.supersDestroyed),
          inspectionComment:
            data.inspectionComment.length === 0 ? null : data.inspectionComment,
        };
        dispatch(
          updateApiaryInspection({
            inspection: payload,
            id: inspection.data.id,
          })
        );
        break;
      }
      default:
        break;
    }
  };

  const onCancel = () => {
    dispatch(setCurrentInspectionModeToView());
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)} noValidate>
      <section>
        <SectionHeading>Inspection Details</SectionHeading>
        <Container className="mt-3 mb-4">
          <ApiaryInspectionDetailsEdit
            form={form}
            // initialValues={initialFormValues}
            inspection={inspection.data}
            site={site.data}
            // mode={LICENCE_MODE.EDIT}
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

InspectionDetailsViewEdit.propTypes = {
  inspection: PropTypes.object.isRequired,
  site: PropTypes.object.isRequired,
  licence: PropTypes.object.isRequired,
};
