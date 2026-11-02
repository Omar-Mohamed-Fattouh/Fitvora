import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import flags from "react-phone-number-input/flags";
import "react-phone-number-input/style.css";

export { isValidPhoneNumber };

const PhoneField = ({
  id,
  name,
  value,
  onChange,
  onBlur,
  invalid = false,
  disabled = false,
  placeholder = "",
}) => (
  <div className={`phone-field ${invalid ? "is-bad" : ""}`} dir="ltr">
    <PhoneInput
      id={id}
      name={name}
      international
      flags={flags}
      defaultCountry="EG"
      countryCallingCodeEditable={false}
      value={value || undefined}
      onChange={(next) => onChange(next || "")}
      onBlur={onBlur}
      disabled={disabled}
      numberInputProps={{
        autoComplete: "tel-national",
        inputMode: "tel",
        placeholder,
      }}
    />
  </div>
);

export default PhoneField;
