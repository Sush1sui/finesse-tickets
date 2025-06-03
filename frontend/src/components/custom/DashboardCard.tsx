import type { AdminServer } from "../../context/AuthContext";
import {
  Badge,
  Box,
  GridItem,
  Heading,
  HStack,
  VStack,
  Image,
  Text,
} from "@chakra-ui/react";
import { useColorModeValue } from "../ui/color-mode";
import { memo } from "react";
import { Link } from "react-router-dom";

function DashboardCard({ server }: { server: AdminServer }) {
  const cardBg = useColorModeValue("white", "gray.700");
  const cardHoverBg = useColorModeValue("gray.50", "gray.600");

  return (
    <Link to={`/dashboard/${server.id}`}>
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
            <Text
              fontSize="xs"
              color="gray.500"
              style={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: "100%",
              }}
            >
              ID: {server.id}
            </Text>
            {(() => {
              let statusBadge = null;
              if (server.owner) {
                statusBadge = <Badge colorScheme="green">Owner</Badge>;
              } else if (server.isAdmin) {
                statusBadge = <Badge colorScheme="purple">Administrator</Badge>;
              }
              return statusBadge;
            })()}
          </VStack>
        </HStack>
      </GridItem>
    </Link>
  );
}

export default memo(DashboardCard);
