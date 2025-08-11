import { createRootRoute, Outlet, useMatches } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import AppBar from "../component/AppBar";
import useAutoTokenRefresh from "../api/login/useAutoTokenRefresh";
import useInvalidateQueriesOnAuthChange from "../api/login/useInvalidateQueriesOnAuthChange";
import { Toolbar } from "@mui/material";
import { NavigationItem } from "../component/SideNavigatorBar";
import {
  AdminPanelSettings,
  Badge,
  Book,
  BookOnline,
  Group,
  Home,
  ImportContacts,
} from "@mui/icons-material";
import { useAtomValue } from "jotai";
import State from "../states";
import { Role } from "../types/role";
import { FileRouteTypes } from "../routeTree.gen";
import autoLogin from "../api/login/autoLogin";

export const Route = createRootRoute({
  component: RouteComponent,
});

const navigationShellHidePathIds: FileRouteTypes["id"][] = [
  "/reader/$bookId",
  "/credits/payment/success",
  "/oauth2/success",
  "/oauth2/failure",
];

const defaultNavigationItems: NavigationItem[][] = [
  [{ to: "/", label: "홈", icon: <Home /> }],
  [{ to: "/books", label: "도서", icon: <Book /> }],
  [{ to: "/groups", label: "모임", icon: <Group /> }],
];

const adminNavigationItems: NavigationItem[] = [
  { to: "/mypage/admin", label: "관리자", icon: <AdminPanelSettings /> },
  { to: "/admin/books", label: "도서 관리", icon: <BookOnline /> },
  { to: "/admin/publisher", label: "출판사 관리", icon: <Badge /> },
];

const publisherNavigationItems: NavigationItem[] = [
  { to: "/mypage/publisher", label: "출판사", icon: <ImportContacts /> },
];

autoLogin();

function RouteComponent() {
  useAutoTokenRefresh();
  useInvalidateQueriesOnAuthChange();
  const user = useAtomValue(State.Auth.user);
  const matches = useMatches();
  const shouldHideNavigationShell = matches.some((match) =>
    navigationShellHidePathIds.includes(match.routeId),
  );

  const isAdmin = user && user.role === Role.ROLE_ADMIN;
  const isPublisher = user && user.role === Role.ROLE_PUBLISHER;

  return (
    <>
      {!shouldHideNavigationShell && (
        <>
          <AppBar
            sideNavigationBarItemsWithGroups={[
              ...defaultNavigationItems,
              ...(isAdmin ? [adminNavigationItems] : []),
              ...(isPublisher ? [publisherNavigationItems] : []),
            ]}
          />
          <Toolbar />
        </>
      )}
      <Outlet />
      <TanStackRouterDevtools />
    </>
  );
}
