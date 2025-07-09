import { Portal, Select, type ListCollection } from "@chakra-ui/react";
import type { ValueChangeDetails } from "@zag-js/select";
import { memo } from "react";

type CustomSelectSingleProps = {
  name: string;
  options: ListCollection;
  title: string;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  isDisabled?: boolean;
};

function CustomSelectSingle({
  options,
  name,
  title,
  value,
  onChange,
  placeholder,
  isDisabled,
}: CustomSelectSingleProps) {
  return (
    <Select.Root
      mt={6}
      collection={options}
      size="sm"
      name={name}
      width="220px"
      value={value ? [value] : []}
      onValueChange={(details: ValueChangeDetails<any>) => {
        if (onChange) {
          onChange(details.value[0] ?? "");
        }
      }}
      disabled={isDisabled}
    >
      <Select.HiddenSelect />
      <Select.Label color="white">{title}</Select.Label>
      <Select.Control bg="#313338" borderColor="#4E5058" borderWidth="1px">
        <Select.Trigger>
          <Select.ValueText color="white" placeholder={placeholder} />
        </Select.Trigger>
        <Select.IndicatorGroup>
          <Select.Indicator />
        </Select.IndicatorGroup>
      </Select.Control>
      <Portal>
        <Select.Positioner>
          <Select.Content bg="#313338" color="white">
            {options.items.map((option) => (
              <Select.Item
                item={option}
                key={option.value}
                _hover={{ bg: "#404249" }}
              >
                {option.label}
                <Select.ItemIndicator />
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Positioner>
      </Portal>
    </Select.Root>
  );
}

export default memo(CustomSelectSingle);
