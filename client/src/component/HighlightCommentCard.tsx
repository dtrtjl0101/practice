import { Box, Typography } from "@mui/material";
import type { HighlightComment } from "../types/highlight";

export default function HighlightCommentCard({
  comment,
}: {
  comment: HighlightComment;
}) {
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="body2" color="text.secondary">
        {comment.authorName}
      </Typography>
      <Typography variant="body1">{comment.content}</Typography>
    </Box>
  );
}
