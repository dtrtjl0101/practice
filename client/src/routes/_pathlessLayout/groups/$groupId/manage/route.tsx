import { Box, Container } from "@mui/material";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import SideNavigationBar from "../../../../../component/SideNavigatorBar";
import { Assignment, Home } from "@mui/icons-material";

export const Route = createFileRoute("/_pathlessLayout/groups/$groupId/manage")(
  {
    component: RouteComponent,
  }
);

function RouteComponent() {
  return (
    <Box sx={{ display: "flex" }}>
      <SideNavigationBar
        items={[
          {
            to: "/groups/$groupId/manage",
            icon: <Home />,
            label: "Home",
            disableShowActive: true,
          },
          {
            to: "/groups/$groupId/manage/joinRequests",
            icon: <Assignment />,
            label: "가입대기",
          },
        ]}
      />
      <Container sx={{ margin: 2, marginX: "auto" }}>
        <Outlet />
      </Container>
    </Box>
  );
}
