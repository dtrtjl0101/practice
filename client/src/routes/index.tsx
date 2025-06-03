import { Box, Button, Container, Stack } from "@mui/material";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import GroupList from "../component/GroupList";
import BookList from "../component/BookList";
import EventCarousel from "../component/EventCarousel";
import Coachmark, { useCoachmark } from "../component/Coachmark";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const navigate = useNavigate();
  const { isOpen, closeCoachmark, completeCoachmark } = useCoachmark("home");

  return (
    <Container sx={{ my: 8 }}>
      <Stack spacing={8}>
        <Box className="coachmark-event-carousel">
          <EventCarousel />
        </Box>
        <Box className="coachmark-popular-groups">
          <GroupList
            size="small"
            action={
              <Button onClick={() => navigate({ to: "/groups" })}>
                더보기
              </Button>
            }
            title="인기 모임"
            key="popularGroups"
          />
        </Box>
        <Box className="coachmark-popular-books">
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
        </Box>
      </Stack>
      <Coachmark
        steps={[
          {
            target: ".coachmark-event-carousel",
            title: "환영합니다! 📚",
            content: "여기서 최신 독서 이벤트와 공지사항을 확인할 수 있습니다.",
            placement: "bottom",
          },
          {
            target: ".coachmark-popular-groups",
            title: "인기 모임 🏆",
            content:
              "다른 독서 애호가들과 함께 책을 읽고 토론할 수 있는 인기 모임들입니다. '더보기'를 클릭해서 더 많은 모임을 둘러보세요!",
            placement: "bottom",
          },
          {
            target: ".coachmark-popular-books",
            title: "인기 도서 📖",
            content:
              "지금 가장 인기 있는 책들을 확인하고, 새로운 읽을거리를 찾아보세요.",
            placement: "top",
          },
        ]}
        isOpen={isOpen}
        onClose={closeCoachmark}
        onComplete={completeCoachmark}
      />
    </Container>
  );
}
