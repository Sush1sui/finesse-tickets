import { Link, Outlet } from "react-router-dom"; // Removed unused RouterLink alias
import {
  Box,
  Flex,
  Text,
  Image,
  Button,
  Link as ChakraLink,
} from "@chakra-ui/react";
import logo from "../../assets/fns_logo.png";
import { BACKEND_URL } from "../../App.tsx";
import discord_icon from "../../assets/dc-icon.svg";

const Layout = () => {
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
            <Link to={"/"} style={{ display: "flex", alignItems: "center" }}>
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
            </Link>
          </Flex>
          <Flex as="nav">
            <Button
              mr={[1, 2, 4]}
              colorScheme="teal"
              size={["sm", "md"]}
              fontSize={["xs", "sm", "md"]}
            >
              <Link to={`${BACKEND_URL}/auth/discord`}>Login with Discord</Link>
            </Button>
          </Flex>
        </Flex>
      </Box>

      <Box
        as="main"
        flex="1"
        p={[4, 6, 8]}
        display="flex"
        flexDirection="column"
      >
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

export default Layout;
