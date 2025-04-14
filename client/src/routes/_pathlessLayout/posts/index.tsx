import { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Container,
  Paper,
  Stack,
} from "@mui/material";
import DeleteButton from "../../../component/deleteButton"; // 삭제 버튼 컴포넌트 import
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Post, formattedDate, initialPosts } from "../../../types/post";

export const Route = createFileRoute("/_pathlessLayout/posts/")({
  component: List,
});

function List() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>(initialPosts);

  const handleDelete = (id: number) => {
    setPosts((prev) => prev.filter((post) => post.id !== id));
  };

  return (
    <Container maxWidth="md">
      {/* 헤더 */}
      <Box sx={{ textAlign: "center", my: 4 }}>
        <Typography variant="h4" fontWeight="bold">
          게시판
        </Typography>
      </Box>

      {/* 게시글 생성 버튼 */}
      <Box sx={{ textAlign: "right", mb: 4 }}>
        <Button variant="contained" component={Link} to="/posts/new">
          새 게시글 추가
        </Button>
      </Box>

      {/* 게시글 목록 */}
      <Box>
        {posts.map((post) => (
          <Paper
            key={post.id}
            elevation={2}
            sx={{ mb: 2, borderRadius: 2, overflow: "hidden" }}
          >
            <Card
              sx={{ cursor: "pointer" }}
              onClick={() => navigate({ to: `/posts/${post.id}` })}
            >
              <CardContent>
                {/* 제목 */}
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  {post.title}
                </Typography>

                {/* 본문 일부 미리보기 2줄 넘으면 ... */}
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mb: 1,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {post.content}
                </Typography>

                {/* 작성자 & 날짜 */}
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="caption" color="text.secondary">
                    작성자: {post.author}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formattedDate(post.createdDate)}
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Paper>
        ))}
      </Box>
    </Container>
  );
}
