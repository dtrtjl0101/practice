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
  Popper,
  Avatar,
  Chip,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import API_CLIENT from "../../../../../../../api/api";
import { Discussion } from "../../../../../../../types/discussion";
import CommentSection from "../../../../../../../component/CommentSection";
import { Comment } from "../../../../../../../types/comment";
import { Fragment, useMemo, useRef, useState } from "react";
import MessageIcon from "@mui/icons-material/Message";
import StickyNote2OutlinedIcon from "@mui/icons-material/StickyNote2Outlined";
import { HighlightSummary } from "../../../../../../../types/highlight";
import HighlightSummaryCard from "../../../../../../../component/HighlightSumarryCard";
import { useAtomValue } from "jotai";
import { AuthState } from "../../../../../../../states/auth";

export const Route = createFileRoute(
  "/groups/$groupId/activities/$activityId/discussions/$discussionId/"
)({
  component: RouteComponent,
});

function RouteComponent() {
  const user = useAtomValue(AuthState.user);
  const router = useRouter();
  const navigate = Route.useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const commentSectionRef = useRef<HTMLDivElement>(null);
  const { groupId, activityId, discussionId } = Route.useParams();

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

  // 하이라이트 데이터가 배열인지 확인하고 적절히 처리
  const highlights: HighlightSummary[] = Array.isArray(
    discussion?.linkedHighlights
  )
    ? (discussion?.linkedHighlights as unknown as HighlightSummary[])
    : [];

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
          enqueueSnackbar("게시글이 삭제되었습니다.", { variant: "success" });
          handleBack();
        } else {
          enqueueSnackbar(response.errorMessage, { variant: "error" });
        }
      });
  };

  const handleBack = () => {
    router.navigate({ to: ".." });
  };

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [popperOpen, setPopperOpen] = useState(false);

  const handleHighlightClick = (highlight: HighlightSummary) => {
    if (highlight) {
      navigate({
        to: "/reader/$bookId",
        params: {
          bookId: highlight.bookId,
        },
        search: {
          groupId: parseInt(groupId),
          activityId: parseInt(activityId),
          temporalProgress: true,
          location: highlight.cfi,
        },
      });
    }
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

  const hoveredHighlight = useMemo(
    () => highlights.find((h) => h.id === hoveredId),
    [highlights, hoveredId]
  );

  if (isLoading)
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );

  if (!discussion) return <Typography>게시글을 찾을 수 없습니다.</Typography>;

  return (
    <Container maxWidth="md" sx={{ mt: 5 }}>
      <Paper variant="outlined" sx={{ p: 4 }}>
        {/* 헤더 영역 */}
        <Stack direction="column" spacing={2} sx={{ mb: 3 }}>
          {/* 제목 */}
          <Typography variant="h4" fontWeight="bold">
            {discussion.title}
          </Typography>

          {/* 작성자 정보 및 메타데이터 */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              justifyContent: "space-between",
              alignItems: { xs: "flex-start", sm: "center" },
              width: "100%",
              gap: 2,
              mt: 1,
            }}
          >
            {/* 작성자 아바타 및 정보 */}
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar
                src={discussion.authorProfileImage}
                alt={discussion.authorName}
                sx={{ width: 48, height: 48 }}
              />
              <Stack>
                <Typography variant="subtitle1" fontWeight="medium">
                  {discussion.authorName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {new Date(
                    discussion.modifiedAt ?? discussion.createdAt
                  ).toLocaleString()}
                </Typography>
              </Stack>
            </Stack>

            {/* 우측 메타데이터 */}
            <Stack spacing={1} alignItems="center">
              <Chip
                icon={<MessageIcon fontSize="small" />}
                label={discussion.commentCount}
                size="small"
                color="default"
                variant="outlined"
                onClick={() => {
                  commentSectionRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  });
                }}
              />
              {discussion.isDebate && (
                <Chip
                  label="토론"
                  color="success"
                  size="small"
                  variant="outlined"
                />
              )}
            </Stack>
          </Box>
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
          open={popperOpen && !!hoveredHighlight}
          anchorEl={anchorEl}
          placement="bottom-start"
          disablePortal
          onMouseEnter={() => setPopperOpen(true)}
          onMouseLeave={handleMouseLeave}
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
              <HighlightSummaryCard highlightSummary={hoveredHighlight} />
            ) : (
              <Typography>불러오는 중...</Typography>
            )}
          </Box>
        </Popper>
        <Divider sx={{ my: 3 }} />
        {/* 버튼 영역 */}
        <Stack direction="row" spacing={2} justifyContent="flex-end">
          {user?.memberId === discussion.authorId && (
            <>
              <Button
                variant="outlined"
                color="primary"
                size="small"
                onClick={handleEditDiscussion}
              >
                수정
              </Button>
              <Button
                variant="outlined"
                color="error"
                size="small"
                onClick={handleDeletePost}
              >
                삭제
              </Button>
            </>
          )}
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={handleBack}
          >
            목록
          </Button>
        </Stack>
      </Paper>
      <Box ref={commentSectionRef}>
        <CommentSection
          discussionId={parseInt(discussionId)}
          isDebate={discussion.isDebate}
          comments={discussion.comments as unknown as Comment[]}
          onRefresh={refetchDiscussion}
        />
      </Box>
    </Container>
  );
}

function parseContentWithHighlights(
  content: string,
  highlights: HighlightSummary[],
  onClick: (highlight: HighlightSummary) => void,
  onHover: (e: React.MouseEvent<HTMLElement>, id: number) => void,
  onLeave: () => void
): React.ReactNode[] {
  if (!content) return [];

  const parts = content.split(/(#\w[\w-]*)/g);

  return parts.map((part, index) => {
    const match = part.match(/^#(\w[\w-]*)$/);
    if (match) {
      const id = parseInt(match[1]);
      const highlight = highlights.find((h) => h.id === id);

      if (!highlight) {
        return <Fragment key={index}>{part}</Fragment>;
      }

      return (
        <Chip
          key={index}
          icon={<StickyNote2OutlinedIcon fontSize="small" />}
          label={"메모"}
          size="small"
          color="primary"
          onClick={() => onClick(highlight)}
          onMouseEnter={(e) => onHover(e, id)}
          onMouseLeave={onLeave}
          sx={{
            cursor: "pointer",
          }}
        />
      );
    } else {
      return <Fragment key={index}>{part}</Fragment>;
    }
  });
}
