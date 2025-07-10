import { Switch } from "@chakra-ui/react";
import { memo } from "react";

type CustomSwitchProps = {
  label: string;
  isChecked: boolean;
  onChange: (checked: boolean) => void;
};

function CustomSwitch({ label, isChecked, onChange }: CustomSwitchProps) {
  return (
    <Switch.Root
      checked={isChecked}
      onCheckedChange={(e) => onChange(e.checked)}
    >
      <Switch.HiddenInput />
      <Switch.Control />
      <Switch.Label>{label}</Switch.Label>
    </Switch.Root>
  );
}

export default memo(CustomSwitch);
