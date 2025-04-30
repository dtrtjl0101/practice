import {
  Container,
  Card,
  CardContent,
  OutlinedInput,
  Divider,
  Button,
  useTheme,
  CardHeader,
} from "@mui/material";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import useLogin from "../../api/login/useLogin";
import { useCallback, useState } from "react";
import API_CLIENT, { wrapApiResponse } from "../../api/api";
import { Role } from "../../types/role";

export const Route = createFileRoute("/_pathlessLayout/login")({
  component: RouteComponent,
});

function RouteComponent() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { login } = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onLoginButtonClick = useCallback(async () => {
    const response = await wrapApiResponse(
      API_CLIENT.loginFilter.login({
        email,
        password,
      })
    );

    if (!response.isSuccessful) {
      // TODO: Handle error
      return;
    }

    const { userId, accessToken, role } = response.data;
    login({
      id: userId!,
      accessToken: accessToken!,
      role: role as Role,
      nickname: "닉네임",
      email,
    });
    navigate({
      to: "/",
      replace: true,
    });
  }, [login, navigate, email, password]);

  return (
    <Container maxWidth="sm" sx={{ mt: theme.spacing(4) }}>
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
            onChange={(e) => setEmail(e.target.value)}
          />
          <OutlinedInput
            placeholder="Password"
            fullWidth
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
                to: "/register",
              });
            }}
          >
            회원가입
          </Button>
        </CardContent>
      </Card>
    </Container>
  );
}
