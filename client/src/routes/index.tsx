import { Button, Container, Stack } from "@mui/material";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import GroupList from "../component/GroupList";
import BookList from "../component/BookList";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const navigate = useNavigate();

  return (
    <Container sx={{ my: 8 }}>
      <Stack spacing={8}>
        <GroupList
          size="small"
          action={
            <Button onClick={() => navigate({ to: "/groups" })}>더보기</Button>
          }
          title="인기 모임"
          key="popularGroups"
        />
        <BookList
          size="small"
          title="인기 도서"
          action={
            <Button
              variant="text"
              onClick={() =>
                navigate({ to: "/books", search: { title: undefined } })
              }
            >
              더보기
            </Button>
          }
        />
      </Stack>
    </Container>
  );
}
