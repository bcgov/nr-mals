import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Modal } from "react-bootstrap";

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

  const { open, modalType, data, modalSize, callback } = useSelector(
    selectModal
  );

  const close = () => {
    dispatch(closeModal());
  };

  const submit = (submitData) => {
    dispatch(closeModal());

    if (callback) {
      callback(submitData);
    }
  };

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
          // eslint-disable-next-line
          {...data}
          closeModal={() => close()}
          submit={(submitData) => submit(submitData)}
        />
      ) : null}
    </Modal>
  );
}

ModalComponent.propTypes = {};
