import { createFileRoute, useRouter } from "@tanstack/react-router";
import {
  Typography,
  Container,
  Button,
  Paper,
  Divider,
  Stack,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import API_CLIENT from "../../../../../../api/api";
import { Discussion } from "../../../../../../types/discussion";
import CommentSection from "../../../../../../component/CommentSection";
import { Comment } from "../../../../../../types/comment";

export const Route = createFileRoute(
  "/_pathlessLayout/groups/$groupId/discussions/$discussionId/"
)({
  component: RouteComponent,
});

function RouteComponent() {
  const router = useRouter();
  const { discussionId } = Route.useParams();
  const { data: discussion, isLoading } = useQuery({
    queryKey: ["discussion", discussionId],
    queryFn: async () => {
      const discussionIdNumber = parseInt(discussionId);
      if (isNaN(discussionIdNumber)) {
        alert("Invalid discussion ID");
        return;
      }
      const response =
        await API_CLIENT.discussionController.getDiscussion(discussionIdNumber);
      if (!response.isSuccessful) {
        alert(response.errorMessage);
        return;
      }
      return response.data as Discussion;
    },
  });

  if (!discussion) return <Typography>게시글을 찾을 수 없습니다.</Typography>;

  if (isLoading) return <Typography>게시글을 불러오는 중입니다...</Typography>;

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
            {discussion.modifiedAt == undefined
              ? discussion.createdAt
              : discussion.modifiedAt}
          </Typography>
        </Stack>

        <Divider sx={{ my: 2 }} />

        {/* 본문 */}
        <Typography
          variant="body1"
          sx={{ whiteSpace: "pre-line", minHeight: "200px" }}
        >
          {discussion.content}
        </Typography>

        <Divider sx={{ my: 3 }} />

        {/* 버튼 영역 */}
        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button
            variant="contained"
            color="primary"
            onClick={() =>
              router.navigate({
                to: `/discussions/${discussion.discussionId}/edit`,
              })
            }
          >
            수정
          </Button>
          <Button
            variant="outlined"
            onClick={() =>
              router.navigate({
                to: `/_pathlessLayout/groups/${groupId}/activities/${activityId}/discussions`,
              })
            }
          >
            뒤로 가기
          </Button>
          <Button
            variant="text"
            color="error"
            size="small"
            sx={{ justifySelf: "flex-end" }}
            onClick={() => onDeletePost(post.id)}
          >
            삭제
          </Button>
        </Stack>
      </Paper>
      <CommentSection
        isDebate={post?.isDebate}
        comments={comments}
        onAddComment={handleAddComment}
        onDeleteComment={handleDeleteComment}
        onEditComment={handleEditComment}
      />
    </Container>
  );
}
