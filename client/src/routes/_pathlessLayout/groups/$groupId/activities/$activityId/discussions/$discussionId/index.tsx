import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Typography,
  Container,
  Button,
  Paper,
  Divider,
  Stack,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import API_CLIENT, { wrapApiResponse } from "../../../../../../../../api/api";
import { Discussion } from "../../../../../../../../types/discussion";
import { useState } from "react";
import CommentSection from "../../../../../../../../component/CommentSection";
import { Comment } from "../../../../../../../../types/comment";

export const Route = createFileRoute(
  "/_pathlessLayout/groups/$groupId/activities/$activityId/discussions/$discussionId/"
)({
  component: DiscussionId,
});

function DiscussionId() {
  const { groupId, activityId, discussionId } = Route.useParams();

  return (
    <div>
      Hello {groupId} {activityId} {discussionId}
    </div>
  );
}
