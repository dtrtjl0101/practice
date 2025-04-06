import { Container, Paper, Typography } from "@mui/material";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_pathlessLayout/groups/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <Container sx={{ mt: 4 }}>
      <Paper sx={{ p: 2 }}>
        <Typography>여기에 모임들 표시</Typography>
      </Paper>
    </Container>
  );
}
