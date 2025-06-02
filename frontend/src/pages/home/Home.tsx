import { Box, Button, Heading, Text, VStack, Spinner } from "@chakra-ui/react";
import { useAuth } from "../../context/AuthContext.tsx";
import { memo } from "react";
import { Link } from "react-router-dom";

function Home() {
  const { isAuthenticated, user, login, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Box
        textAlign="center"
        display={"flex"}
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        flex={1}
      >
        <Spinner size="xl" />
      </Box>
    );
  }

  return (
    <Box
      textAlign="center"
      display={"flex"}
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      flex={1}
    >
      <VStack>
        {isAuthenticated && user ? (
          <>
            <Heading as="h1" size="2xl" mb={2}>
              Welcome back, {user.username}!
            </Heading>
            <Text fontSize="lg" color={"gray.600"} mt={2} mb={4}>
              You are logged in. You can now access your dashboard.
            </Text>
            <Button>
              <Link to={"/dashboard"}>View Dashboard</Link>
            </Button>
          </>
        ) : (
          <>
            <Heading as="h1" size="2xl" mb={2}>
              Welcome to FINESSE TICKETS!
            </Heading>
            <Text fontSize="lg" color={"gray.600"} mt={2} mb={4}>
              Your one-stop solution for managing and tracking event tickets.
              Please log in to continue.
            </Text>
            <Button onClick={login} colorScheme="teal" size="lg">
              Login with Discord
            </Button>
          </>
        )}
      </VStack>
    </Box>
  );
}

export default memo(Home);
