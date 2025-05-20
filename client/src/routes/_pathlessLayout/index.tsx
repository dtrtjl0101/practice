import { Button, Container, Stack } from "@mui/material";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import GroupList from "../../component/groupList";
import LinkButton from "../../component/LinkButton";
import BookList from "../../component/BookList";

export const Route = createFileRoute("/_pathlessLayout/")({
  component: Home,
});

function Home() {
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Stack spacing={4}>
        <GroupList
          size="small"
          action={
            <Button onClick={() => navigate({ to: "/groups" })}>더보기</Button>
          }
          title="인기 그룹"
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
