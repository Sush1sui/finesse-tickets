import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { useColorModeValue } from "../../components/ui/color-mode";
import { Box, Button, createListCollection, Text } from "@chakra-ui/react";
import CustomRadioGroup from "../../components/custom/input/CustomRadioGroup";
import { useAuth } from "../../context/AuthContext";
import LoadingSpinner from "../../components/custom/LoadingSpinner";
import { useDiscordServer } from "../../context/DiscordServerContext";
import CustomSelectSingle from "../../components/custom/input/CustomSelectSingle";
import CustomTextInput from "../../components/custom/input/CustomTextInput";
import CustomSwitch from "../../components/custom/input/CustomSwitch";
import { ToggleTip } from "../../components/ui/ToggleTip";
import { LuInfo } from "react-icons/lu";

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
  const [ticketPermissions, setTicketPermissions] = useState<string[]>([]);

  const handleTicketPermissionsChange = useCallback((permission: string) => {
    setTicketPermissions((prev) =>
      prev.includes(permission)
        ? prev.filter((p) => p !== permission)
        : [...prev, permission]
    );
  }, []);

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
      <Box mt={6}>
        <CustomRadioGroup
          name="ticketNameStyle"
          label="Ticket name style"
          options={RadioGroupOptions}
          value={ticketNameStyle}
          onChange={(value) => setTicketNameStyle(value as "number" | "name")}
          isDisabled={!server}
        />
      </Box>

      <Box display={"flex"} flexWrap={"wrap"} gap={7} mt={6}>
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

      {/* Ticket Permissions */}
      <Box mt={6}>
        <Box display={"flex"} flexWrap={"wrap"} gap={2}>
          <Text fontWeight="bold" fontSize="lg" mb={2}>
            Ticket Permissions
          </Text>
          <ToggleTip content="Set ticket permissions for normal members who open tickets.">
            <Button size="xs" variant="ghost">
              <LuInfo />
            </Button>
          </ToggleTip>
        </Box>
        <Box display={"flex"} flexWrap={"wrap"} gap={7} mt={3}>
          <CustomSwitch
            label="Attach Files"
            isChecked={ticketPermissions.includes("ATTACH_FILES")}
            onChange={() => handleTicketPermissionsChange("ATTACH_FILES")}
          />
          <CustomSwitch
            label="Embed Links"
            isChecked={ticketPermissions.includes("EMBED_LINKS")}
            onChange={() => handleTicketPermissionsChange("EMBED_LINKS")}
          />
          <CustomSwitch
            label="Add Reactions"
            isChecked={ticketPermissions.includes("ADD_REACTIONS")}
            onChange={() => handleTicketPermissionsChange("ADD_REACTIONS")}
          />
        </Box>
      </Box>
    </Box>
  );
}

export default memo(DashboardServer);
