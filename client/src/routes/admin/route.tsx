import { Home, Book, Upload, PersonAdd } from "@mui/icons-material";
import { Box, Container } from "@mui/material";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import SideNavigationBar from "../../component/SideNavigatorBar";

export const Route = createFileRoute("/admin")({
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
          {
            to: "/admin/publisher",
            icon: <PersonAdd />,
            label: "Publisher",
          },
        ]}
      />
      <Container sx={{ margin: 8, marginX: "auto" }}>
        <Outlet />
      </Container>
    </Box>
  );
}
