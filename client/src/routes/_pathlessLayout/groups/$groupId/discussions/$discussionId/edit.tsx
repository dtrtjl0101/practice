import { createFileRoute } from "@tanstack/react-router";
import Form from "../../../../../../component/form";

export const Route = createFileRoute(
  "/_pathlessLayout/groups/$groupId/discussions/$discussionId/edit"
)({
  component: Form,
});
