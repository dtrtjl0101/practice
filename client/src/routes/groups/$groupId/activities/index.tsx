import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/groups/$groupId/activities/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_pathlessLayout/groups/$groupId/activities/"!</div>
}
