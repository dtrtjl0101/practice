import {
  Toolbar,
  AppBar as MuiAppBar,
  Button,
  Divider,
  Avatar,
  Stack,
} from "@mui/material";
import { createLink } from "@tanstack/react-router";
import { useAtomValue } from "jotai";
import { AuthState } from "../states/auth";
import { Role } from "../types/role";
import useLogout from "../api/login/useLogout";
import LinkButton from "./LinkButton";

export default function AppBar() {
  const user = useAtomValue(AuthState.user);

  const { logout } = useLogout();

  return (
    <MuiAppBar position="static">
      <Toolbar>
        <LogoButton to="/" sx={{ mr: "auto" }}>
          <img src="/logoTitle.png" alt="Logo" height={40} />
        </LogoButton>
        <LinkButton color="inherit" to={"/books"} search={{ title: undefined }}>
          도서
        </LinkButton>
        <LinkButton color="inherit" to={"/groups"}>
          모임
        </LinkButton>
        <Divider orientation="vertical" flexItem variant="middle" />
        {user && user.role === Role.ROLE_ADMIN && (
          <>
            <LinkButton color="inherit" to={"/admin"}>
              관리자
            </LinkButton>
            <Divider orientation="vertical" flexItem variant="middle" />
          </>
        )}
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
            <Button color="inherit" onClick={logout}>
              로그아웃
            </Button>
          </>
        ) : (
          <LinkButton color="inherit" to={"/login"}>
            로그인
          </LinkButton>
        )}
      </Toolbar>
    </MuiAppBar>
  );
}

const LogoButton = createLink(Button);
