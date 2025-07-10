import { Field, Input } from "@chakra-ui/react";
import { memo } from "react";

type CustomTextInputProps = {
  label: string;
  name: string;
  isNumber: boolean;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  isDisabled?: boolean;
};

function CustomTextInput({
  label,
  name,
  isNumber,
  placeholder,
  value,
  onChange,
  isDisabled,
}: CustomTextInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (isNumber) {
      // Ensure the value is a valid number or empty
      if (newValue === "" || !isNaN(Number(newValue))) {
        onChange(newValue);
      }
    } else {
      onChange(newValue);
    }
  };

  return (
    <Field.Root width={"190px"}>
      {/* <Field.Root required> */}
      <Field.Label color="white" fontWeight="semibold" fontSize="md" mb={2}>
        {label} {/*  <Field.RequiredIndicator /> */}
      </Field.Label>
      {placeholder ? (
        <Input
          bg="#313338"
          borderWidth="1px"
          color="white"
          width={"70px"}
          name={name}
          value={value}
          onChange={handleChange}
          disabled={isDisabled}
          placeholder={placeholder}
        />
      ) : (
        <Input
          bg="#313338"
          borderWidth="1px"
          color="white"
          width={"70px"}
          name={name}
          value={value}
          onChange={handleChange}
          disabled={isDisabled}
        />
      )}
      {/* <Field.HelperText>We'll never share your email.</Field.HelperText> */}
    </Field.Root>
  );
}

export default memo(CustomTextInput);
