import { createFileRoute } from "@tanstack/react-router";
import DiscussionForm from "../../../../../../../component/DiscussionForm";

export const Route = createFileRoute(
  "/_pathlessLayout/groups/$groupId/activities/$activityId/discussions/new"
)({
  component: RouteComponent,
});

function RouteComponent() {
  const { activityId } = Route.useParams();
  const navigate = Route.useNavigate();
  const goToDiscussion = (discussionId?: number) => {
    if (!discussionId) {
      alert("Invalid discussion ID");
      return;
    }
    navigate({
      from: Route.to,
      to: "/groups/$groupId/activities/$activityId/discussions/$discussionId",
      params: {
        discussionId: discussionId.toString(),
      },
    });
  };
  return (
    <DiscussionForm
      activityId={parseInt(activityId)}
      handlePostRoute={goToDiscussion}
      handleBack={() => {
        navigate({
          to: "..",
        });
      }}
    />
  );
}
