import {
  Card,
  CardContent,
  Avatar,
  Typography,
  Stack,
  Divider,
  Chip,
  Grid,
} from "@mui/material";
import { useRef } from "react";
import { useAtomValue } from "jotai";
import State from "../states";
import {
  getEmojiFromReactionType,
  HighlightReaction,
  HighlightSummary,
  type HighlightReactionType,
} from "../types/highlight";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import API_CLIENT from "../api/api";
import { Role } from "../types/role";
import createReactionMap from "../utils/createReactionMap";

export default function HighlightSummaryCard({
  highlightSummary,
  onClick,
}: {
  highlightSummary: HighlightSummary;
  onClick?: () => void;
}) {
  const user = useAtomValue(State.Auth.user);
  const cardRef = useRef<HTMLDivElement>(null);

  const { data: reactions, refetch: refetchReactions } = useQuery({
    queryKey: ["highlightReactions", highlightSummary.id],
    queryFn: async () => {
      const response =
        await API_CLIENT.highlightController.getHighlightReactions(
          highlightSummary.id
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
    )(reacted ? reacted.id! : highlightSummary.id, {
      reactionType: reactionType,
    });
    if (!response.isSuccessful) {
      alert(response.errorMessage);
    }
    refetchReactions();
  };

  return (
    <Card
      variant="outlined"
      ref={cardRef}
      onClick={onClick}
      sx={{ width: 320 }}
    >
      <CardContent sx={{ pt: 1 }}>
        <Stack spacing={1}>
          <Stack spacing={1} direction={"row"} alignItems={"center"}>
            <Avatar src={highlightSummary.authorProfileImageURL} />
            <Typography variant="body1">
              {highlightSummary.authorName}
            </Typography>
          </Stack>
          <Typography variant="body2" color="textSecondary">
            {highlightSummary.highlightContent}
          </Typography>
          <Divider />
          <Typography variant="body2">{highlightSummary.memo}</Typography>
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
          </Grid>
        </Stack>
      </CardContent>
    </Card>
  );
}
