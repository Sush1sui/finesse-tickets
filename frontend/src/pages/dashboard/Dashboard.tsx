import { Box, Text, Heading, Grid } from "@chakra-ui/react";
import { memo, useEffect } from "react";
import { useAuth, type AdminServer } from "../../context/AuthContext";
import DashboardCard from "../../components/custom/DashboardCard";
import LoadingSpinner from "../../components/custom/LoadingSpinner";
import CustomAlert from "../../components/custom/CustomAlert";

const Dashboard = () => {
  const {
    isAuthenticated,
    isLoading: authLoading,
    adminServers,
    fetchAdminServers,
    user,
  } = useAuth();

  useEffect(() => {
    fetchAdminServers();
  }, [fetchAdminServers]);

  if (authLoading) {
    return <LoadingSpinner message="Loading servers..." />;
  }

  if (!isAuthenticated || !user) {
    return (
      <CustomAlert message="Access Denied. Please log in to view your dashboard." />
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
          NO SERVER FOUND
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
        Select Servers
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
          <DashboardCard key={server.id} server={server} />
        ))}
      </Grid>
    </Box>
  );
};

export default memo(Dashboard);
