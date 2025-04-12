import { Toolbar, AppBar as MuiAppBar, Button } from "@mui/material";
import { createLink, Link } from "@tanstack/react-router";
import { useAtomValue } from "jotai";
import { AuthState } from "../states/auth";
import { Role } from "../types/role";
import useLogout from "../api/login/useLogout";

export default function AppBar() {
  const user = useAtomValue(AuthState.user);

  const { logout } = useLogout();

  return (
    <MuiAppBar position="static">
      <Toolbar>
        <LogoButton to="/" sx={{ mr: "auto" }}>
          <img src="/logoTitle.png" alt="Logo" height={40} />
        </LogoButton>

        {user && user.role === Role.ROLE_ADMIN && (
          <Link to="/admin">
            {({ isActive }) => {
              return (
                <Button color={isActive ? "primary" : "secondary"}>
                  관리자
                </Button>
              );
            }}
          </Link>
        )}
        {user ? (
          <Button onClick={logout}>로그아웃</Button>
        ) : (
          <Link to="/login">
            {({ isActive }) => {
              return (
                <Button color={isActive ? "primary" : "secondary"}>
                  로그인
                </Button>
              );
            }}
          </Link>
        )}
      </Toolbar>
    </MuiAppBar>
  );
}

const LogoButton = createLink(Button);
