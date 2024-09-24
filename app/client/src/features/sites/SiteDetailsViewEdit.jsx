import React, { useEffect } from "react";
import PropTypes from "prop-types";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { Container, Form } from "react-bootstrap";

import {
  LICENCE_MODE,
  REQUEST_STATUS,
  SYSTEM_ROLES,
} from "../../utilities/constants";
import { formatNumber } from "../../utilities/formatting.ts";
import { parseAsInt } from "../../utilities/parsing";

import ErrorMessageRow from "../../components/ErrorMessageRow";
import SectionHeading from "../../components/SectionHeading";
import SubmissionButtons from "../../components/SubmissionButtons";

import { fetchRegions } from "../lookups/regionsSlice";
import { fetchLicenceStatuses } from "../lookups/licenceStatusesSlice";
import {
  updateSite,
  setCurrentSiteModeToEdit,
  setCurrentSiteModeToView,
} from "./sitesSlice";

import SiteDetailsEdit from "./SiteDetailsEdit";
import SiteDetailsView from "./SiteDetailsView";

import { fetchCities } from "../lookups/citiesSlice";

import { selectCurrentUser } from "../../app/appSlice";

export default function SiteDetailsViewEdit({ site, licence }) {
  const { status, error, mode } = site;

  const dispatch = useDispatch();

  const currentUser = useSelector(selectCurrentUser);

  useEffect(() => {
    dispatch(fetchRegions());
    dispatch(fetchLicenceStatuses());
    dispatch(fetchCities());
  }, [dispatch]);

  const form = useForm({
    reValidateMode: "onBlur",
  });
  const { handleSubmit, setValue, setError } = form;

  const initialFormValues = {
    licenceStatus: null,
    region: null,
    regionalDistrict: null,
    addressLine1: null,
    addressLine2: null,
    city: null,
    province: null,
    postalCode: null,
    country: null,
    latitude: null,
    longitude: null,
    firstName: null,
    lastName: site.data.lastName,
    primaryPhone: site.data.primaryPhone,
    secondaryPhone: site.data.secondaryPhone,
    emailAddress: null,
    legalDescriptionText: null,
    hiveCount: null,
    premisesId: null,
  };

  useEffect(() => {
    setValue("region", formatNumber(site.data.regionId));
    setValue("regionalDistrict", formatNumber(site.data.regionalDistrictId));
    setValue("licenceStatus", site.data.siteStatusId);
    setValue("addressLine1", site.data.addressLine1);
    setValue("addressLine2", site.data.addressLine2);
    setValue("city", site.data.city);
    setValue("province", site.data.province);
    setValue("postalCode", site.data.postalCode);
    setValue("country", site.data.country);
    setValue("latitude", site.data.latitude);
    setValue("longitude", site.data.longitude);
    setValue("firstName", site.data.firstName);
    setValue("lastName", site.data.lastName);
    setValue("emailAddress", site.data.emailAddress);
    setValue("legalDescriptionText", site.data.legalDescriptionText);
    setValue("hiveCount", site.data.hiveCount);
    setValue("premisesId", site.data.premisesId);
  }, [
    setValue,
    site.data.regionId,
    site.data.regionalDistrictId,
    site.data.siteStatusId,
    site.data.addressLine1,
    site.data.addressLine2,
    site.data.city,
    site.data.province,
    site.data.postalCode,
    site.data.country,
    site.data.latitude,
    site.data.longitude,
    site.data.firstName,
    site.data.lastName,
    site.data.emailAddress,
    site.data.legalDescriptionText,
    site.data.hiveCount,
    site.data.premisesId,
    mode,
  ]);

  if (mode === LICENCE_MODE.VIEW) {
    const onEdit = () => {
      dispatch(setCurrentSiteModeToEdit());
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
          Site Details
        </SectionHeading>
        <Container className="mt-3 mb-4">
          <SiteDetailsView
            site={site.data}
            licenceTypeId={licence.licenceTypeId}
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
    let errorCount = 0;
    if (
      data.primaryPhone &&
      !data.primaryPhone.match(/^$|\(\d{3}\) \d{3}-\d{4}/g)
    ) {
      setError(`primaryPhone`, {
        type: "invalid",
      });
      errorCount += 1;
    }

    if (
      data.secondaryPhone &&
      !data.secondaryPhone.match(/^$|\(\d{3}\) \d{3}-\d{4}/g)
    ) {
      setError(`secondaryPhone`, {
        type: "invalid",
      });
      errorCount += 1;
    }

    if (errorCount > 0) {
      return;
    }
    console.log("onsubmit");
    console.log(data);
    console.log(site.data);

    const payload = {
      ...data,
      licenceId: site.data.licenceId,
      siteStatus: parseAsInt(data.licenceStatus),
      region: parseAsInt(data.region),
      regionalDistrict: parseAsInt(data.regionalDistrict),
      originalRegion: site.data.regionId,
      originalRegionalDistrict: site.data.regionalDistrictId,
      hiveCount: parseAsInt(data.hiveCount),
      postalCode: data.postalCode ? data.postalCode.replace(" ", "") : null,
      primaryPhone: data.primaryPhone
        ? data.primaryPhone.replace(/\D/g, "")
        : null,
      secondaryPhone: data.secondaryPhone
        ? data.secondaryPhone.replace(/\D/g, "")
        : null,
    };

    dispatch(updateSite({ site: payload, id: site.data.id }));
  };

  const onCancel = () => {
    dispatch(setCurrentSiteModeToView());
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)} noValidate>
      <section>
        <SectionHeading>Site Details</SectionHeading>
        <Container className="mt-3 mb-4">
          <SiteDetailsEdit
            form={form}
            initialValues={initialFormValues}
            licence={licence}
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

SiteDetailsViewEdit.propTypes = {
  site: PropTypes.object.isRequired,
  licence: PropTypes.object.isRequired,
};
