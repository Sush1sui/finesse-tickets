import { memo, useEffect, useMemo, useState } from "react";
import { useColorModeValue } from "../../components/ui/color-mode";
import { Box, createListCollection, Text } from "@chakra-ui/react";
import CustomRadioGroup from "../../components/custom/input/CustomRadioGroup";
import { useAuth } from "../../context/AuthContext";
import LoadingSpinner from "../../components/custom/LoadingSpinner";
import { useDiscordServer } from "../../context/DiscordServerContext";
import CustomSelectSingle from "../../components/custom/input/CustomSelectSingle";
import CustomTextInput from "../../components/custom/input/CustomTextInput";

const RadioGroupOptions = [
  { value: "number", label: "By Name (ticket-name)" },
  { value: "name", label: "By Number (#ticket-0)" },
];

function DashboardServer() {
  const { server, isLoading: isServerLoading } = useDiscordServer();
  const { isLoading, adminServers } = useAuth();
  const bgColor = useColorModeValue("gray.100", "gray.700");
  const borderColor = useColorModeValue("gray.400", "gray.600");

  const channelChoices = useMemo(
    () =>
      createListCollection({
        items: server?.channels
          .map((channel) => ({
            value: channel.id,
            label: channel.name,
          }))
          .concat({ value: "", label: "No Channel" }) || [
          { value: "", label: "No Channel" },
        ],
      }),
    [server]
  );

  // INPUT STATES
  const [ticketNameStyle, setTicketNameStyle] = useState<string>(
    server?.ticketNameStyle || "number"
  );
  const [transcriptChannelId, setTranscriptChannelId] = useState<
    string | undefined
  >(server?.ticketTranscriptChannelId);
  const [maxTicketPerUser, setMaxTicketPerUser] = useState<number>(
    server?.maxTicketsPerUser || 1
  );

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
        value={ticketNameStyle}
        onChange={(value) => setTicketNameStyle(value as "number" | "name")}
        isDisabled={!server}
      />

      <Box display={"flex"} flexWrap={"wrap"} gap={10}>
        {/* Ticket Transcript Channel */}
        <CustomSelectSingle
          name="ticketTranscriptChannel"
          title="Ticket transcript channel"
          options={channelChoices}
          value={transcriptChannelId}
          onChange={(value) =>
            setTranscriptChannelId(value === "" ? undefined : value)
          }
          isDisabled={!server}
        />

        {/* Max Tickets Per User */}
        <CustomTextInput
          label="Max Tickets Per User"
          name="maxTicketsPerUser"
          isNumber={true}
          placeholder="1"
          value={maxTicketPerUser.toString()}
          onChange={(value) => setMaxTicketPerUser(Number(value))}
          isDisabled={!server}
        />
      </Box>
    </Box>
  );
}

export default memo(DashboardServer);
