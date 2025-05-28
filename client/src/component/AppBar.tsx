import {
  Toolbar,
  AppBar as MuiAppBar,
  Button,
  Divider,
  Avatar,
  Stack,
  IconButton,
} from "@mui/material";
import { createLink } from "@tanstack/react-router";
import { useAtom, useAtomValue } from "jotai";
import { AuthState } from "../states/auth";
import { Role } from "../types/role";
import useLogout from "../api/login/useLogout";
import LinkButton from "./LinkButton";
import NotificationButton from "./NotificationButton";
import State from "../states";
import { Menu, Nightlight, Sunny } from "@mui/icons-material";
import { useState } from "react";
import SideNavigationBar, { NavigationItem } from "./SideNavigatorBar";

export default function AppBar(props: {
  sideNavigationBarItemsWithGroups: NavigationItem[][];
}) {
  const { sideNavigationBarItemsWithGroups } = props;
  const user = useAtomValue(AuthState.user);
  const [colorScheme, setColorScheme] = useAtom(State.UI.userColorScheme);
  const { logout } = useLogout();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const onColorSchemeChangeButtonClicked = () => {
    setColorScheme((prev) => {
      const next = prev === "light" ? "dark" : "light";
      localStorage.setItem("colorScheme", next);
      return next;
    });
  };

  return (
    <>
      <SideNavigationBar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        itemsWithGroups={sideNavigationBarItemsWithGroups}
      />
      <MuiAppBar
        position="fixed"
        color="transparent"
        sx={{
          backdropFilter: "blur(10px)",
        }}
        elevation={0}
      >
        <Toolbar>
          <IconButton
            onClick={() => {
              setSidebarOpen((prev) => !prev);
            }}
          >
            <Menu />
          </IconButton>
          <LogoButton to="/" sx={{ mr: "auto" }}>
            <img src="/logoTitle.png" alt="Logo" height={40} />
          </LogoButton>
          <Stack direction="row" spacing={1}>
            <IconButton onClick={onColorSchemeChangeButtonClicked}>
              {colorScheme === "light" ? <Sunny /> : <Nightlight />}
            </IconButton>
            <Divider orientation="vertical" flexItem variant="middle" />
            {user ? (
              <>
                <LinkButton color="inherit" to={"/mypage"}>
                  <Stack direction="row" alignItems="center">
                    <Avatar
                      src={user.profileImageURL}
                      sx={{ width: 24, height: 24, mr: 1 }}
                    />
                    {user.role === Role.ROLE_USER
                      ? user.nickname
                      : user.role === Role.ROLE_PUBLISHER
                        ? user.publisherName
                        : "ADMIN"}
                  </Stack>
                </LinkButton>
                <NotificationButton />
                <Button color="inherit" onClick={logout}>
                  로그아웃
                </Button>
              </>
            ) : (
              <LinkButton color="inherit" to={"/login"}>
                로그인
              </LinkButton>
            )}
          </Stack>
        </Toolbar>
      </MuiAppBar>
    </>
  );
}

const LogoButton = createLink(Button);
