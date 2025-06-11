import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Container, Typography, CircularProgress, Box } from "@mui/material";
import { useSnackbar } from "notistack";
import { AuthState } from "../../states/auth";
import { OAuthMessage } from "../../types/oauthMessage";
import API_CLIENT from "../../api/api";
import { getDefaultStore } from "jotai";
import State from "../../states";
import useLogin from "../../api/login/useLogin";

export const Route = createFileRoute("/oauth2/success")({
  component: OAuth2SuccessComponent,
  validateSearch: (search: Record<string, unknown>) => ({
    accessToken: search.accessToken as string,
    refreshToken: search.refreshToken as string,
  }),
});

function OAuth2SuccessComponent() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { accessToken, refreshToken } = Route.useSearch();
  const { login } = useLogin();

  useEffect(() => {
    if (!accessToken || !refreshToken) {
      if (window.opener) {
        window.opener.postMessage(
          {
            type: "OAUTH_ERROR",
            error: "토큰 정보가 없습니다",
          } as OAuthMessage,
          window.location.origin
        );
        window.close();
        return;
      }

      enqueueSnackbar("토큰 정보가 없습니다.", { variant: "error" });
      navigate({
        to: "/login",
        replace: true,
      });
      return;
    }

    const handleOAuth2Success = async () => {
      getDefaultStore().set(State.Auth.user, {
        accessToken,
        refreshToken,
      } as AuthState.LoggedInUser);
      const response = await API_CLIENT.userController.userInfo();

      if (!response.isSuccessful) {
        console.error(response.errorMessage);
        if (window.opener) {
          window.opener.postMessage(
            {
              type: "OAUTH_ERROR",
              error:
                response.errorMessage || "사용자 정보 조회에 실패했습니다.",
            } as OAuthMessage,
            window.location.origin
          );
          window.close();
          return;
        }

        enqueueSnackbar("사용자 정보 조회에 실패했습니다.", {
          variant: "error",
        });
        navigate({
          to: "/login",
          replace: true,
        });
        return;
      }

      const loggedInUser = {
        ...response.data,
        accessToken,
        refreshToken,
      } as AuthState.LoggedInUser;

      if (window.opener) {
        window.opener.postMessage(
          {
            type: "OAUTH_SUCCESS",
            user: loggedInUser,
          } as OAuthMessage,
          window.location.origin
        );
        window.close();
        return;
      }

      login(loggedInUser);
      enqueueSnackbar("Google 로그인에 성공했습니다.", {
        variant: "success",
      });
      navigate({
        to: "/",
        replace: true,
      });
    };

    handleOAuth2Success();
  }, [accessToken, refreshToken, navigate, enqueueSnackbar]);

  return (
    <Container maxWidth="sm" sx={{ my: 8 }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
        }}
      >
        <CircularProgress />
        <Typography variant="h6" color="text.secondary">
          로그인 처리 중...
        </Typography>
        <Typography variant="body2" color="text.secondary">
          잠시만 기다려주세요.
        </Typography>
      </Box>
    </Container>
  );
}
