import { Eye, EyeOff } from "lucide-react";

const PasswordReveal = ({ show, onToggle, showLabel, hideLabel }) => (
  <button
    type="button"
    className="text-btn field-reveal icon-reveal"
    onClick={onToggle}
    aria-label={show ? hideLabel : showLabel}
  >
    {show ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
  </button>
);

export default PasswordReveal;
