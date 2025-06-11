import {
  Box,
  Button,
  Card,
  CardActionArea,
  Grid,
  Modal,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import API_CLIENT from "../api/api";
import { useEffect, useState } from "react";
import { paymentSuccessToken } from "../types/paymentSuccessMessage";
import { setResponsiveStyleValueSm } from "../utils/setResponsiveStyleValue";
import { useAtom } from "jotai";
import State from "../states";

export default function CreditPurchaseModal(props: {
  open: boolean;
  onClose: () => void;
  onPurchased?: () => void;
}) {
  const [user, setUser] = useAtom(State.Auth.user);
  const { open, onClose, onPurchased } = props;
  const [purchasing, setPurchasing] = useState(false);
  const [popup, setPopup] = useState<Window | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(
    null,
  );
  const { enqueueSnackbar } = useSnackbar();

  const isUser = user && user.role === "ROLE_USER";

  const { data: myWallet, refetch: refetchMyWallet } = useQuery({
    queryKey: ["myWallet"],
    queryFn: async () => {
      const response = await API_CLIENT.creditController.getMyWallet();
      if (!response.isSuccessful) {
        throw new Error(response.errorMessage);
      }
      return response.data;
    },
    enabled: isUser,
  });

  const { data: creditProducts } = useQuery({
    queryKey: ["creditProducts"],
    queryFn: async () => {
      const response = await API_CLIENT.creditController.getCreditProductList();
      if (!response.isSuccessful) {
        throw new Error(response.errorMessage);
      }
      return response.data;
    },
    initialData: [],
  });

  const onPurchaseButtonClicked = async (creditProductId: number) => {
    setPurchasing(true);
    const response = await API_CLIENT.creditController.requestKakaoPay({
      creditProductId,
    });
    if (!response.isSuccessful) {
      enqueueSnackbar(response.errorMessage, { variant: "error" });
      setPurchasing(false);
      return;
    }
    const purchaseUrl = response.data;
    const popupWindow = window.open(
      purchaseUrl,
      "_blank",
      "width=500,height=700",
    );
    if (!popupWindow) {
      enqueueSnackbar("팝업 차단을 해제해주세요.", { variant: "warning" });
      setPurchasing(false);
      return;
    }
    setPopup(popupWindow);
    const popupCheckInterval = setInterval(() => {
      if (popupWindow.closed) {
        setPopup(null);
        setPurchasing(false);
        clearInterval(popupCheckInterval);
      }
    }, 500);
    return;
  };

  useEffect(() => {
    const listenMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data === paymentSuccessToken) {
        if (isUser && user.firstPaymentBenefit == true) {
          setUser((prev) => {
            // firstPaymentBenefit 해제
            if (!prev) return prev;
            return {
              ...prev,
              firstPaymentBenefit: false,
            };
          });
        }
        refetchMyWallet();
        if (popup) {
          popup.close();
          setPopup(null);
        }
        setPurchasing(false);
        if (onPurchased) {
          onPurchased();
        }
        onClose();
        enqueueSnackbar("결제가 완료되었습니다.", { variant: "success" });
      }
    };
    window.addEventListener("message", listenMessage);
    return () => {
      window.removeEventListener("message", listenMessage);
    };
  }, []);

  useEffect(() => {
    if (open) {
      return;
    }
    setPurchasing(false);
    setPopup(null);
  }, [open]);

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      >
        <Paper sx={{ padding: 4, overflowY: "auto", maxHeight: "80vh" }}>
          <Stack spacing={1}>
            <Typography variant="h5">크레딧 구매</Typography>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              spacing={2}
            >
              <Typography variant="h5">내 잔액</Typography>
              <Typography variant="h5" color="primary">
                {(myWallet?.balance || 0).toLocaleString() || 0} 크레딧
              </Typography>
            </Stack>
            <Stack spacing={2} justifyContent="center">
              <Grid container spacing={1} justifyContent="center">
                {creditProducts.map((product) => {
                  const selected = selectedProductId === product.id;
                  const bonus = isUser && user.firstPaymentBenefit ? 1.1 : 1;
                  const creditAmountWithBonus = Math.floor(
                    (product.creditAmount || 0) * bonus,
                  );
                  return (
                    <Grid
                      key={product.id}
                      size={setResponsiveStyleValueSm(12, 6)}
                    >
                      <Card variant="outlined">
                        <CardActionArea
                          onClick={() => setSelectedProductId(product.id!)}
                          sx={{
                            p: 2,
                          }}
                        >
                          <Typography
                            variant="h4"
                            color={selected ? "primary" : "textSecondary"}
                            fontWeight={700}
                            noWrap
                          >
                            {creditAmountWithBonus.toLocaleString()}
                            크레딧
                          </Typography>
                          <Typography
                            variant="h6"
                            color={selected ? "textPrimary" : "textSecondary"}
                            fontWeight={selected ? 700 : 400}
                            noWrap
                          >
                            {(product.price || 0).toLocaleString()}원
                          </Typography>
                        </CardActionArea>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
              {isUser && user.firstPaymentBenefit && (
                <Typography
                  variant="subtitle1"
                  color="warning.main"
                  fontWeight={600}
                >
                  첫 결제 프로모션 적용: 크레딧 10% 추가 제공!
                </Typography>
              )}

              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                spacing={1}
              >
                <Button
                  sx={{ mt: 2, width: "100%" }}
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    if (!selectedProductId) {
                      enqueueSnackbar("구매할 크레딧 상품을 선택해주세요.", {
                        variant: "warning",
                      });
                      return;
                    }
                    onPurchaseButtonClicked(selectedProductId);
                  }}
                  disabled={purchasing || !selectedProductId}
                >
                  {purchasing ? "구매 중..." : "구매하기"}
                </Button>
                <Button
                  sx={{ mt: 2, width: "100%" }}
                  variant="outlined"
                  color="secondary"
                  onClick={onClose}
                >
                  취소
                </Button>
              </Stack>
            </Stack>
          </Stack>
        </Paper>
      </Box>
    </Modal>
  );
}
