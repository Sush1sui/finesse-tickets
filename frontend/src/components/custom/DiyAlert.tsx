import { Box } from "@chakra-ui/react";
import type { ReactNode } from "react";

export default function DiyAlert({
  status,
  children,
}: {
  status: string;
  children: ReactNode;
}) {
  const bgColor = status === "error" ? "red.100" : "blue.100";
  const borderColor = status === "error" ? "red.200" : "blue.200";
  const textColor = status === "error" ? "red.700" : "blue.700";

  return (
    <Box
      p={4}
      bg={bgColor}
      borderColor={borderColor}
      borderWidth={1}
      borderRadius="md"
      color={textColor}
      display="flex"
      alignItems="center"
    >
      {children}
    </Box>
  );
}
