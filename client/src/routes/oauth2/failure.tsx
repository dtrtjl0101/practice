import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Container, Typography, Button, Box, Alert } from "@mui/material";
import { useSnackbar } from "notistack";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { OAuthMessage } from "../../types/oauthMessage";

export const Route = createFileRoute("/oauth2/failure")({
  component: OAuth2FailureComponent,
  validateSearch: (search: Record<string, unknown>) => ({
    error: search.error as string,
  }),
});

function OAuth2FailureComponent() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { error } = Route.useSearch();

  useEffect(() => {
    if (window.opener) {
      window.opener.postMessage(
        {
          type: "OAUTH_ERROR",
          error: error || "unknown_error",
        } as OAuthMessage,
        window.location.origin
      );
      window.close();
      return;
    }

    enqueueSnackbar(`Google 로그인에 실패했습니다.: ${error}`, {
      variant: "error",
    });
  }, [enqueueSnackbar, error]);

  const handleReturnToLogin = () => {
    navigate({
      to: "/login",
      replace: true,
    });
  };

  const getErrorMessage = (errorCode?: string) => {
    switch (errorCode) {
      case "access_denied":
        return "사용자가 권한 요청을 거부했습니다.";
      case "invalid_request":
        return "잘못된 요청입니다.";
      case "unauthorized_client":
        return "인증되지 않은 클라이언트입니다.";
      case "unsupported_response_type":
        return "지원되지 않는 응답 타입입니다.";
      case "invalid_scope":
        return "잘못된 권한 범위입니다.";
      case "server_error":
        return "서버 오류가 발생했습니다.";
      case "temporarily_unavailable":
        return "서비스가 일시적으로 사용할 수 없습니다.";
      default:
        return "알 수 없는 오류가 발생했습니다.";
    }
  };

  return (
    <Container maxWidth="sm" sx={{ my: 8 }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 3,
        }}
      >
        <ErrorOutlineIcon color="error" sx={{ fontSize: 60 }} />

        <Typography variant="h5" color="error" textAlign="center">
          로그인 실패
        </Typography>

        <Alert severity="error" sx={{ width: "100%" }}>
          <Typography variant="body1" gutterBottom>
            Google 로그인 중 문제가 발생했습니다.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {getErrorMessage(error)}
          </Typography>
          {error && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: 1, display: "block" }}
            >
              오류 코드: {error}
            </Typography>
          )}
        </Alert>

        <Box sx={{ display: "flex", gap: 2, width: "100%" }}>
          <Button variant="contained" fullWidth onClick={handleReturnToLogin}>
            로그인 페이지로 돌아가기
          </Button>
        </Box>

        <Typography variant="body2" color="text.secondary" textAlign="center">
          문제가 지속되면 관리자에게 문의해주세요.
        </Typography>
      </Box>
    </Container>
  );
}
