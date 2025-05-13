import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Typography,
  Container,
  Button,
  Paper,
  Divider,
  Stack,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import API_CLIENT, { wrapApiResponse } from "../../../../../../api/api";
import { Discussion } from "../../../../../../types/discussion";
import { useState } from "react";
import CommentSection from "../../../../../../component/CommentSection";
import { Comment } from "../../../../../../types/comment";

export const Route = createFileRoute(
  "/_pathlessLayout/groups/$groupId/discussions/$discussionId/"
)({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const { discussionId } = Route.useParams();
  const { data: discussion } = useQuery({
    queryKey: ["discussion", discussionId],
    queryFn: async () => {
      const discussionIdNumber = parseInt(discussionId);
      if (isNaN(discussionIdNumber)) {
        throw new Error("Invalid discussion ID");
      }
      const response = await wrapApiResponse(
        API_CLIENT.discussionController.getDiscussion(discussionIdNumber)
      );
      if (!response.isSuccessful) {
        throw new Error(response.errorMessage);
      }

      return response.data as Discussion;
    },
  });

  if (!post) return <Typography>게시글을 찾을 수 없습니다.</Typography>;

  const [discussions, setDiscussions] = useState<Discussion[]>(initialPosts);

  const onDeletePost = (id: number) => {
    const updatedPosts = posts.filter((post) => post.id !== id);
    setPosts(updatedPosts);
    initialPosts.length = 0;
    initialPosts.push(...updatedPosts);
    navigate({ to: "/posts" });
  };

  return (
    <Container maxWidth="md" sx={{ mt: 5 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        {/* 제목 */}
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          {post.title}
        </Typography>

        {/* 작성자 및 작성일 */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 2 }}
        >
          <Typography variant="subtitle2" color="text.secondary">
            작성자: {post.author}
          </Typography>
          <Typography variant="subtitle2" color="text.secondary">
            {post.isDebate ? "토론" : ""}
          </Typography>
          <Typography variant="subtitle2" color="text.secondary">
            작성일: {new Date(post.createdDate).toLocaleDateString()}
          </Typography>
        </Stack>

        <Divider sx={{ my: 2 }} />

        {/* 본문 */}
        <Typography
          variant="body1"
          sx={{ whiteSpace: "pre-line", minHeight: "200px" }}
        >
          {post.content}
        </Typography>

        <Divider sx={{ my: 3 }} />

        {/* 버튼 영역 */}
        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate({ to: `/posts/${post.id}/edit` })}
          >
            수정
          </Button>
          <Button variant="outlined" onClick={() => navigate({ to: "/posts" })}>
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
