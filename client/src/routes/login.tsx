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
import useLogin from "../api/login/useLogin";
import { useCallback, useState } from "react";
import API_CLIENT from "../api/api";
import { AuthState } from "../states/auth";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { Role } from "../types/role";

export const Route = createFileRoute("/login")({
  component: RouteComponent,
});

function RouteComponent() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { login } = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onLoginButtonClick = useCallback(async () => {
    const response = await API_CLIENT.loginFilterController.login({
      email,
      password,
    });

    if (!response.isSuccessful) {
      alert("로그인에 실패했습니다.");
      console.error(response.errorCode);
      return;
    }

    const loggedInUser = response.data as AuthState.LoggedInUser;
    login(loggedInUser);
    if ([Role.ROLE_PUBLISHER, Role.ROLE_ADMIN].includes(loggedInUser.role)) {
      navigate({
        to: "/mypage",
        replace: true,
      });
    } else if (loggedInUser.role === Role.ROLE_USER) {
      navigate({
        to: "/",
        replace: true,
      });
    }
  }, [login, navigate, email, password]);

  return (
    <Container maxWidth="sm" sx={{ my: 8 }}>
      <Card>
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
