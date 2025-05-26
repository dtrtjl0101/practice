import { createRootRoute, Outlet, useMatches } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import AppBar from "../component/AppBar";
import useAutoLogin from "../api/login/useAutoLogin";
import useAutoTokenRefresh from "../api/login/useAutoTokenRefresh";
import useInvalidateQueriesOnAuthChange from "../api/login/useInvalidateQueriesOnAuthChange";
import { Box, Toolbar } from "@mui/material";
import SideNavigationBar, {
  NavigationItem,
} from "../component/SideNavigatorBar";
import {
  AdminPanelSettings,
  Badge,
  Book,
  BookOnline,
  Group,
  Home,
} from "@mui/icons-material";
import { useAtomValue } from "jotai";
import State from "../states";
import { Role } from "../types/role";
import { FileRouteTypes } from "../routeTree.gen";

export const Route = createRootRoute({
  component: RouteComponent,
});

const navigationShellHidePathIds: FileRouteTypes["id"][] = [
  "/reader/$bookId",
  "/credits/payment/success",
];

const defaultNavigationItems: NavigationItem[][] = [
  [{ to: "/", label: "홈", icon: <Home /> }],
  [{ to: "/books", label: "도서", icon: <Book /> }],
  [{ to: "/groups", label: "그룹", icon: <Group /> }],
];

const adminNavigationItems: NavigationItem[] = [
  { to: "/admin", label: "관리자", icon: <AdminPanelSettings /> },
  { to: "/admin/books", label: "도서 관리", icon: <BookOnline /> },
  { to: "/admin/publisher", label: "출판사 관리", icon: <Badge /> },
];

function RouteComponent() {
  useAutoLogin();
  useAutoTokenRefresh();
  useInvalidateQueriesOnAuthChange();
  const user = useAtomValue(State.Auth.user);
  const matches = useMatches();
  const shouldHideNavigationShell = matches.some((match) =>
    navigationShellHidePathIds.includes(match.routeId)
  );

  const isAdmin = user && user.role === Role.ROLE_ADMIN;

  return (
    <Box sx={{ display: "flex" }}>
      {!shouldHideNavigationShell && (
        <>
          <AppBar />
          <SideNavigationBar
            itemsWithGroups={[
              ...defaultNavigationItems,
              ...(isAdmin ? [adminNavigationItems] : []),
            ]}
          />
        </>
      )}
      <Box component="main" sx={{ flexGrow: 1 }}>
        {!shouldHideNavigationShell && <Toolbar />}
        <Outlet />
      </Box>
      <TanStackRouterDevtools />
    </Box>
  );
}
