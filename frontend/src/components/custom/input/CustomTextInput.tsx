import { Field, Input } from "@chakra-ui/react";

type CustomTextInputProps = {
  label: string;
  name: string;
  isNumber: boolean;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  isDisabled?: boolean;
};

export default function CustomTextInput({
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
    <Field.Root mt={6} width={"150px"}>
      {/* <Field.Root required> */}
      <Field.Label color="white">
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
