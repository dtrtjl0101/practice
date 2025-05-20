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
  DialogActions,
  Popover,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import API_CLIENT from "../../../../../../../../api/api";
import { Discussion } from "../../../../../../../../types/discussion";
import CommentSection from "../../../../../../../../component/CommentSection";
import { Comment } from "../../../../../../../../types/comment";
import { Fragment, useState } from "react";
import HighlightCard from "../../../../../../../../component/HighlightCard";
import { Highlight } from "../../../../../../../../types/highlight";

export const Route = createFileRoute(
  "/_pathlessLayout/groups/$groupId/activities/$activityId/discussions/$discussionId/"
)({
  component: RouteComponent,
});

function RouteComponent() {
  const router = useRouter();
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

  const handleHighlightClick = (id: number) => {
    setSelectedHighlight(id);
  };

  function handleCloseModal(): void {
    setSelectedHighlight(null);
  }

  const [popoverAnchor, setPopoverAnchor] = useState<HTMLElement | null>(null);
  const [hoveredHighlightId, setHoveredHighlightId] = useState<number | null>(
    null
  );
  const [closeTimer, setCloseTimer] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);

  const handlePopoverOpen = (
    event: React.MouseEvent<HTMLElement>,
    highlightId: number
  ) => {
    if (closeTimer) {
      clearTimeout(closeTimer);
      setCloseTimer(null);
    }
    setPopoverAnchor(event.currentTarget);
    setHoveredHighlightId(highlightId);
  };

  const handlePopoverClose = () => {
    const timer = setTimeout(() => {
      setPopoverAnchor(null);
      setHoveredHighlightId(null);
    }, 2000); // 200ms 지연 후 닫힘
    setCloseTimer(timer);
  };

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
            handleHighlightClick,
            handlePopoverOpen,
            handlePopoverClose
          )}
        </Typography>
        {selectedHighlight && (
          <HighlightModal
            open={true}
            onClose={() => handleCloseModal()}
            highlightId={selectedHighlight}
            activityId={discussion.activityId}
            refetchHighlights={() => {}}
          />
        )}
        <Popover
          open={Boolean(popoverAnchor)}
          // open={false}
          anchorEl={popoverAnchor}
          onClick={() => {
            alert("click");
          }}
          onClose={() => {
            setPopoverAnchor(null);
            setHoveredHighlightId(null);
          }}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "left",
          }}
          PaperProps={{
            onMouseEnter: () => {
              if (closeTimer) {
                clearTimeout(closeTimer);
                setCloseTimer(null);
              }
            },
            onMouseLeave: () => {
              const timer = setTimeout(() => {
                setPopoverAnchor(null);
                setHoveredHighlightId(null);
              }, 500); // 0.5초 후 닫기
              setCloseTimer(timer);
            },
          }}
        >
          <Box sx={{ p: 2, maxWidth: 300 }}>
            {hoveredHighlightId ? (
              <Typography variant="body2">
                하이라이트 #{hoveredHighlightId}
              </Typography>
            ) : (
              <Typography variant="body2">불러오는 중...</Typography>
            )}
          </Box>
        </Popover>
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
  onClick: (id: number) => void,
  onHover: (e: React.MouseEvent<HTMLElement>, id: number) => void,
  onLeave: () => void
): React.ReactNode[] {
  const parts = content.split(/(#\w[\w-]*)/g); // '#'로 시작하는 단어 추출

  return parts.map((part, index) => {
    const match = part.match(/^#(\w[\w-]*)$/);
    if (match) {
      const id = match[1];
      return (
        <Typography
          key={index}
          component="span"
          color="primary"
          onClick={() => onClick(parseInt(id))}
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

function HighlightModal({
  open,
  onClose,
  highlightId,
  activityId: _activityId,
  refetchHighlights,
}: {
  open: boolean;
  onClose: () => void;
  highlightId: number;
  activityId?: number;
  refetchHighlights: () => void;
}) {
  const { data: highlight } = useQuery({
    queryKey: ["highlight", highlightId],
    queryFn: async () => {
      const response =
        await API_CLIENT.highlightController.getHighlight(highlightId);
      if (!response.isSuccessful) {
        throw new Error(response.errorMessage);
      }
      return response.data as Highlight;
    },
  });

  if (!highlight) return null;

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{highlight.highlightContent}</DialogTitle>
      <DialogContent>
        <HighlightCard
          highlight={highlight!!}
          refetchHighlights={refetchHighlights}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>닫기</Button>
      </DialogActions>
    </Dialog>
  );
}
