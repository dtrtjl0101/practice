import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import AppBar from "../component/AppBar";
import useAutoLogin from "../api/login/useAutoLogin";
import useAutoTokenRefresh from "../api/login/useAutoTokenRefresh";
import useInvalidateQueriesOnAuthChange from "../api/login/useInvalidateQueriesOnAuthChange";

export const Route = createRootRoute({
  component: RouteComponent,
});

function RouteComponent() {
  useAutoLogin();
  useAutoTokenRefresh();
  useInvalidateQueriesOnAuthChange();

  return (
    <>
      <AppBar />
      <Outlet />
      <TanStackRouterDevtools />
    </>
  );
}
