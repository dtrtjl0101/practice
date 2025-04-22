import { createFileRoute } from "@tanstack/react-router";
import Form from "../../../../component/form";

export const Route = createFileRoute("/_pathlessLayout/posts/$postID/edit")({
  component: Form,
});
