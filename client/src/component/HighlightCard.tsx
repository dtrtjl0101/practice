import {
  Card,
  CardActions,
  CardContent,
  Menu,
  MenuItem,
  IconButton,
  Avatar,
  Typography,
  Stack,
  Divider,
  Badge,
  Popover,
  Input,
  InputAdornment,
  Chip,
  Grid,
} from "@mui/material";
import {
  Comment,
  CommentOutlined,
  EmojiEmotions,
  MoreVert,
  Send,
} from "@mui/icons-material";
import { useState } from "react";
import { useAtomValue } from "jotai";
import State from "../states";
import type {
  Highlight,
  HighlightComment,
  HighlightReactionType,
} from "../types/highlight";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import API_CLIENT from "../api/api";
import HighlightCommentCard from "./HighlightCommentCard";
import { Role } from "../types/role";

export default function HighlightCard({
  highlight,
  refetchHighlights,
  activityId,
}: {
  highlight: Highlight;
  activityId?: number;
  refetchHighlights: () => void;
}) {
  const user = useAtomValue(State.Auth.user);
  const [openComments, setOpenComments] = useState(false);
  const [commentContent, setCommentContent] = useState("");
  const isAuthor =
    highlight.authorId ===
    (user?.role === Role.ROLE_USER ? user.userId : undefined);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [emojiAnchorEl, setEmojiAnchorEl] = useState<null | HTMLElement>(null);
  const emojiList: { type: HighlightReactionType; emoji: string }[] = [
    { type: "GREAT", emoji: "👍" },
    { type: "HEART", emoji: "❤️" },
    { type: "SMILE", emoji: "😊" },
    { type: "CLAP", emoji: "👏" },
    { type: "SAD", emoji: "😢" },
    { type: "ANGRY", emoji: "😡" },
    { type: "SURPRISED", emoji: "😲" },
  ];

  const { data: reactions, refetch: refetchReactions } = useQuery({
    queryKey: ["highlightReactions", highlight.id],
    queryFn: async () => {
      const response =
        await API_CLIENT.highlightController.getHighlightReactions(
          highlight.id
        );
      if (!response.isSuccessful) {
        throw new Error(response.errorMessage);
      }
      const reactions: Map<
        HighlightReactionType,
        (typeof response.data)[number][]
      > = new Map([
        ["GREAT", []],
        ["HEART", []],
        ["SMILE", []],
        ["CLAP", []],
        ["SAD", []],
        ["ANGRY", []],
        ["SURPRISED", []],
      ]);
      response.data.forEach((reaction) => {
        reactions.get(reaction.reactionType!)!.push(reaction);
      });
      return reactions;
    },
    placeholderData: keepPreviousData,
  });

  const { data: comments, refetch: refetchComments } = useQuery({
    queryKey: ["highlightComments", highlight.id],
    queryFn: async () => {
      const response = await API_CLIENT.commentController.getComments(
        highlight.id
      );
      if (!response.isSuccessful) {
        throw new Error(response.errorMessage);
      }
      return response.data as HighlightComment[];
    },
    placeholderData: keepPreviousData,
  });

  const getReacted = (reactionType: HighlightReactionType) => {
    if (!reactions || !user || user.role !== Role.ROLE_USER) return;
    const reacted = reactions
      .get(reactionType)!
      .find((reaction) => reaction.authorId === user.userId);
    return reacted;
  };

  const onShareToGroupClicked = async () => {
    const response = await API_CLIENT.highlightController.updateHighlight(
      highlight.id,
      {
        activityId,
      }
    );
    if (!response.isSuccessful) {
      alert(response.errorMessage);
    }
    setAnchorEl(null);
    refetchHighlights();
  };

  const onReactionClicked = async (reactionType: HighlightReactionType) => {
    if (!reactions || !user || user.role !== Role.ROLE_USER) return;
    const reacted = getReacted(reactionType);
    const response = await (
      reacted
        ? API_CLIENT.reactionController.deleteReaction
        : API_CLIENT.reactionController.addReaction
    )(reacted ? reacted.id! : highlight.id, {
      reactionType: reactionType,
    });
    if (!response.isSuccessful) {
      alert(response.errorMessage);
    }
    setEmojiAnchorEl(null);
    refetchReactions();
  };

  const onCommentCreateButtonClicked = async () => {
    if (!user) return;
    const response = await API_CLIENT.commentController.createComment(
      highlight.id,
      {
        content: commentContent,
      }
    );
    if (!response.isSuccessful) {
      alert(response.errorMessage);
    }
    setCommentContent("");
    refetchComments();
  };

  return (
    <Card>
      <Menu
        anchorEl={anchorEl}
        open={!!anchorEl}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem
          disabled={!!highlight.activityId}
          onClick={onShareToGroupClicked}
          value="group"
        >
          그룹 공개
        </MenuItem>
      </Menu>
      <CardContent sx={{ pt: 1 }}>
        <Stack spacing={1}>
          <Stack spacing={1} direction={"row"} alignItems={"center"}>
            <Avatar src={highlight.authorProfileImageURL} />
            <Typography variant="body1">{highlight.authorName}</Typography>
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
          <Typography variant="body1">{highlight.memo}</Typography>
          <Grid
            container
            direction={"row"}
            spacing={1}
            sx={{ flexGrow: 1, alignContent: "flex-start", flexWrap: "wrap" }}
          >
            {reactions &&
              emojiList.map((e) => {
                const reacted = getReacted(e.type);
                const count = reactions.get(e.type)?.length || 0;
                if (count === 0) return null;
                return (
                  <Chip
                    key={e.type}
                    onClick={() => {
                      onReactionClicked(e.type);
                    }}
                    icon={<Typography>{e.emoji}</Typography>}
                    label={count}
                    variant={reacted ? "filled" : "outlined"}
                  />
                );
              })}
          </Grid>
        </Stack>
      </CardContent>
      <CardActions sx={{ justifyContent: "flex-end" }}>
        <IconButton size="small" onClick={() => setOpenComments(!openComments)}>
          <Badge badgeContent={comments?.length} color="primary">
            {openComments ? <Comment /> : <CommentOutlined />}
          </Badge>
        </IconButton>
        <IconButton
          size="small"
          onClick={(e) => setEmojiAnchorEl(e.currentTarget)}
        >
          <EmojiEmotions />
        </IconButton>
        <Popover
          open={Boolean(emojiAnchorEl)}
          anchorEl={emojiAnchorEl}
          onClose={() => setEmojiAnchorEl(null)}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          transformOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Stack direction="row" spacing={1}>
            {emojiList.map((e) => (
              <IconButton
                key={e.type}
                onClick={() => {
                  onReactionClicked(e.type);
                }}
                size="medium"
              >
                {e.emoji}
              </IconButton>
            ))}
          </Stack>
        </Popover>
      </CardActions>
      {openComments && comments && (
        <>
          {comments.map((comment) => (
            <HighlightCommentCard key={comment.id} comment={comment} />
          ))}
          <Divider />
          <CardActions>
            <Input
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              fullWidth
              multiline
              size="small"
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    edge="end"
                    onClick={() => onCommentCreateButtonClicked()}
                  >
                    <Send />
                  </IconButton>
                </InputAdornment>
              }
            />
          </CardActions>
        </>
      )}
    </Card>
  );
}
