import React, { createRef, useEffect } from "react";
import PropTypes from "prop-types";
import { useSelector, useDispatch } from "react-redux";
import { Button, Modal } from "react-bootstrap";

import ConfirmationModal, { CONFIRMATION } from "../modals/ConfirmationModal";
import AddressModal, { ADDRESS } from "../modals/AddressModal";
import PhoneNumberModal, { PHONE } from "../modals/PhoneNumberModal";
import CommentModal, { COMMENT } from "../modals/CommentModal";

import { closeModal, selectModal } from "../app/appSlice";

const MODAL_COMPONENTS = {
  [CONFIRMATION]: ConfirmationModal,
  [ADDRESS]: AddressModal,
  [PHONE]: PhoneNumberModal,
  [COMMENT]: CommentModal,
};

export default function ModalComponent() {
  const dispatch = useDispatch();

  const close = () => {
    dispatch(closeModal());
  };

  const submit = (data) => {
    if (callback) {
      callback(data);
    }
    dispatch(closeModal());
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
