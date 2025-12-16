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
import DairyTestHistoryModal, {
  DAIRY_TEST_HISTORY_SEARCH,
} from "../modals/DairyTestHistoryModal";
import UserModal, { USER } from "../modals/UserModal";
import DairyFarmTestThresholdsModal, {
  THRESHOLD,
} from "../modals/DairyFarmTestThresholdsModal";
import LicenceTypeModal, { LICENCE_TYPE } from "../modals/LicenceTypeModal";
import FurSpeciesModal, { FUR_SPECIES_MODAL } from "../modals/FurSpeciesModal";
import GameSpeciesModal, {
  GAME_SPECIES_MODAL,
} from "../modals/GameSpeciesModal";
import SlaughterhouseSpeciesModal, {
  SLAUGHTERHOUSE_SPECIES_MODAL,
} from "../modals/SlaughterhouseSpeciesModal";

import { closeModal, selectModal } from "../app/appSlice";

const MODAL_COMPONENTS = {
  [CONFIRMATION]: ConfirmationModal,
  [ADDRESS]: AddressModal,
  [PHONE]: PhoneNumberModal,
  [COMMENT]: CommentModal,
  [LICENCE_SEARCH]: LicenceSearchModal,
  [DAIRY_TEST_HISTORY_SEARCH]: DairyTestHistoryModal,
  [USER]: UserModal,
  [THRESHOLD]: DairyFarmTestThresholdsModal,
  [LICENCE_TYPE]: LicenceTypeModal,
  [FUR_SPECIES_MODAL]: FurSpeciesModal,
  [GAME_SPECIES_MODAL]: GameSpeciesModal,
  [SLAUGHTERHOUSE_SPECIES_MODAL]: SlaughterhouseSpeciesModal,
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
