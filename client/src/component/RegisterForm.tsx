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
import { useCallback, useMemo, useState } from "react";
import { useSnackbar } from "notistack";
import API_CLIENT from "../api/api";
import useLogin from "../api/login/useLogin";
import { AuthState } from "../states/auth";

export default function RegisterForm({
  registerType,
  handleBack,
}: {
  registerType?: "member" | "publisher";
  handleBack: () => void;
}) {
  const theme = useTheme();
  const { login } = useLogin();
  const [nickname, setNickname] = useState("");
  const [email, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const { enqueueSnackbar } = useSnackbar();

  const onVerificationCodeButtonClick = useCallback(async () => {
    const response =
      await API_CLIENT.emailVerificationController.sendVerificationCode({
        email,
      });
    if (response.isSuccessful) {
      enqueueSnackbar("인증코드가 발송되었습니다.", { variant: "success" });
      setIsCodeSent(true);
      return;
    }
    enqueueSnackbar("인증코드 발송에 실패했습니다.", { variant: "error" });
  }, [email, enqueueSnackbar]);

  const onVerifyCodeButtonClick = useCallback(async () => {
    const response = await API_CLIENT.emailVerificationController.verifyCode({
      email,
      verificationCode,
    });
    if (response.isSuccessful) {
      enqueueSnackbar("이메일 인증이 완료되었습니다.", { variant: "success" });
      setIsVerified(true);
      return;
    }
    enqueueSnackbar("인증코드가 올바르지 않습니다.", { variant: "error" });
  }, [email, verificationCode, enqueueSnackbar]);

  const onRegisterButtonClick = useCallback(async () => {
    if (password !== confirmPassword) {
      enqueueSnackbar("비밀번호가 일치하지 않습니다.", { variant: "error" });
      return;
    }

    let response;

    if (registerType === "member") {
      response = await API_CLIENT.userController.userJoin({
        nickname,
        email,
        password,
        verificationCode,
        ...(profileImage ? { profileImage } : {}),
      });
    } else if (registerType === "publisher") {
      response = await API_CLIENT.publisherController.publisherJoin({
        publisherName: nickname,
        email,
        password,
        verificationCode,
        ...(profileImage ? { profileImage } : {}),
      });
    } else {
      enqueueSnackbar("잘못된 회원가입 유형입니다.", { variant: "error" });
      return;
    }

    if (response.isSuccessful) {
      enqueueSnackbar("회원가입이 완료되었습니다.", { variant: "success" });
      const loggedInUser = response.data as AuthState.LoggedInUser;
      login(loggedInUser);
      handleBack();
      return;
    }

    // 에러 처리
    switch (response.errorCode) {
      case "NICKNAME_ALREADY_EXISTS":
        enqueueSnackbar("이미 존재하는 닉네임입니다.", { variant: "error" });
        break;
    }
  }, [
    registerType,
    email,
    password,
    confirmPassword,
    nickname,
    verificationCode,
    profileImage,
    login,
    handleBack,
    enqueueSnackbar,
  ]);

  const profileImagePreviewUrl = useMemo(() => {
    if (!profileImage) {
      return "";
    }
    return URL.createObjectURL(profileImage);
  }, [profileImage]);

  return (
    <Container maxWidth="sm" sx={{ my: 8 }}>
      <Card variant="outlined">
        <CardHeader
          title={registerType == "member" ? "회원가입" : "출판사 회원가입"}
        />
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
              <InputLabel>
                {registerType == "member" ? "Nickname" : "Publisher Name"}
              </InputLabel>
              <OutlinedInput
                placeholder={
                  registerType == "member" ? "Nickname" : "Publisher Name"
                }
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
