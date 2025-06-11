import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import API_CLIENT from "../api/api";
import { Box, CircularProgress, Stack, Typography } from "@mui/material";
import { paymentSuccessToken } from "../types/paymentSuccessMessage";
import State from "../states";
import { useAtom } from "jotai";

export const Route = createFileRoute("/credits/payment/success")({
  component: RouteComponent,
  validateSearch: (search) => {
    const pgToken = search["pg_token"] as string | undefined;
    if (!pgToken) {
      throw new Error("Missing pg_token");
    }
    return {
      pgToken,
    };
  },
});

function RouteComponent() {
  const { pgToken } = Route.useSearch();
  const [loggedInUser, setLoggedInUser] = useAtom(State.Auth.user);

  const { data, isLoading, error } = useQuery({
    queryKey: ["kakaoPaySuccess", pgToken],
    queryFn: async () => {
      if (!pgToken) {
        throw new Error("Missing pg_token");
      }
      const response = await API_CLIENT.creditController.kakaoPaySuccess({
        pg_token: pgToken,
      });
      if (!response.isSuccessful) {
        throw new Error(response.errorMessage);
      }
      const { data } = response;
      if (window.opener) {
        const opener = window.opener as Window;
        opener.postMessage(paymentSuccessToken);
      }
      if (loggedInUser?.firstPaymentBenefit == true) {
        setLoggedInUser((prev) => {
          // firstPaymentBenefit 해제
          if (!prev) return prev;
          return {
            ...prev,
            firstPaymentBenefit: false,
          };
        });
      }
      window.close();
      return data;
    },
    enabled: !!pgToken,
  });

  if (isLoading) {
    return (
      <RootContainer>
        <Stack spacing={2} justifyContent={"center"} alignItems="center">
          <CircularProgress />
          <Typography variant="h5">결제 처리 중입니다...</Typography>
        </Stack>
      </RootContainer>
    );
  }

  if (error) {
    return (
      <RootContainer>
        <Stack spacing={2} justifyContent={"center"} alignItems="center">
          <Typography variant="h5">결제 처리에 실패했습니다.</Typography>
          <Typography variant="body1">{error.message}</Typography>
        </Stack>
      </RootContainer>
    );
  }

  if (data) {
    return (
      <RootContainer>
        <Stack spacing={2} justifyContent={"center"} alignItems="center">
          <Typography variant="h5">결제가 완료되었습니다.</Typography>
          <Typography variant="body1">{data.creditProductName}</Typography>
          <Typography variant="body1">
            {data.paymentAmount} 크레딧이 충전되었습니다.
          </Typography>
          <Typography variant="body1">
            창을 닫고 원래 페이지로 돌아가세요
          </Typography>
        </Stack>
      </RootContainer>
    );
  }

  return null;
}

const RootContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <Box
      sx={{
        width: "100vw",
        height: "100vh",
        alignContent: "center",
        justifyContent: "center",
        display: "flex",
      }}
    >
      {children}
    </Box>
  );
};
