import { Box, Spinner, Text } from "@chakra-ui/react";
import { memo } from "react";

function LoadingSpinner({ message }: { message?: string }) {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      flex={1}
      minHeight="calc(100vh - 200px)" // Adjust based on header/footer
    >
      <Spinner size="xl" />
      <Text mt={4}>{message || "Loading..."}</Text>
    </Box>
  );
}

export default memo(LoadingSpinner);
