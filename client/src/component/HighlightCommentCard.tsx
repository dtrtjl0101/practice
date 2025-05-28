import { useMemo, useState } from "react";
import {
  Avatar,
  Card,
  CardActions,
  CardContent,
  Chip,
  Divider,
  Grid,
  IconButton,
  Menu,
  Stack,
  Typography,
} from "@mui/material";
import {
  getEmojiFromReactionType,
  type Highlight,
  type HighlightComment,
  type HighlightReactionType,
} from "../types/highlight";
import { MoreVert } from "@mui/icons-material";
import EmojiReactionButton from "./EmojiReactionButton";
import { useAtomValue } from "jotai";
import State from "../states";
import createReactionMap from "../util/createReactionMap";
import { Role } from "../types/role";
import API_CLIENT from "../api/api";

export default function HighlightCommentCard({
  highlight,
  comment,
  refetchComments,
}: {
  highlight: Highlight;
  comment: HighlightComment;
  refetchComments: () => void;
}) {
  const user = useAtomValue(State.Auth.user);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isAuthor =
    comment.authorId === (user?.role === "ROLE_USER" ? user.userId : undefined);

  const reactions = useMemo(() => {
    return createReactionMap(comment.reactions);
  }, [comment]);

  const getReacted = (reactionType: HighlightReactionType) => {
    if (!reactions || !user || user.role !== Role.ROLE_USER) return;
    const reacted = reactions
      .get(reactionType)!
      .find((reaction) => reaction.authorId === user.userId);
    return reacted;
  };

  const onReactionClicked = async (reactionType: HighlightReactionType) => {
    if (!reactions || !user || user.role !== Role.ROLE_USER) return;
    const reacted = getReacted(reactionType);
    const response = await (
      reacted
        ? API_CLIENT.highlightReactionController.deleteReaction
        : API_CLIENT.highlightReactionController.addReaction
    )(reacted ? reacted.id! : highlight.id, {
      commentId: comment.id,
      reactionType: reactionType,
    });
    if (!response.isSuccessful) {
      alert(response.errorMessage);
    }
    refetchComments();
  };

  return (
    <Card variant="outlined">
      <>
        <Divider />
        <Menu
          anchorEl={anchorEl}
          open={!!anchorEl}
          onClose={() => setAnchorEl(null)}
        >
          {/* <MenuItem
          disabled={!!comment.activityId}
          onClick={onShareToGroupClicked}
          value="group"
        >
          그룹 공개
        </MenuItem> */}
        </Menu>
        <CardContent sx={{ pt: 1 }}>
          <Stack spacing={1}>
            <Stack spacing={1} direction={"row"} alignItems={"center"}>
              <Avatar src={comment.authorProfileImageURL} />
              <Typography variant="body1">{comment.authorName}</Typography>
              {isAuthor && (
                <IconButton
                  onClick={(e) => {
                    setAnchorEl(e.currentTarget);
                  }}
                >
                  <MoreVert />
                </IconButton>
              )}
            </Stack>
            <Typography variant="body1">{comment.content}</Typography>
            <Grid
              container
              direction={"row"}
              spacing={1}
              sx={{ flexGrow: 1, alignContent: "flex-start", flexWrap: "wrap" }}
            >
              {reactions &&
                Array.from(reactions.entries()).map(([type, reactions]) => {
                  const reacted = getReacted(type);
                  const count = reactions.length || 0;
                  if (count === 0) return null;
                  return (
                    <Chip
                      key={type}
                      onClick={() => {
                        onReactionClicked(type);
                      }}
                      icon={
                        <Typography>
                          {getEmojiFromReactionType(type)}
                        </Typography>
                      }
                      label={count}
                      variant={reacted ? "filled" : "outlined"}
                    />
                  );
                })}
            </Grid>
          </Stack>
        </CardContent>
        <CardActions sx={{ justifyContent: "flex-end" }}>
          <EmojiReactionButton onReactionClicked={onReactionClicked} />
        </CardActions>
      </>
    </Card>
  );
}
