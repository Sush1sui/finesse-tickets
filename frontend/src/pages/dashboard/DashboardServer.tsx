import { memo } from "react";
import { useColorModeValue } from "../../components/ui/color-mode";
import { Box, Text } from "@chakra-ui/react";
import CustomRadioGroup from "../../components/custom/input/CustomRadioGroup";
import { useAuth } from "../../context/AuthContext";
import LoadingSpinner from "../../components/custom/LoadingSpinner";
import { useDiscordServer } from "../../context/DiscordServerContext";

const RadioGroupOptions = [
  { value: "byName", label: "By Name (ticket-name)" },
  { value: "byNumber", label: "By Number (#ticket-0)" },
];

function DashboardServer() {
  const { server, isLoading: isServerLoading } = useDiscordServer();
  const { isLoading, adminServers } = useAuth();
  const bgColor = useColorModeValue("gray.100", "gray.700");
  const borderColor = useColorModeValue("gray.400", "gray.600");

  if (adminServers.length === 0 && isLoading) {
    return <LoadingSpinner />;
  }

  if (isServerLoading && !server) {
    return <LoadingSpinner />;
  }

  return (
    <Box
      w={{ base: "full", md: 72 }}
      bg={bgColor}
      borderRadius="lg"
      border="3px solid"
      borderColor={borderColor}
      p={4}
      mx={{ base: 0, md: 4 }}
      display="flex"
      flexDirection="column"
      overflowY="auto"
      width={"100%"}
    >
      <Text
        fontWeight="bold"
        fontSize="4xl"
        whiteSpace="normal"
        wordBreak="break-word"
        lineHeight={1.1}
        letterSpacing="wide"
      >
        Settings
      </Text>

      {/* Ticket Name Style */}
      <CustomRadioGroup
        name="ticketNameStyle"
        label="Ticket name style"
        options={RadioGroupOptions}
      />
    </Box>
  );
}

export default memo(DashboardServer);
