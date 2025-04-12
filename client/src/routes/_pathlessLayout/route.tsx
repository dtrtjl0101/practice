import { createFileRoute, Outlet } from "@tanstack/react-router";
import AppBar from "../../component/AppBar";
import useAutoLogin from "../../api/login/useAutoLogin";

export const Route = createFileRoute("/_pathlessLayout")({
  component: RouteComponent,
});

function RouteComponent() {
  useAutoLogin();

  return (
    <>
      <AppBar />
      <Outlet />
    </>
  );
}
