import { HomeFilled, Home, Book, Menu, Upload } from "@mui/icons-material";
import {
  Box,
  Container,
  CSSObject,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  styled,
  Theme,
  Drawer as MuiDrawer,
} from "@mui/material";
import { createFileRoute, createLink, Outlet } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/_pathlessLayout/admin")({
  component: RouteComponent,
});

const drawerWidth = 240;

function RouteComponent() {
  return (
    <Box sx={{ display: "flex" }}>
      <SideMenu />
      <Container sx={{ margin: 2, marginX: "auto" }}>
        <Outlet />
      </Container>
    </Box>
  );
}

function SideMenu() {
  const [open, setOpen] = useState(false);

  return (
    <Drawer open={open} variant="permanent">
      <List>
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => {
              setOpen(!open);
            }}
          >
            <ListItemIcon>
              <Menu />
            </ListItemIcon>
          </ListItemButton>
        </ListItem>
        <LinkListItem disablePadding to="/admin">
          {({ isActive }) => {
            return (
              <ListItemButton>
                <ListItemIcon>
                  {isActive ? <HomeFilled /> : <Home />}
                </ListItemIcon>
              </ListItemButton>
            );
          }}
        </LinkListItem>
        <LinkListItem disablePadding to="/admin/books">
          {({ isActive }) => {
            return (
              <ListItemButton selected={isActive}>
                <ListItemIcon>
                  <Book />
                </ListItemIcon>
                <ListItemText primary={"Book"} />
              </ListItemButton>
            );
          }}
        </LinkListItem>
        <LinkListItem disablePadding to="/admin/uploadBook">
          {({ isActive }) => {
            return (
              <ListItemButton selected={isActive}>
                <ListItemIcon>
                  <Upload />
                </ListItemIcon>
                <ListItemText primary={"Upload"} />
              </ListItemButton>
            );
          }}
        </LinkListItem>
      </List>
    </Drawer>
  );
}

const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(7)} + 1px)`,
  },
});

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  "& .MuiDrawer-paper": {
    marginTop: theme.spacing(8),
  },

  variants: [
    {
      props: ({ open }) => open,
      style: {
        ...openedMixin(theme),
        "& .MuiDrawer-paper": {
          ...openedMixin(theme),
        },
      },
    },
    {
      props: ({ open }) => !open,
      style: {
        ...closedMixin(theme),
        "& .MuiDrawer-paper": {
          ...closedMixin(theme),
        },
      },
    },
  ],
}));

const LinkListItem = createLink(ListItem);
