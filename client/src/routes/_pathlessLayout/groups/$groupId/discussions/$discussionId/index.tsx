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
  component: PostID,
});

function PostID() {
  const navigate = useNavigate();
  const { discussionId } = Route.useParams();
  const post = initialPosts.find((p) => p.id === Number(discussionId));

  if (!post) return <Typography>게시글을 찾을 수 없습니다.</Typography>;

  const [comments, setComments] = useState<Comment[]>([
    {
      id: 1,
      author: "사용자1",
      content: "좋은 글이네요!",
      createdDate: new Date(),
      stance: "agree",
    },
  ]);
  const handleAddComment = (
    content: string,
    stance?: "agree" | "disagree",
    parentId?: number
  ) => {
    setComments((prev) => [
      ...prev,
      {
        id: Date.now(), // 임시 id
        author: "익명", // 또는 로그인 사용자 이름
        content: content,
        createdDate: new Date(),
        stance,
        parentId,
      },
    ]);
  };

  const handleDeleteComment = (id: number) => {
    alert("정말 삭제하시겠습니까?");
    setComments((prev) => prev.filter((comment) => comment.id !== id));
  };

  const handleEditComment = (id: number, newContent: string) => {
    setComments((prev) =>
      prev.map((comment) =>
        comment.id === id
          ? {
              ...comment,
              content: newContent,
              updatedDate: new Date(),
              edited: true,
            }
          : comment
      )
    );
  };

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
