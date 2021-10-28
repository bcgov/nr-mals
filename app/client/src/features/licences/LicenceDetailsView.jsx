/* eslint-disable jsx-a11y/label-has-associated-control */
import React from "react";
import PropTypes from "prop-types";
import NumberFormat from "react-number-format";
import { Row, Col } from "react-bootstrap";

import { parseAsInt } from "../../utilities/parsing";

import {
  formatDateString,
  formatMoney,
  formatBoolean,
} from "../../utilities/formatting.ts";

import VerticalField from "../../components/VerticalField";

import { getLicenceTypeConfiguration } from "./licenceTypeUtility";

export default function LicenceDetailsView({ licence }) {
  const config = getLicenceTypeConfiguration(licence.licenceTypeId);

  const primaryAddress = licence.addresses.find(
    (x) => x.addressType === "Primary"
  );
  const mailingAddress = licence.addresses.find(
    (x) => x.addressType === "Mailing"
  );
  const primaryPhone = licence.phoneNumbers.find(
    (x) => x.phoneNumberType === "Primary"
  );
  const secondaryPhone = licence.phoneNumbers.find(
    (x) => x.phoneNumberType === "Secondary"
  );
  const faxNumber = licence.phoneNumbers.find(
    (x) => x.phoneNumberType === "Fax"
  );
  return (
    <>
      <Row className="mt-3">
        <Col lg={4}>
          <VerticalField
            label="Application Date"
            value={formatDateString(licence.applicationDate)}
          />
        </Col>
        <Col lg={8}>
          <VerticalField label="Region" value={licence.region} />
        </Col>
      </Row>
      <Row className="mt-3">
        <Col lg={4}>
          <VerticalField
            label="Issued On"
            value={formatDateString(licence.issuedOnDate)}
          />
        </Col>
        <Col lg={8}>
          <VerticalField label="District" value={licence.regionalDistrict} />
        </Col>
      </Row>
      <Row className="mt-3">
        <Col lg={4}>
          {config.replaceExpiryDateWithIrmaNumber ? (
            <VerticalField
              label="IRMA Number"
              value={
                <NumberFormat
                  displayType="text"
                  format="##-###"
                  value={licence.irmaNumber}
                />
              }
            />
          ) : (
            <VerticalField
              label="Expiry Date"
              value={formatDateString(licence.expiryDate)}
            />
          )}
        </Col>
        <Col lg={8}>
          <VerticalField label="Licence Status" value={licence.licenceStatus} />
        </Col>
      </Row>
      <Row className="mt-3">
        <Col lg={4}>
          <Row>
            <Col>
              <label className="strong">Address</label>{" "}
            </Col>
          </Row>
          {primaryAddress !== undefined ? (
            <>
              <Row>
                <Col>Primary Address:</Col>
              </Row>
              <Row>
                <Col>{primaryAddress.addressLine1}</Col>
              </Row>
              <Row>
                <Col>
                  {`${primaryAddress.city}, ${primaryAddress.province}`}
                </Col>
              </Row>
              <Row className="mb-2">
                <Col>
                  {`${primaryAddress.postalCode}, ${primaryAddress.country}`}
                </Col>
              </Row>
            </>
          ) : null}
          {mailingAddress !== undefined ? (
            <>
              <Row>
                <Col>Mailing Address:</Col>
              </Row>
              <Row>
                <Col>{mailingAddress.addressLine1}</Col>
              </Row>
              <Row>
                <Col>
                  {`${mailingAddress.city}, ${mailingAddress.province}`}
                </Col>
              </Row>
              <Row>
                <Col>
                  {`${mailingAddress.postalCode}, ${mailingAddress.country}`}
                </Col>
              </Row>
            </>
          ) : null}
        </Col>
        <Col lg={8}>
          <Row>
            <Col>
              <label className="strong">Phone/Fax Numbers</label>
            </Col>
          </Row>
          {primaryPhone !== undefined ? (
            <Row>
              <Col lg={3}>Primary Number:</Col>
              <Col>{primaryPhone.number}</Col>
            </Row>
          ) : null}
          {secondaryPhone !== undefined ? (
            <Row>
              <Col lg={3}>Secondary Number:</Col>
              <Col>{secondaryPhone.number}</Col>
            </Row>
          ) : null}
          {faxNumber !== undefined ? (
            <Row>
              <Col lg={3}>Fax Number:</Col>
              <Col>{faxNumber.number}</Col>
            </Row>
          ) : null}
        </Col>
      </Row>
      {config.replacePaymentReceivedWithHiveFields ? (
        <Row className="mt-3">
          <Col lg={4}>
            <VerticalField label="Total Hives" value={licence.totalHives} />
          </Col>
          <Col lg={8}>
            <VerticalField
              label="Hives per Apiary"
              value={licence.hivesPerApiary}
            />
          </Col>
        </Row>
      ) : (
        <Row className="mt-3">
          <Col lg={4}>
            <VerticalField
              label="Payment Received"
              value={formatBoolean(licence.paymentReceived)}
            />
          </Col>
          {licence.paymentReceived && (
            <Col lg={4}>
              <VerticalField
                label="Fee Paid Amount"
                value={formatMoney(parseAsInt(licence.feePaidAmount))}
              />
            </Col>
          )}
        </Row>
      )}
    </>
  );
}

LicenceDetailsView.propTypes = {
  licence: PropTypes.object.isRequired,
};
