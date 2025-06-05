import { Link as RouterLink, Outlet } from "react-router-dom";
import {
  Box,
  Flex,
  Text,
  Image,
  Button,
  Link as ChakraLink,
  Spinner, // Import Spinner
} from "@chakra-ui/react";
import logo from "../../assets/fns_logo.png";
import profileLogo from "../../assets/gg_profile.png";
import discord_icon from "../../assets/dc-icon.svg";
import { useAuth } from "../../context/AuthContext.tsx"; // Import useAuth
import { memo } from "react";

const Layout = () => {
  const { isAuthenticated, user, login, logout, isLoading } = useAuth(); // Use useAuth hook

  return (
    <Flex direction="column" minHeight="100vh">
      <Box
        as="header"
        bg="blue.800"
        color="white"
        py={[2, 3, 4]}
        px={[2, 4, 8]}
      >
        <Flex justify="space-between" align="center">
          <Flex align="center">
            <RouterLink
              to={"/"}
              style={{ display: "flex", alignItems: "center" }}
            >
              <Image
                src={logo}
                alt="App Logo"
                boxSize={["35px", "40px", "50px"]}
                mr={[2, 3]}
                borderRadius={50}
              />
              <Text fontSize={["md", "lg", "xl"]} fontWeight="bold">
                FINESSE TICKETS
              </Text>
            </RouterLink>
          </Flex>
          <Flex as="nav" align="center">
            {isLoading ? (
              <Spinner size="md" color="white" />
            ) : isAuthenticated && user ? (
              <>
                <Image
                  src={user.avatar ? user.avatar : profileLogo}
                  alt={user.username || "User"}
                  boxSize="40px"
                  borderRadius="full" // Circular image
                  border={"2px solid white"}
                  mr={3}
                  objectFit="cover" // Ensure the image covers the box size without distortion
                />
                <Text mr={3} fontSize={["sm", "md"]}>
                  {user.username}
                </Text>
                <Button
                  onClick={logout}
                  colorScheme="red"
                  size={["sm", "md"]}
                  fontSize={["xs", "sm", "md"]}
                >
                  Logout
                </Button>
              </>
            ) : (
              <Button
                onClick={login} // Call login function from AuthContext
                colorScheme="teal"
                size={["sm", "md"]}
                fontSize={["xs", "sm", "md"]}
              >
                Login with Discord
              </Button>
            )}
          </Flex>
        </Flex>
      </Box>

      <Box as="main" flex="1" p={[4, 6, 8]} display="flex" flexDirection="row">
        <Outlet />
      </Box>

      <Box
        as="footer"
        bg="gray.800"
        color="gray.200"
        py={2}
        px={[2, 4, 8]}
        textAlign="center"
        display={"flex"}
        alignItems={"center"}
        justifyContent={"center"}
      >
        <ChakraLink
          href={"https://discord.gg/dvUsZ9Gj2m"}
          target="_blank"
          rel="noopener noreferrer"
          boxSize="40px"
        >
          <Image
            src={discord_icon}
            alt="Discord Logo"
            boxSize={"100%"}
            filter="brightness(0) invert(1)" // Makes SVG white
          />
        </ChakraLink>
      </Box>
    </Flex>
  );
};

export default memo(Layout);
