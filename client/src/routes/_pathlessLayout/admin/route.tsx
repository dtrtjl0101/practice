import { Home, Book, Upload } from "@mui/icons-material";
import { Box, Container } from "@mui/material";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import SideNavigationBar from "../../../component/SideNavigatorBar";

export const Route = createFileRoute("/_pathlessLayout/admin")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <Box sx={{ display: "flex" }}>
      <SideNavigationBar
        items={[
          {
            to: "/admin",
            icon: <Home />,
            label: "Home",
            disableShowActive: true,
          },
          { to: "/admin/books", icon: <Book />, label: "Books" },
          { to: "/admin/uploadBook", icon: <Upload />, label: "Upload" },
        ]}
      />
      <Container sx={{ margin: 2, marginX: "auto" }}>
        <Outlet />
      </Container>
    </Box>
  );
}
