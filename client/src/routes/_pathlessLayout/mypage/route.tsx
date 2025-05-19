import { Box, Container } from "@mui/material";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import SideNavigationBar from "../../../component/SideNavigatorBar";
import { Book, Group, Home } from "@mui/icons-material";

export const Route = createFileRoute("/_pathlessLayout/mypage")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <Box sx={{ display: "flex" }}>
      <SideNavigationBar
        items={[
          {
            to: "/mypage",
            icon: <Home />,
            label: "Home",
            disableShowActive: true,
          },
          { to: "/mypage/groups", icon: <Group />, label: "Groups" },
          { to: "/mypage/books", icon: <Book />, label: "Books" },
        ]}
      />
      <Container sx={{ margin: 2, marginX: "auto" }}>
        <Outlet />
      </Container>
    </Box>
  );
}
