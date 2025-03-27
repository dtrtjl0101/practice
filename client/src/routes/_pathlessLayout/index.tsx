import { Button, Container, Stack } from "@mui/material";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import GroupList from "../../component/groupList";

export const Route = createFileRoute("/_pathlessLayout/")({
  component: Home,
});

function Home() {
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Stack spacing={2}>
        <GroupList
          size="small"
          action={
            <Button onClick={() => navigate({ to: "/groups" })}>더보기</Button>
          }
        />
        <Button
          variant="contained"
          color="primary"
          component={Link}
          to="/about"
        >
          Go to About Page
        </Button>
        <Button
          variant="contained"
          color="primary"
          component={Link}
          to="/pages/postlist"
        >
          Go to Post List Page
        </Button>
      </Stack>
    </Container>
  );
}
