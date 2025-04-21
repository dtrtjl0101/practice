import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Container,
  Divider,
  InputLabel,
  OutlinedInput,
  useTheme,
} from "@mui/material";
import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useState } from "react";
import API_CLIENT, { wrapApiResponse } from "../../api/api";
import useLogin from "../../api/login/useLogin";
import { Role } from "../../types/role";

export const Route = createFileRoute("/_pathlessLayout/register")({
  component: RouteComponent,
});

function RouteComponent() {
  const theme = useTheme();
  const { login } = useLogin();
  const navigate = Route.useNavigate();
  const [nickname, setNickname] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const onRegisterButtonClick = useCallback(async () => {
    // TODO: Test username and password constraints

    if (password !== confirmPassword) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    const response = await wrapApiResponse(
      API_CLIENT.userController.userJoin({
        nickname,
        username,
        password,
      })
    );

    if (response.isSuccessful) {
      alert("회원가입이 완료되었습니다.");
      const { id, accessToken, nickname, username } = response.data;
      login({
        id: id!,
        accessToken: accessToken!,
        role: Role.ROLE_USER as Role,
        nickname: nickname!,
        username: username!,
      });
      navigate({
        to: "/",
        replace: true,
      });
      return;
    }
    switch (response.errorCode) {
      case "NICKNAME_EXISTS": {
        alert("이미 존재하는 닉네임입니다.");
        break;
      }
    }
  }, [login, navigate, username, password, confirmPassword]);

  return (
    <Container maxWidth="sm" sx={{ mt: theme.spacing(4) }}>
      <Card>
        <CardHeader title="회원가입" />
        <CardContent
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: theme.spacing(2),
          }}
        >
          <InputLabel>Nickname</InputLabel>
          <OutlinedInput
            placeholder="Nickname"
            fullWidth
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />

          <Divider />

          <InputLabel>ID</InputLabel>
          <OutlinedInput
            placeholder="ID"
            fullWidth
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <Divider />

          <InputLabel>Password</InputLabel>
          <OutlinedInput
            placeholder="Password"
            fullWidth
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <OutlinedInput
            placeholder="Confirm Password"
            fullWidth
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <Divider />

          <Button fullWidth variant="contained" onClick={onRegisterButtonClick}>
            가입하기
          </Button>
        </CardContent>
      </Card>
    </Container>
  );
}
