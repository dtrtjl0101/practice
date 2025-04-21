import { Toolbar, AppBar as MuiAppBar, Button } from "@mui/material";
import { createLink, Link, LinkComponentProps } from "@tanstack/react-router";
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
          <LinkNavButton to={"/admin"} text="관리자" />
        )}
        {user ? (
          <>
            <LinkNavButton to={"/books"} text="도서" />
            <LinkNavButton to={"/mypage"} text="마이페이지" />
            <Button onClick={logout}>로그아웃</Button>
          </>
        ) : (
          <LinkNavButton to={"/login"} text="로그인" />
        )}
      </Toolbar>
    </MuiAppBar>
  );
}

const LogoButton = createLink(Button);

function LinkNavButton(props: { to: LinkComponentProps["to"]; text: string }) {
  const { to, text } = props;
  return (
    <Link to={to}>
      {({ isActive }) => {
        return (
          <Button color={isActive ? "primary" : "secondary"}>{text}</Button>
        );
      }}
    </Link>
  );
}
