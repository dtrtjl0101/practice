import {
  Avatar,
  Button,
  Card,
  CardContent,
  CardHeader,
  Container,
  InputLabel,
  OutlinedInput,
  useTheme,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";
import API_CLIENT from "../api/api";
import useLogin from "../api/login/useLogin";
import { AuthState } from "../states/auth";

export const Route = createFileRoute("/register")({
  component: RouteComponent,
});

function RouteComponent() {
  const theme = useTheme();
  const { login } = useLogin();
  const navigate = Route.useNavigate();
  const [nickname, setNickname] = useState("");
  const [email, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);

  const onVerificationCodeButtonClick = useCallback(async () => {
    const response =
      await API_CLIENT.emailVerificationController.sendVerificationCode({
        email,
      });
    if (response.isSuccessful) {
      alert("인증코드가 발송되었습니다.");
      setIsCodeSent(true);
      return;
    }
    alert("인증코드 발송에 실패했습니다.");
  }, [email]);

  const onVerifyCodeButtonClick = useCallback(async () => {
    const response = await API_CLIENT.emailVerificationController.verifyCode({
      email,
      verificationCode,
    });
    if (response.isSuccessful) {
      alert("이메일 인증이 완료되었습니다.");
      setIsVerified(true);
      return;
    }
    alert("인증코드가 올바르지 않습니다.");
  }, [email, verificationCode]);

  const onRegisterButtonClick = useCallback(async () => {
    if (password !== confirmPassword) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }
    const response = await API_CLIENT.userController.userJoin({
      nickname,
      email,
      password,
      verificationCode,
      ...(profileImage ? { profileImage } : {}),
    });
    if (response.isSuccessful) {
      alert("회원가입이 완료되었습니다.");
      const loggedInUser = response.data as AuthState.LoggedInUser;
      login(loggedInUser);
      navigate({
        to: "/",
        replace: true,
      });
      return;
    }
    switch (response.errorCode) {
      case "NICKNAME_ALREADY_EXISTS": {
        alert("이미 존재하는 닉네임입니다.");
        break;
      }
    }
  }, [
    login,
    navigate,
    email,
    password,
    confirmPassword,
    nickname,
    verificationCode,
  ]);

  const profileImagePreviewUrl = useMemo(() => {
    if (!profileImage) {
      return "";
    }
    return URL.createObjectURL(profileImage);
  }, [profileImage]);

  return (
    <Container maxWidth="sm" sx={{ my: 8 }}>
      <Card>
        <CardHeader title="회원가입" />
        <CardContent
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: theme.spacing(2),
          }}
        >
          {!isCodeSent && (
            <>
              <InputLabel>E-mail</InputLabel>
              <OutlinedInput
                placeholder="bigfood@ajou.ac.kr"
                fullWidth
                value={email}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && email) {
                    onVerificationCodeButtonClick();
                  }
                }}
              />
              <Button
                fullWidth
                variant="contained"
                onClick={onVerificationCodeButtonClick}
                disabled={!email}
              >
                이메일 인증
              </Button>
            </>
          )}

          {isCodeSent && !isVerified && (
            <>
              <InputLabel>인증코드</InputLabel>
              <OutlinedInput
                placeholder="인증코드 입력"
                fullWidth
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && verificationCode) {
                    onVerifyCodeButtonClick();
                  }
                }}
              />
              <Button
                fullWidth
                variant="contained"
                onClick={onVerifyCodeButtonClick}
                disabled={!verificationCode}
              >
                인증코드 확인
              </Button>
              <Button fullWidth variant="outlined" disabled sx={{ mt: 1 }}>
                인증코드 재발송은 잠시 후 가능합니다
              </Button>
            </>
          )}

          {isVerified && (
            <>
              <InputLabel>프로필 이미지 (선택)</InputLabel>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: theme.spacing(2),
                }}
              >
                <Avatar
                  sx={{
                    width: 96,
                    height: 96,
                    cursor: "pointer",
                    mx: "auto",
                  }}
                  src={profileImagePreviewUrl}
                  onClick={() => {
                    const fileInput = document.createElement("input");
                    fileInput.type = "file";
                    fileInput.accept = "image/*";
                    fileInput.onchange = (e) => {
                      const target = e.target as HTMLInputElement;
                      const file = target.files?.[0] || null;
                      setProfileImage(file);
                    };
                    fileInput.click();
                  }}
                >
                  {!profileImage && <AddIcon />}
                </Avatar>
              </div>
              <InputLabel>Nickname</InputLabel>
              <OutlinedInput
                placeholder="Nickname"
                fullWidth
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
              />

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
                onKeyDown={(e) => {
                  if (
                    e.key === "Enter" &&
                    nickname &&
                    password &&
                    confirmPassword
                  ) {
                    onRegisterButtonClick();
                  }
                }}
              />
              <Button
                fullWidth
                variant="contained"
                onClick={onRegisterButtonClick}
              >
                가입하기
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}
