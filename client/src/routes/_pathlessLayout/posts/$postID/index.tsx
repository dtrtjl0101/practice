import {
  createFileRoute,
  useParams,
  Link,
  useNavigate,
} from "@tanstack/react-router";
import { Typography, Container, Button } from "@mui/material";
import { initialPosts } from "../../../../types/post";
import { useState } from "react";

export const Route = createFileRoute("/_pathlessLayout/posts/$postID/")({
  component: PostID,
});

function PostID() {
  const { postID } = Route.useParams();
  const navigate = useNavigate();
  const post = initialPosts.find((p) => p.id === Number(postID));

  if (!post) return <Typography>게시글을 찾을 수 없습니다.</Typography>;

  return (
    <div>
      <Container>
        <Typography variant="h4" gutterBottom>
          {post.title}
        </Typography>
        <Typography>{post.content}</Typography>
        <Button
          variant="contained"
          onClick={() => navigate({ to: `/posts/${post.id}/edit` })}
          sx={{ mt: 2 }}
        >
          edit
        </Button>
        <Button
          variant="contained"
          onClick={() => navigate({ to: "/posts" })}
          sx={{ mt: 2 }}
        >
          뒤로 가기
        </Button>
      </Container>
    </div>
  );
}
