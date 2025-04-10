import { useState } from "react";
import {
  Box,
  Grid,
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
      {/*헤더*/}
      <Box sx={{ textAlign: "center", my: 4 }}>
        <Typography variant="h4">게시판</Typography>
      </Box>

      {/*게시글 생성 버튼*/}
      <Box sx={{ textAlign: "right", my: 4 }}>
        <Button variant="contained" component={Link} to={`/posts/new`}>
          새 게시글 추가
        </Button>
      </Box>
      {/*게시글 목록*/}
      <Box>
        {posts.map((post) => (
          <Paper
            key={post.id}
            elevation={3}
            style={{ marginBottom: "15px", padding: "10px" }}
          >
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ flexGrow: 1 }}>
                  <Box
                    onClick={() => {
                      navigate({ to: `/posts/${post.id}` });
                    }}
                    style={{
                      textDecoration: "none",
                      color: "inherit",
                      cursor: "pointer",
                    }}
                  >
                    {post.title}
                  </Box>
                </Typography>
                <Typography variant="body2">{post.content}</Typography>
              </CardContent>
            </Card>
          </Paper>
        ))}
      </Box>
      {/* // <Card key={post.id} sx={{ marginBottom: 2 }}>
          //   <CardContent>
          //     <Typography variant="h5">
          //       <div
          //         onClick={() => {
          //           navigate({
          //             to: `/posts/${post.id}`,
          //           });
          //         }}
          //         style={{
          //           textDecoration: "none",
          //           color: "inherit",
          //           cursor: "pointer",
          //         }}
          //       >
          //         {post.title}
          //       </div>
          //     </Typography>
          //     <Typography variant="body2" color="text.secondary">
          //       {post.author}
          //     </Typography>
          //     <Typography variant="body2" color="text.secondary">
          //       {formattedDate(post.createdDate)}
          //     </Typography>
          //     <DeleteButton onClick={() => handleDelete(post.id)} />
          //   </CardContent>
          // </Card> 
        ))}*/}
    </Container>
  );
}
