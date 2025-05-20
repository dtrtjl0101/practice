import { createFileRoute, useRouter } from "@tanstack/react-router";
import {
  Typography,
  Container,
  Button,
  Paper,
  Divider,
  Stack,
  CircularProgress,
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  Popper,
} from "@mui/material";
import { useQueries, useQuery } from "@tanstack/react-query";
import API_CLIENT from "../../../../../../../../api/api";
import { Discussion } from "../../../../../../../../types/discussion";
import CommentSection from "../../../../../../../../component/CommentSection";
import { Comment } from "../../../../../../../../types/comment";
import { Fragment, useMemo, useState } from "react";
import HighlightCard from "../../../../../../../../component/HighlightCard";
import { Highlight } from "../../../../../../../../types/highlight";

export const Route = createFileRoute(
  "/_pathlessLayout/groups/$groupId/activities/$activityId/discussions/$discussionId/"
)({
  component: RouteComponent,
});

function RouteComponent() {
  const router = useRouter();
  const navigate = Route.useNavigate();
  const { discussionId } = Route.useParams();

  const {
    data: discussion,
    isLoading,
    refetch: refetchDiscussion,
  } = useQuery({
    queryKey: ["discussion", discussionId],
    queryFn: async () => {
      const response = await API_CLIENT.discussionController.getDiscussion(
        parseInt(discussionId)
      );
      if (!response.isSuccessful) {
        throw new Error(response.errorMessage);
      }
      return response.data as Discussion;
    },
  });

  const highlightQueries = useQueries({
    queries: Array.isArray(discussion?.highlightIds)
      ? discussion.highlightIds.map((highlightId) => ({
          queryKey: ["highlight", highlightId],
          queryFn: async () => {
            const response =
              await API_CLIENT.highlightController.getHighlight(highlightId);
            if (!response.isSuccessful) {
              throw new Error(response.errorMessage);
            }
            return response.data as Highlight;
          },
          enabled: !!discussion,
        }))
      : [],
  });

  const highlights = highlightQueries
    .filter((q) => q.data)
    .map((q) => q.data as Highlight);

  const handleEditDiscussion = () => {
    router.navigate({
      from: Route.to,
      to: "edit",
    });
  };

  const handleDeletePost = () => {
    API_CLIENT.discussionController
      .deleteDiscussion(parseInt(discussionId))
      .then((response) => {
        if (response.isSuccessful) {
          alert("게시글이 삭제되었습니다.");
          handleBack();
        } else {
          alert(response.errorMessage);
        }
      });
  };

  const handleBack = () => {
    router.navigate({ to: ".." });
  };

  const [selectedHighlight, setSelectedHighlight] = useState<number | null>(
    null
  );

  const handleHighlightClick = (highlight: Highlight) => {
    navigate({
      from: Route.to,
      to: "../../../../../../books/$bookId",
      params: {
        bookId: highlight.bookId,
      },
    });
  };

  function handleCloseModal(): void {
    setSelectedHighlight(null);
  }

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [popperOpen, setPopperOpen] = useState(false);

  const handleClickPopper = (
    event: React.MouseEvent<HTMLElement>,
    highlight: Highlight
  ) => {
    handleHighlightClick(highlight);

    setAnchorEl(event.currentTarget);
    setHoveredId(highlight.id);
    setPopperOpen((prev) => !prev);
  };

  const handleMouseEnter = (
    event: React.MouseEvent<HTMLElement>,
    id: number
  ) => {
    setAnchorEl(event.currentTarget);
    setHoveredId(id);
    setPopperOpen(true);
  };

  const handleMouseLeave = () => {
    setPopperOpen(false);
    setHoveredId(null);
  };

  const hoveredHighlight = highlights.find((h) => h.id === hoveredId);

  if (isLoading)
    return (
      <Box
        sx={{
          display: "flex", // " display" 대신 "display"로 수정
          justifyContent: "center",
          alignItems: "center", // 수직 중앙 정렬 추가
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );

  if (!discussion) return <Typography>게시글을 찾을 수 없습니다.</Typography>;

  return (
    <Container maxWidth="md" sx={{ mt: 5 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        {/* 제목 */}
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          {discussion.title}
        </Typography>
        {/* 작성자 및 작성일 */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 2 }}
        >
          <Typography variant="subtitle2" color="text.secondary">
            작성자: {discussion.authorName}
          </Typography>
          <Typography variant="subtitle2" color="text.secondary">
            {discussion.isDebate ? "토론" : ""}
          </Typography>
          <Typography variant="subtitle2" color="text.secondary">
            작성일:{" "}
            {new Date(
              discussion.modifiedAt == undefined
                ? discussion.createdAt
                : discussion.modifiedAt
            ).toLocaleString()}
          </Typography>
        </Stack>
        <Divider sx={{ my: 2 }} />
        {/* 본문 */}
        <Typography
          variant="body1"
          sx={{ whiteSpace: "pre-line", minHeight: "200px" }}
        >
          {parseContentWithHighlights(
            discussion.content,
            highlights,
            handleHighlightClick,
            handleMouseEnter,
            handleMouseLeave
          )}
        </Typography>
        <Popper
          open={popperOpen}
          anchorEl={anchorEl}
          placement="bottom-start"
          disablePortal
          onMouseEnter={() => setPopperOpen(true)} // Popper 위에 마우스 올라가도 유지
          onMouseLeave={handleMouseLeave} // Popper 밖으로 나가면 닫기
          style={{ zIndex: 1300 }}
        >
          <Box
            sx={{
              bgcolor: "background.paper",
              boxShadow: 3,
              borderRadius: 2,
              maxWidth: 400,
            }}
          >
            {hoveredHighlight ? (
              <HighlightCard
                highlight={hoveredHighlight}
                refetchHighlights={() => {}}
              />
            ) : (
              <Typography>불러오는 중...</Typography>
            )}
          </Box>
        </Popper>
        <Divider sx={{ my: 3 }} />
        {/* 버튼 영역 */}
        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button
            variant="contained"
            color="primary"
            onClick={handleEditDiscussion}
          >
            수정
          </Button>
          <Button variant="outlined" onClick={handleBack}>
            목록
          </Button>
          <Button
            variant="text"
            color="error"
            size="small"
            sx={{ justifySelf: "flex-end" }}
            onClick={handleDeletePost}
          >
            삭제
          </Button>
        </Stack>
      </Paper>
      <CommentSection
        discussionId={parseInt(discussionId)}
        isDebate={discussion.isDebate}
        comments={discussion.comments as unknown as Comment[]}
        onRefresh={refetchDiscussion}
      />
    </Container>
  );
}

function parseContentWithHighlights(
  content: string,
  highlights: Highlight[],
  onClick: (highlight: Highlight) => void,
  onHover: (e: React.MouseEvent<HTMLElement>, id: number) => void,
  onLeave: () => void
): React.ReactNode[] {
  const parts = content.split(/(#\w[\w-]*)/g); // '#'로 시작하는 단어 추출

  return parts.map((part, index) => {
    const match = part.match(/^#(\w[\w-]*)$/);
    if (match) {
      const id = match[1];
      const highlight = highlights.find((h) => h.id === parseInt(id));
      console.log(highlights);

      return (
        <Typography
          key={index}
          component="span"
          color="primary"
          onClick={() => onClick(highlight!)}
          onMouseEnter={(e) => onHover(e, parseInt(id))}
          onMouseLeave={onLeave}
          sx={{ cursor: "pointer", textDecoration: "underline" }}
        >
          메모{id}
        </Typography>
      );
    } else {
      return <Fragment key={index}>{part}</Fragment>;
    }
  });
}
