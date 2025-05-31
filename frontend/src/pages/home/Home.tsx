import { Box, Button, Heading, Text, VStack } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { BACKEND_URL } from "../../App";

export default function Home() {
  return (
    <Box
      textAlign="center"
      display={"flex"}
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      flex={1} // Added to make this Box take available vertical space
    >
      <VStack>
        <Heading as="h1" size="2xl" mb={4}>
          Welcome to FINESSE TICKETS!
        </Heading>
        <Text fontSize="lg" color={"gray.500"} mb={8}>
          Your one-stop solution for managing and tracking event tickets. Please
          log in to continue.
        </Text>
        <RouterLink to={`${BACKEND_URL}/auth/discord`}>
          <Button colorScheme="teal" size="lg">
            Login with Discord
          </Button>
        </RouterLink>
      </VStack>
    </Box>
  );
}
