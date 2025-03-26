import {
  Container,
  Card,
  CardContent,
  InputLabel,
  OutlinedInput,
  Divider,
  Button,
  useTheme,
} from "@mui/material";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_pathlessLayout/login")({
  component: RouteComponent,
});

function RouteComponent() {
  const theme = useTheme();

  return (
    <Container maxWidth="sm" sx={{ mt: theme.spacing(4) }}>
      <Card>
        <CardContent
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: theme.spacing(2),
          }}
        >
          <InputLabel>ID</InputLabel>
          <OutlinedInput placeholder="ID" fullWidth />
          <InputLabel>Password</InputLabel>
          <OutlinedInput placeholder="Password" fullWidth type="password" />
          <Divider />
          <Button fullWidth variant="contained">
            로그인
          </Button>
          {/* TODO: Add more fields */}
        </CardContent>
      </Card>
    </Container>
  );
}
