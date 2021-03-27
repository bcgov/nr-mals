/* eslint-disable */
import React, { createRef, useEffect } from "react";
import PropTypes from "prop-types";
import { useSelector, useDispatch } from "react-redux";
import { Button, Modal } from "react-bootstrap";

import ConfirmationModal, { CONFIRMATION } from "../modals/ConfirmationModal";
import AddressModal, { ADDRESS } from "../modals/AddressModal";
import PhoneNumberModal, { PHONE } from "../modals/PhoneNumberModal";
import CommentModal, { COMMENT } from "../modals/CommentModal";
import LicenceSearchModal, {
  LICENCE_SEARCH,
} from "../modals/LicenceSearchModal";
import UserModal, { USER } from "../modals/UserModal";

import { closeModal, selectModal } from "../app/appSlice";

const MODAL_COMPONENTS = {
  [CONFIRMATION]: ConfirmationModal,
  [ADDRESS]: AddressModal,
  [PHONE]: PhoneNumberModal,
  [COMMENT]: CommentModal,
  [LICENCE_SEARCH]: LicenceSearchModal,
  [USER]: UserModal,
};

export default function ModalComponent() {
  const dispatch = useDispatch();

  const close = () => {
    dispatch(closeModal());
  };

  const submit = (data) => {
    dispatch(closeModal());

    if (callback) {
      callback(data);
    }
  };

  const ref = createRef();

  const { open, modalType, data, modalSize, callback } = useSelector(
    selectModal
  );
  const SpecifiedModal = MODAL_COMPONENTS[modalType];

  return (
    <Modal
      show={open}
      animation={false}
      onHide={() => close()}
      size={modalSize !== null ? modalSize : "sm"}
    >
      {SpecifiedModal ? (
        <SpecifiedModal
          {...data}
          closeModal={() => close()}
          submit={(data) => submit(data)}
        />
      ) : null}
    </Modal>
  );
}

ModalComponent.propTypes = {};
