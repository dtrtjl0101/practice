import {
  Card,
  CardContent,
  Avatar,
  Typography,
  Stack,
  Divider,
} from "@mui/material";
import { type Highlight } from "../types/highlight";

export default function SimpleHighlightCard({
  highlight,
}: {
  highlight: Highlight;
}) {
  return (
    <Card
      variant="outlined"
      sx={{
        elevation: 3,
        borderRadius: 2,
      }}
    >
      <CardContent sx={{ pt: 1 }}>
        <Stack spacing={1}>
          <Stack spacing={1} direction={"row"} alignItems={"center"}>
            <Avatar src={highlight.authorProfileImageURL} />
            <Typography variant="body1">{highlight.authorName}</Typography>
          </Stack>
          <Typography
            component="blockquote"
            sx={{
              fontStyle: "italic",
              borderLeft: "4px solid gray",
              paddingLeft: "10px",
            }}
          >
            {highlight.highlightContent}
          </Typography>
          <Divider />
          <Typography variant="body2">{highlight.memo}</Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}
