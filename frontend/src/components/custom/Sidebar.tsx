import { Box, Flex, Text, IconButton, HStack, Image } from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import {
  FiMenu,
  FiChevronLeft,
  FiSettings,
  FiFileText,
  FiUsers,
} from "react-icons/fi";
import { MdViewKanban } from "react-icons/md";
import { useColorModeValue } from "../ui/color-mode";
import { useAuth, type AdminServer } from "../../context/AuthContext";
import { Link, useParams } from "react-router-dom";
import LoadingSpinner from "./LoadingSpinner";

export default function Sidebar() {
  const { adminServers, fetchAdminServers, isLoading } = useAuth();
  const { id } = useParams();
  const [mobileOpen, setMobileOpen] = useState(false);
  const sidebarBg = useColorModeValue("gray.100", "gray.700");
  const borderColor = useColorModeValue("gray.400", "gray.600");
  const [server, setServer] = useState<AdminServer | null>(null);

  useEffect(() => {
    if ((!adminServers || adminServers.length === 0) && id) {
      fetchAdminServers();
    }
    if (id && adminServers.length > 0) {
      const foundServer = adminServers.find((s) => s.id === id);
      setServer(foundServer || null);
    } else {
      setServer(null);
    }
  }, [id, adminServers, fetchAdminServers]);

  const navItems = useMemo(
    () => [
      { icon: FiChevronLeft, label: "Back to servers", link: "/dashboard" },
      {
        icon: FiSettings,
        label: "Settings",
        link: `/dashboard/${id}/settings`,
      },
      {
        icon: FiFileText,
        label: "Transcripts",
        link: `/dashboard/${id}/transcripts`,
      },
      {
        icon: MdViewKanban,
        label: "Ticket Panels",
        link: `/dashboard/${id}/ticket-panels`,
      },
      {
        icon: FiUsers,
        label: "Staff Members",
        link: `/dashboard/${id}/staff-members`,
      },
    ],
    [isLoading, id]
  );

  const SidebarContent = useMemo(
    () => (
      <Box
        w={{ base: "full", md: 72 }}
        bg={sidebarBg}
        borderRadius="lg"
        border="3px solid"
        borderColor={borderColor}
        p={4}
        maxW="340px"
        minW="250px"
        mx="auto"
      >
        <Flex align="center" mb={6} gap={4}>
          {server?.icon ? (
            <Image
              src={server.icon}
              alt={server.name + " icon"}
              borderRadius="full"
              boxSize="48px"
              objectFit="cover"
              border="3px solid"
              borderColor={borderColor}
              bg={sidebarBg}
              flexShrink={0}
            />
          ) : (
            <Box
              border="3px solid"
              borderColor={borderColor}
              borderRadius="full"
              boxSize="48px"
              display="flex"
              alignItems="center"
              justifyContent="center"
              bg={sidebarBg}
              flexShrink={0}
            >
              <Text fontWeight="bold" fontSize="md">
                {server?.name
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </Text>
            </Box>
          )}
          <Box minW={0} maxW="170px" flex={1}>
            <Text
              fontWeight="bold"
              fontSize="2xl"
              whiteSpace="normal"
              wordBreak="break-word"
              lineHeight={1.1}
            >
              {server?.name}
            </Text>
          </Box>
        </Flex>
        <Box fontSize="lg">
          {navItems.map((item, idx) => (
            <HStack
              as="button"
              _hover={{
                fontWeight: "bold",
                cursor: "pointer",
                bg: useColorModeValue("gray.200", "gray.600"),
              }}
              cursor="pointer"
              mb={idx !== navItems.length - 1 ? 4 : 0}
              px={2}
              py={2}
              borderRadius="md"
              transition="background 0.2s"
              width={"100%"}
            >
              <Link
                to={item.link}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  width: "100%",
                }}
              >
                <Box as={item.icon} />
                <Text>{item.label}</Text>
              </Link>
            </HStack>
          ))}
        </Box>
      </Box>
    ),
    [sidebarBg, borderColor, server]
  );

  if (adminServers.length === 0 && isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      {/* Mobile Hamburger */}
      <Box display={{ base: "block", md: "none" }} p={2}>
        <IconButton aria-label="Open menu" onClick={() => setMobileOpen(true)}>
          <FiMenu />
        </IconButton>
      </Box>
      {/* Sidebar always on the left for desktop */}
      <Flex direction="row" m={2}>
        <Box
          display={{ base: "none", md: "block" }}
          minW="260px"
          maxW="340px"
          position="sticky"
          top={0}
          left={0}
        >
          {SidebarContent}
        </Box>
        <Box flex="1">
          {/* Mobile Sidebar Overlay */}
          {mobileOpen && (
            <Box
              pos="fixed"
              top={0}
              left={0}
              w="100vw"
              h="100vh"
              bg="blackAlpha.600"
              zIndex={1000}
              onClick={() => setMobileOpen(false)}
            >
              <Box
                pos="absolute"
                top={0}
                left={0}
                h="100vh"
                maxW="80vw"
                w="300px"
                bg={sidebarBg}
                borderRadius="lg"
                border="3px solid"
                borderColor={borderColor}
                p={4}
                onClick={(e) => e.stopPropagation()}
              >
                <Flex justify="flex-end" mb={2}>
                  <IconButton
                    aria-label="Close menu"
                    size="sm"
                    onClick={() => setMobileOpen(false)}
                  >
                    <FiChevronLeft />
                  </IconButton>
                </Flex>
                {SidebarContent}
              </Box>
            </Box>
          )}
        </Box>
      </Flex>
    </>
  );
}
