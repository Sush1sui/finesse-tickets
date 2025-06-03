import { memo } from "react";
import { Box } from "@chakra-ui/react";
import DiyAlert from "./DiyAlert";
import DiyAlertIcon from "./DiyAlertIcon";

function CustomAlert({ message }: { message?: string }) {
  return (
    <Box textAlign="center" mt={10}>
      <DiyAlert status="error">
        <DiyAlertIcon status="error" />
        {message || "Access Denied. Something went wrong."}
      </DiyAlert>
    </Box>
  );
}

export default memo(CustomAlert);
