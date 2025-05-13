import { createFileRoute, Outlet } from "@tanstack/react-router";
import AppBar from "../../component/AppBar";
import useAutoLogin from "../../api/login/useAutoLogin";
import useAutoTokenRefresh from "../../api/login/useAutoTokenRefresh";
import useInvalidateQueriesOnAuthChange from "../../api/login/useInvalidateQueriesOnAuthChange";

export const Route = createFileRoute("/_pathlessLayout")({
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
    </>
  );
}
