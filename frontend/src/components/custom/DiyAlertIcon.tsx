import { Text } from "@chakra-ui/react";

export default function DiyAlertIcon({ status }: { status: "error" | "info" }) {
  return <Text mr={2}>{status === "error" ? "❗" : "ℹ️"}</Text>;
}
