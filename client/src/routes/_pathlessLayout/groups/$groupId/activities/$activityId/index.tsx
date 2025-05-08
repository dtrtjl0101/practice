import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_pathlessLayout/groups/$groupId/activities/$activityId/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>Hello "/_pathlessLayout/groups/$groupId/activities/$activityId/"!</div>
  )
}
