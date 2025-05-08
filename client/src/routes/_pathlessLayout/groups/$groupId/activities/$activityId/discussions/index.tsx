import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_pathlessLayout/groups/$groupId/activities/$activityId/discussions/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      Hello
      "/_pathlessLayout/groups/$groupId/activities/$activityId/discussions/"!
    </div>
  )
}
