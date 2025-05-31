import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/mypage/admin/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/mypage/admin/"!</div>
}
