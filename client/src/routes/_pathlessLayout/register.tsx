import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Container,
  Divider,
  InputLabel,
  OutlinedInput,
  useTheme,
} from "@mui/material";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_pathlessLayout/register")({
  component: RouteComponent,
});

function RouteComponent() {
  const theme = useTheme();

  return (
    <Container maxWidth="sm" sx={{ mt: theme.spacing(4) }}>
      <Card>
        <CardHeader title="회원가입" />
        <CardContent
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: theme.spacing(2),
          }}
        >
          <InputLabel>ID</InputLabel>
          <OutlinedInput placeholder="ID" fullWidth />

          <Divider />

          <InputLabel>Password</InputLabel>
          <OutlinedInput placeholder="Password" fullWidth type="password" />
          <OutlinedInput
            placeholder="Confirm Password"
            fullWidth
            type="password"
          />

          <Divider />

          <Button fullWidth variant="contained">
            가입하기
          </Button>
          {/* TODO: Add more fields */}
        </CardContent>
      </Card>
    </Container>
  );
}
