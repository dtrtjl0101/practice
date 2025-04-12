import { Container, Stack, Typography } from "@mui/material";
import { createFileRoute } from "@tanstack/react-router";
import GroupList from "../../component/groupList";

export const Route = createFileRoute("/_pathlessLayout/")({
  component: Home,
});

function Home() {
  return (
    <Container maxWidth="lg">
      <Stack spacing={2} sx={{ padding: 2 }}>
        <GroupList />
      </Stack>
    </Container>
  );
}
