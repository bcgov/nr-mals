import React from "react";
import PropTypes from "prop-types";

import "./CustomCheckBox.scss";

const CustomCheckBox = React.forwardRef((props, ref) => {
  const { id, label, onChange, disabled, defaultChecked, checked } = props;

  return (
    <div className="custom-control form-control-lg custom-checkbox">
      <input
        type="checkbox"
        className="custom-control-input"
        id={id}
        name={id}
        ref={ref}
        defaultChecked={defaultChecked}
        onChange={onChange}
        disabled={disabled}
        checked={checked}
      />
      <label className="custom-control-label" htmlFor={id}>
        {label}
      </label>
    </div>
  );
});

CustomCheckBox.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  onChange: PropTypes.func,
  disabled: PropTypes.bool,
  defaultChecked: PropTypes.bool,
  checked: PropTypes.bool,
};

CustomCheckBox.defaultProps = {
  onChange: Function.prototype,
  disabled: false,
  defaultChecked: false,
};

export default CustomCheckBox;
