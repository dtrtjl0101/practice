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
  Link,
  MoreVert,
  Send,
} from "@mui/icons-material";
import { useEffect, useRef, useState } from "react";
import { useAtomValue } from "jotai";
import { useSnackbar } from "notistack";
import State from "../states";
import {
  getEmojiFromReactionType,
  HighlightReaction,
  type Highlight,
  type HighlightComment,
  type HighlightReactionType,
} from "../types/highlight";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import API_CLIENT from "../api/api";
import HighlightCommentCard from "./HighlightCommentCard";
import { Role } from "../types/role";
import createReactionMap from "../utils/createReactionMap";
import { LinkChip } from "./LinkChip";

export default function HighlightCard({
  highlight,
  refetchHighlights,
  groupId,
  activityId,
  focused,
  shouldFade,
  onClick,
}: {
  highlight: Highlight;
  groupId?: number;
  activityId?: number;
  refetchHighlights: () => void;
  focused: boolean;
  shouldFade: boolean;
  onClick?: () => void;
}) {
  const user = useAtomValue(State.Auth.user);
  const [openComments, setOpenComments] = useState(false);
  const [commentContent, setCommentContent] = useState("");
  const isAuthor =
    highlight.authorId ===
    (user?.role === Role.ROLE_USER ? user.userId : undefined);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [emojiAnchorEl, setEmojiAnchorEl] = useState<null | HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const { enqueueSnackbar } = useSnackbar();

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
      const reactions = createReactionMap(
        response.data as unknown as HighlightReaction[]
      );
      return reactions;
    },
    placeholderData: keepPreviousData,
  });

  const { data: comments, refetch: refetchComments } = useQuery({
    queryKey: ["highlightComments", highlight.id],
    queryFn: async () => {
      const response = await API_CLIENT.highlightCommentController.getComments(
        highlight.id
      );
      if (!response.isSuccessful) {
        throw new Error(response.errorMessage);
      }
      return response.data as HighlightComment[];
    },
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    if (!focused) {
      return;
    }
    if (cardRef.current === null) {
      return;
    }
    cardRef.current.scrollIntoView({
      behavior: "smooth",
    });
  }, [focused]);

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
      enqueueSnackbar(response.errorMessage, { variant: "error" });
    }
    setAnchorEl(null);
    refetchHighlights();
  };

  const onReactionClicked = async (reactionType: HighlightReactionType) => {
    if (!reactions || !user || user.role !== Role.ROLE_USER) return;
    const reacted = getReacted(reactionType);
    const response = await (
      reacted
        ? API_CLIENT.highlightReactionController.deleteReaction
        : API_CLIENT.highlightReactionController.addReaction
    )(reacted ? reacted.id! : highlight.id, {
      reactionType: reactionType,
    });
    if (!response.isSuccessful) {
      enqueueSnackbar(response.errorMessage, { variant: "error" });
    }
    setEmojiAnchorEl(null);
    refetchReactions();
  };

  const onCommentCreateButtonClicked = async () => {
    if (!user) return;
    const response = await API_CLIENT.highlightCommentController.createComment(
      highlight.id,
      {
        content: commentContent,
      }
    );
    if (!response.isSuccessful) {
      enqueueSnackbar(response.errorMessage, { variant: "error" });
    }
    setCommentContent("");
    refetchComments();
  };

  return (
    <Card
      ref={cardRef}
      sx={{ opacity: shouldFade ? 0.5 : 1 }}
      variant="outlined"
      onClick={onClick}
    >
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
          모임 공개
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
          <Typography variant="body2" color="textSecondary">
            {highlight.highlightContent}
          </Typography>
          <Divider />
          <Typography variant="body2">{highlight.memo}</Typography>

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
                      <Typography>{getEmojiFromReactionType(type)}</Typography>
                    }
                    label={count}
                    variant={reacted ? "filled" : "outlined"}
                  />
                );
              })}
            {highlight.linkedDiscussions.map((discussion) => {
              if (typeof groupId === "undefined") {
                return null;
              }
              return (
                <LinkChip
                  key={discussion.discussionId}
                  icon={<Link />}
                  label={discussion.title}
                  variant="outlined"
                  to={
                    "/groups/$groupId/activities/$activityId/discussions/$discussionId"
                  }
                  params={{
                    groupId: groupId?.toString(),
                    activityId: discussion.activityId.toString(),
                    discussionId: discussion.discussionId.toString(),
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
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
            {reactions &&
              Array.from(reactions.keys()).map((type) => (
                <IconButton
                  key={type}
                  onClick={() => {
                    onReactionClicked(type);
                  }}
                  size="medium"
                >
                  {getEmojiFromReactionType(type)}
                </IconButton>
              ))}
          </Stack>
        </Popover>
      </CardActions>
      {openComments && (
        <>
          {comments &&
            comments.map((comment) => (
              <HighlightCommentCard
                key={comment.id}
                comment={comment}
                highlight={highlight}
                refetchComments={refetchComments}
              />
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
