import { Box, Text } from "@chakra-ui/react";
import { memo } from "react";

type CustomRadioGroupProps = {
  name: string;
  label: string;
  options: { value: string; label: string }[];
};

function CustomRadioGroup({ name, label, options }: CustomRadioGroupProps) {
  return (
    <Box mt={6}>
      <Text fontWeight="semibold" fontSize="lg" mb={2}>
        {label}
      </Text>
      <Box display="flex" gap={6}>
        {options.map((option) => (
          <Box key={option.value} display="flex" alignItems="center" gap={2}>
            <input
              type="radio"
              name={name}
              id={option.value}
              value={option.value}
              style={{ accentColor: "#3182ce", width: "18px", height: "18px" }}
            />
            <label
              htmlFor={option.value}
              style={{ cursor: "pointer", fontSize: "1rem" }}
            >
              {option.label}
            </label>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

export default memo(CustomRadioGroup);
