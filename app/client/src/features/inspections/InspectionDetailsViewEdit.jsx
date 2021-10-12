import React, { useEffect } from "react";
import PropTypes from "prop-types";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { Container, Form } from "react-bootstrap";
import { startOfToday } from "date-fns";

import {
  LICENCE_MODE,
  REQUEST_STATUS,
  SYSTEM_ROLES,
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

import { selectCurrentUser } from "../../app/appSlice";

export default function InspectionDetailsViewEdit({
  inspection,
  site,
  licence,
}) {
  const { status, error, mode } = inspection;

  const dispatch = useDispatch();

  const currentUser = useSelector(selectCurrentUser);

  const today = startOfToday();

  const form = useForm({
    reValidateMode: "onBlur",
  });
  const { handleSubmit, setValue } = form;

  const initialFormValues = {
    inspectionDate: inspection.data
      ? parseAsDate(inspection.data.inspectionDate)
      : today,
    inspectorId: null,
    coloniesTested: null,
    broodTested: null,
    varroaTested: null,
    smallHiveBeetleTested: null,
    americanFoulbroodResult: null,
    europeanFoulbroodResult: null,
    smallHiveBeetleResult: null,
    chalkbroodResult: null,
    sacbroodResult: null,
    nosemaResult: null,
    varroaMiteResult: null,
    varroaMiteResultPercent: null,
    otherResultDescription: null,
    supersInspected: null,
    supersDestroyed: null,
    inspectionComment: null,
  };

  useEffect(() => {}, [dispatch]);

  useEffect(() => {
    setValue("inspectionDate", new Date(inspection.data.inspectionDate));
    setValue("inspectorId", formatNumber(inspection.data.inspectorId));
    setValue("coloniesTested", inspection.data.coloniesTested);
    setValue("broodTested", inspection.data.broodTested);
    setValue("varroaTested", inspection.data.varroaTested);
    setValue("smallHiveBeetleTested", inspection.data.smallHiveBeetleTested);
    setValue(
      "americanFoulbroodResult",
      inspection.data.americanFoulbroodResult
    );
    setValue(
      "europeanFoulbroodResult",
      inspection.data.europeanFoulbroodResult
    );
    setValue("chalkbroodResult", inspection.data.chalkbroodResult);
    setValue("sacbroodResult", inspection.data.sacbroodResult);
    setValue("nosemaResult", inspection.data.nosemaResult);
    setValue("varroaMiteResult", inspection.data.varroaMiteResult);
    setValue(
      "varroaMiteResultPercent",
      inspection.data.varroaMiteResultPercent
    );
    setValue("otherResultDescription", inspection.data.otherResultDescription);
    setValue("supersInspected", inspection.data.supersInspected);
    setValue("supersDestroyed", inspection.data.supersDestroyed);
    setValue("inspectionComment", inspection.data.inspectionComment);
  }, [
    setValue,
    inspection.data.inspectionDate,
    inspection.data.inspectorId,
    inspection.data.coloniesTested,
    inspection.data.broodTested,
    inspection.data.varroaTested,
    inspection.data.smallHiveBeetleTested,
    inspection.data.americanFoulbroodResult,
    inspection.data.europeanFoulbroodResult,
    inspection.data.chalkbroodResult,
    inspection.data.sacbroodResult,
    inspection.data.nosemaResult,
    inspection.data.varroaMiteResult,
    inspection.data.varroaMiteResultPercent,
    inspection.data.otherResultDescription,
    inspection.data.supersInspected,
    inspection.data.supersDestroyed,
    inspection.data.inspectionComment,
    mode,
  ]);

  if (mode === LICENCE_MODE.VIEW) {
    const onEdit = () => {
      dispatch(setCurrentInspectionModeToEdit());
    };
    return (
      <section>
        <SectionHeading
          onEdit={onEdit}
          showEditButton={currentUser.data.roleId !== SYSTEM_ROLES.READ_ONLY}
        >
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
            initialValues={initialFormValues}
            site={site.data}
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
