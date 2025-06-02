import {
  Box,
  Text,
  Heading,
  Spinner,
  Grid,
  GridItem,
  Image,
  HStack,
  VStack,
  Badge,
} from "@chakra-ui/react";
import { useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useColorModeValue } from "../../components/ui/color-mode"; // Import custom hook

// Interface for AdminServer, ensure it matches data structure
interface AdminServer {
  id: string;
  name: string;
  icon: string | null;
  owner: boolean;
  isAdmin: boolean;
}

// DIY Alert Component
const DiyAlert = ({
  status,
  children,
}: {
  status: string;
  children: React.ReactNode;
}) => {
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
};

// DIY Alert Icon (simple emoji for now)
const DiyAlertIcon = ({ status }: { status: string }) => {
  return <Text mr={2}>{status === "error" ? "❗" : "ℹ️"}</Text>;
};

const Dashboard = () => {
  const {
    isAuthenticated,
    isLoading: authLoading,
    adminServers,
    fetchAdminServers,
    user,
  } = useAuth();

  // useColorModeValue should be available directly from @chakra-ui/react
  const cardBg = useColorModeValue("white", "gray.700");
  const cardHoverBg = useColorModeValue("gray.50", "gray.600");

  useEffect(() => {
    if (isAuthenticated) {
      fetchAdminServers();
    }
  }, [isAuthenticated, fetchAdminServers]);

  if (authLoading) {
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
        <Text mt={4}>Loading authentication...</Text>
      </Box>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <Box textAlign="center" mt={10}>
        <DiyAlert status="error">
          <DiyAlertIcon status="error" />
          Access Denied. Please log in to view your dashboard.
        </DiyAlert>
      </Box>
    );
  }

  if (adminServers.length === 0) {
    return (
      <Box p={{ base: 4, md: 8 }} flex={1}>
        <Heading
          as="h2"
          size="xl"
          mb={6}
          textAlign={{ base: "center", md: "left" }}
        >
          Dashboard
        </Heading>
        <Text fontSize="lg" textAlign={{ base: "center", md: "left" }}>
          No servers found where you are an administrator or the owner.
        </Text>
      </Box>
    );
  }

  return (
    <Box p={{ base: 4, md: 8 }} flex={1}>
      <Heading
        as="h2"
        size="xl"
        mb={8}
        textAlign={{ base: "center", md: "left" }}
      >
        Dashboard
      </Heading>
      <Grid
        templateColumns={{
          base: "1fr",
          sm: "repeat(2, 1fr)",
          md: "repeat(3, 1fr)",
          lg: "repeat(4, 1fr)",
        }}
        gap={6}
      >
        {adminServers.map((server: AdminServer) => (
          <GridItem
            key={server.id}
            p={5}
            shadow="md"
            borderWidth="1px"
            borderRadius="lg"
            bg={cardBg}
            _hover={{ shadow: "lg", bg: cardHoverBg }}
            transition="all 0.2s ease-out"
          >
            <HStack gap={4} align="center">
              {server.icon ? (
                <Image
                  borderRadius="full"
                  boxSize="60px"
                  src={server.icon}
                  alt={`${server.name} icon`}
                />
              ) : (
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  borderRadius="full"
                  boxSize="60px"
                  bg={useColorModeValue("gray.200", "gray.600")}
                  color={useColorModeValue("gray.600", "gray.200")}
                >
                  <Text fontSize="2xl" fontWeight="bold">
                    {server.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </Text>
                </Box>
              )}
              <VStack align="start" gap={1} flex={1} minWidth={0}>
                <Heading
                  size="sm"
                  title={server.name}
                  // DIY noOfLines using CSS
                  style={{
                    display: "-webkit-box",
                    WebkitLineClamp: 1,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {server.name}
                </Heading>
                <Text fontSize="xs" color="gray.500">
                  ID: {server.id}
                </Text>
                {(() => {
                  let statusBadge = null;
                  if (server.owner) {
                    statusBadge = <Badge colorScheme="green">Owner</Badge>;
                  } else if (server.isAdmin) {
                    statusBadge = (
                      <Badge colorScheme="purple">Administrator</Badge>
                    );
                  }
                  return statusBadge;
                })()}
              </VStack>
            </HStack>
          </GridItem>
        ))}
      </Grid>
    </Box>
  );
};

export default Dashboard;
