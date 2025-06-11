import {
  Container,
  Card,
  CardContent,
  OutlinedInput,
  Divider,
  Button,
  useTheme,
  CardHeader,
  Typography,
} from "@mui/material";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useSnackbar } from "notistack";
import useLogin from "../api/login/useLogin";
import { useCallback, useState } from "react";
import API_CLIENT from "../api/api";
import { AuthState } from "../states/auth";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { Role } from "../types/role";
import { Google } from "@mui/icons-material";
import { ENV } from "../env";
import { OAuthMessage } from "../types/oauthMessage";

export const Route = createFileRoute("/login")({
  component: RouteComponent,
});

function RouteComponent() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { login } = useLogin();
  const { enqueueSnackbar } = useSnackbar();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onLoginButtonClick = useCallback(async () => {
    const response = await API_CLIENT.loginFilterController.login({
      email,
      password,
    });

    if (!response.isSuccessful) {
      enqueueSnackbar("로그인에 실패했습니다.", { variant: "error" });
      console.error(response.errorCode);
      return;
    }

    const loggedInUser = response.data as AuthState.LoggedInUser;
    login(loggedInUser);
    if (loggedInUser.role === Role.ROLE_ADMIN) {
      navigate({
        to: "/mypage/admin",
        replace: true,
      });
    } else if (loggedInUser.role === Role.ROLE_PUBLISHER) {
      navigate({
        to: "/mypage/publisher",
        replace: true,
      });
    } else if (loggedInUser.role === Role.ROLE_USER) {
      navigate({
        to: "/",
        replace: true,
      });
    }
  }, [login, navigate, email, password]);

  const onGoogleLoginClick = useCallback(() => {
    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    API_CLIENT.loginFilterController.oauth2Login;

    const popup = window.open(
      `${ENV.CHAEKIT_API_ENDPOINT}/oauth2/authorization/google`,
      "oauth2_popup",
      `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`
    );

    if (!popup) {
      enqueueSnackbar("팝업이 차단되었습니다. 팝업 차단을 해제해주세요.", {
        variant: "error",
      });
      return;
    }

    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) {
        return;
      }
      const message = event.data as OAuthMessage;
      if (message.type === "OAUTH_SUCCESS") {
        const loggedInUser = message.user;

        login(loggedInUser);
        enqueueSnackbar("Google 로그인에 성공했습니다.", {
          variant: "success",
        });

        if (loggedInUser.role === Role.ROLE_ADMIN) {
          navigate({ to: "/mypage/admin", replace: true });
        } else if (loggedInUser.role === Role.ROLE_PUBLISHER) {
          navigate({ to: "/mypage/publisher", replace: true });
        } else {
          navigate({ to: "/mypage", replace: true });
        }

        popup.close();
        window.removeEventListener("message", handleMessage);
        return;
      }

      if (message.type === "OAUTH_ERROR") {
        enqueueSnackbar(`Google 로그인에 실패했습니다: ${message.error}`, {
          variant: "error",
        });
        popup.close();
        window.removeEventListener("message", handleMessage);
        return;
      }
    };

    window.addEventListener("message", handleMessage);

    const checkClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkClosed);
        window.removeEventListener("message", handleMessage);
      }
    }, 1000);
  }, [enqueueSnackbar, login, navigate]);

  return (
    <Container maxWidth="sm" sx={{ my: 8 }}>
      <Card variant="outlined">
        <CardHeader title="로그인" />
        <CardContent
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: theme.spacing(2),
          }}
        >
          <OutlinedInput
            placeholder="E-mail"
            fullWidth
            value={email}
            type="email"
            onChange={(e) => setEmail(e.target.value)}
          />
          <OutlinedInput
            placeholder="Password"
            fullWidth
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                onLoginButtonClick();
              }
            }}
          />
          <Divider />
          <Button fullWidth variant="contained" onClick={onLoginButtonClick}>
            로그인
          </Button>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<Google />}
            onClick={onGoogleLoginClick}
          >
            Google로 로그인
          </Button>
          <Button
            fullWidth
            variant="text"
            onClick={() => {
              navigate({
                to: "/register/member",
              });
            }}
          >
            회원가입
          </Button>
          <Typography
            variant="body2"
            color="text.secondary"
            gutterBottom
            sx={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "right",
            }}
          >
            <Typography
              component="span"
              onClick={() => {
                navigate({
                  to: "/register/publisher",
                });
              }}
              sx={{
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              출판사, 비즈니스 회원가입
            </Typography>
            <ArrowForwardIcon />
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
}
