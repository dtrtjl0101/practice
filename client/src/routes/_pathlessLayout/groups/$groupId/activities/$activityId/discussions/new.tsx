import { createFileRoute } from "@tanstack/react-router";
import Form from "../../../../../../../component/DiscussionForm";

export const Route = createFileRoute(
  "/_pathlessLayout/groups/$groupId/activities/$activityId/discussions/new"
)({
  component: Form,
});
