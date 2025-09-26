import React from "react";
import PropTypes from "prop-types";
import { Button } from "react-bootstrap";

const LinkButton = React.forwardRef(
  ({ variant, block, children, href }, ref) => {
    return (
      <Button href={href} variant={variant} block={block} ref={ref}>
        {children}
      </Button>
    );
  }
);

LinkButton.propTypes = {
  children: PropTypes.any.isRequired,
  href: PropTypes.string,
  variant: PropTypes.string,
  block: PropTypes.bool,
};
LinkButton.defaultProps = {
  href: "/",
  variant: undefined,
  block: false,
};

export default LinkButton;
