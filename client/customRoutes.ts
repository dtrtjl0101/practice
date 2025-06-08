import { routeTree as generatedRouteTree } from "./src/routeTree.gen";
import { createRoute } from "@tanstack/react-router";

// ✅ 자동 생성된 라우트를 확장하여 id 추가
export const postDetailRoute = createRoute({
  getParentRoute: () => generatedRouteTree,
  path: "post/detail/:id",
  id: "/post/detail", // ✅ id 추가
});

// ✅ 라우트 트리를 확장하여 사용
export const customRouteTree = generatedRouteTree.addChildren([
  postDetailRoute, // 기존 routeTree에 새로운 라우트 추가
]);
