import { createFileRoute } from "@tanstack/react-router";
import Form from "../../../../../component/DiscussionForm";

export const Route = createFileRoute(
  "/_pathlessLayout/groups/$groupId/discussions/new"
)({
  component: Form,
});
