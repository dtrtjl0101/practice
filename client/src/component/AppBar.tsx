import {
  Toolbar,
  AppBar as MuiAppBar,
  Button,
  Divider,
  Avatar,
  Stack,
  Switch,
  styled,
} from "@mui/material";
import { createLink } from "@tanstack/react-router";
import { useAtom, useAtomValue } from "jotai";
import { AuthState } from "../states/auth";
import { Role } from "../types/role";
import useLogout from "../api/login/useLogout";
import LinkButton from "./LinkButton";
import NotificationButton from "./NotificationButton";
import State from "../states";

export default function AppBar() {
  const user = useAtomValue(AuthState.user);
  const [colorScheme, setColorScheme] = useAtom(State.UI.userColorScheme);
  const { logout } = useLogout();

  const onColorSchemeChangeSwitchClicked = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setColorScheme(event.target.checked ? "dark" : "light");
    localStorage.setItem(
      "colorScheme",
      event.target.checked ? "dark" : "light"
    );
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
          <MaterialUISwitch
            value={colorScheme === "light"}
            onChange={onColorSchemeChangeSwitchClicked}
          />
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

const MaterialUISwitch = styled(Switch)(({ theme }) => ({
  width: 62,
  height: 34,
  padding: 7,
  "& .MuiSwitch-switchBase": {
    margin: 1,
    padding: 0,
    transform: "translateX(6px)",
    "&.Mui-checked": {
      color: "#fff",
      transform: "translateX(22px)",
      "& .MuiSwitch-thumb:before": {
        backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"><path fill="${encodeURIComponent(
          "#fff"
        )}" d="M4.2 2.5l-.7 1.8-1.8.7 1.8.7.7 1.8.6-1.8L6.7 5l-1.9-.7-.6-1.8zm15 8.3a6.7 6.7 0 11-6.6-6.6 5.8 5.8 0 006.6 6.6z"/></svg>')`,
      },
      "& + .MuiSwitch-track": {
        opacity: 1,
        backgroundColor: "#aab4be",
        ...theme.applyStyles("dark", {
          backgroundColor: "#8796A5",
        }),
      },
    },
  },
  "& .MuiSwitch-thumb": {
    backgroundColor: "#001e3c",
    width: 32,
    height: 32,
    "&::before": {
      content: "''",
      position: "absolute",
      width: "100%",
      height: "100%",
      left: 0,
      top: 0,
      backgroundRepeat: "no-repeat",
      backgroundPosition: "center",
      backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"><path fill="${encodeURIComponent(
        "#fff"
      )}" d="M9.305 1.667V3.75h1.389V1.667h-1.39zm-4.707 1.95l-.982.982L5.09 6.072l.982-.982-1.473-1.473zm10.802 0L13.927 5.09l.982.982 1.473-1.473-.982-.982zM10 5.139a4.872 4.872 0 00-4.862 4.86A4.872 4.872 0 0010 14.862 4.872 4.872 0 0014.86 10 4.872 4.872 0 0010 5.139zm0 1.389A3.462 3.462 0 0113.471 10a3.462 3.462 0 01-3.473 3.472A3.462 3.462 0 016.527 10 3.462 3.462 0 0110 6.528zM1.665 9.305v1.39h2.083v-1.39H1.666zm14.583 0v1.39h2.084v-1.39h-2.084zM5.09 13.928L3.616 15.4l.982.982 1.473-1.473-.982-.982zm9.82 0l-.982.982 1.473 1.473.982-.982-1.473-1.473zM9.305 16.25v2.083h1.389V16.25h-1.39z"/></svg>')`,
    },
    ...theme.applyStyles("dark", {
      backgroundColor: "#003892",
    }),
  },
  "& .MuiSwitch-track": {
    opacity: 1,
    backgroundColor: "#aab4be",
    borderRadius: 20 / 2,
    ...theme.applyStyles("dark", {
      backgroundColor: "#8796A5",
    }),
  },
}));
