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
import { Nightlight, Sunny } from "@mui/icons-material";

export default function AppBar() {
  const user = useAtomValue(AuthState.user);
  const [colorScheme, setColorScheme] = useAtom(State.UI.userColorScheme);
  const { logout } = useLogout();

  const onColorSchemeChangeButtonClicked = () => {
    setColorScheme((prev) => {
      const next = prev === "light" ? "dark" : "light";
      localStorage.setItem("colorScheme", next);
      return next;
    });
  };

  return (
    <MuiAppBar
      position="fixed"
      color="transparent"
      sx={{
        backdropFilter: "blur(10px)",
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar>
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
  );
}

const LogoButton = createLink(Button);
