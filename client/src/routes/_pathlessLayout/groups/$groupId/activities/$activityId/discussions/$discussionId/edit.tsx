import { createFileRoute } from "@tanstack/react-router";
import DiscussionForm from "../../../../../../../../component/DiscussionForm";

export const Route = createFileRoute(
  "/_pathlessLayout/groups/$groupId/activities/$activityId/discussions/$discussionId/edit"
)({
  component: DiscussionForm,
});
