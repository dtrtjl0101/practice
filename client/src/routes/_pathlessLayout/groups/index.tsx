import { Container, Stack } from "@mui/material";
import { createFileRoute } from "@tanstack/react-router";
import GroupList from "../../../component/groupList";

export const Route = createFileRoute("/_pathlessLayout/groups/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Stack spacing={2}>
        <GroupList size="large" />
      </Stack>
    </Container>
  );
}
