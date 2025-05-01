import {
  Toolbar,
  AppBar as MuiAppBar,
  Button,
  Divider,
  Avatar,
} from "@mui/material";
import { createLink, Link, LinkComponentProps } from "@tanstack/react-router";
import { useAtomValue } from "jotai";
import { AuthState } from "../states/auth";
import { Role } from "../types/role";
import useLogout from "../api/login/useLogout";
import { JSX } from "react/jsx-runtime";

export default function AppBar() {
  const user = useAtomValue(AuthState.user);

  const { logout } = useLogout();

  return (
    <MuiAppBar position="static">
      <Toolbar>
        <LogoButton to="/" sx={{ mr: "auto" }}>
          <img src="/logoTitle.png" alt="Logo" height={40} />
        </LogoButton>
        <LinkNavButton to={"/books"} content="도서" />
        <LinkNavButton to={"/groups"} content="모임" />
        <Divider orientation="vertical" flexItem variant="middle" />
        {user && user.role === Role.ROLE_ADMIN && (
          <LinkNavButton to={"/admin"} content="관리자" />
        )}
        {user ? (
          <>
            <LinkNavButton
              to={"/mypage"}
              content={<Avatar src={user.profileImageURL} />}
            />
            <Button onClick={logout}>로그아웃</Button>
          </>
        ) : (
          <LinkNavButton to={"/login"} content="로그인" />
        )}
      </Toolbar>
    </MuiAppBar>
  );
}

const LogoButton = createLink(Button);

function LinkNavButton(props: {
  to: LinkComponentProps["to"];
  content: string | JSX.Element;
}) {
  const { to, content: text } = props;
  return (
    <Link to={to}>
      {({ isActive }) => {
        return (
          <Button
            color={isActive ? "primary" : "secondary"}
            sx={{ fontWeight: isActive ? "bold" : "regular" }}
          >
            {text}
          </Button>
        );
      }}
    </Link>
  );
}
