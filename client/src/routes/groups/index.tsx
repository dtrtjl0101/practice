import { Container, Stack } from "@mui/material";
import { createFileRoute } from "@tanstack/react-router";
import GroupList from "../../component/GroupList";

export const Route = createFileRoute("/groups/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <Container sx={{ my: 8 }}>
      <Stack spacing={2}>
        <GroupList size="large" key="allGroups" title="모든 모임" />
      </Stack>
    </Container>
  );
}
