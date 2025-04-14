import {
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  Divider,
} from "@mui/material";
import { useState } from "react";
import { Comment } from "../types/comment";

type CommentSectionProps = {
  comments: Comment[];
  onAddComment: (newComment: string) => void;
  onDeleteComment: (id: number) => void;
};

export default function CommentSection({
  comments,
  onAddComment,
  onDeleteComment,
}: CommentSectionProps) {
  const [input, setInput] = useState("");

  const handleSubmit = () => {
    if (input.trim() === "") return;
    onAddComment(input.trim());
    setInput("");
  };

  return (
    <Box sx={{ mt: 5 }}>
      <Divider sx={{ mb: 2 }} />
      <Typography variant="h6" gutterBottom>
        댓글
      </Typography>

      {/* 댓글 작성 */}
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <TextField
          fullWidth
          multiline
          minRows={2}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="댓글을 입력하세요"
        />
        <Button variant="contained" onClick={handleSubmit}>
          작성
        </Button>
      </Stack>

      {/* 댓글 목록 */}
      {comments.length === 0 ? (
        <Typography color="text.secondary">아직 댓글이 없습니다.</Typography>
      ) : (
        comments.map((comment) => (
          <Box key={comment.id} sx={{ mb: 2 }}>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="subtitle2">{comment.author}</Typography>
              <Button
                variant="text"
                color="error"
                size="small"
                sx={{ justifySelf: "flex-end" }}
                onClick={() => onDeleteComment(comment.id)}
              >
                삭제
              </Button>
            </Stack>
            <Typography
              variant="body2"
              sx={{ whiteSpace: "pre-line" }}
              color="text.secondary"
            >
              {comment.content}
            </Typography>
            <Typography variant="caption" color="text.disabled">
              {new Date(comment.createdDate).toLocaleString()}
            </Typography>
            <Divider sx={{ mt: 1 }} />
          </Box>
        ))
      )}
    </Box>
  );
}
