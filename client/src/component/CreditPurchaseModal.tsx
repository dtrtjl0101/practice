import {
  Box,
  Button,
  Card,
  CardActionArea,
  Container,
  Grid,
  Modal,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import API_CLIENT from "../api/api";
import { useEffect, useState } from "react";
import { paymentSuccessToken } from "../types/paymentSuccessMessage";

export default function CreditPurchaseModal(props: {
  open: boolean;
  onClose: () => void;
  onPurchased?: () => void;
}) {
  const { open, onClose, onPurchased } = props;
  const [purchasing, setPurchasing] = useState(false);
  const [popup, setPopup] = useState<Window | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(
    null
  );

  const { data: myWallet, refetch: refetchMyWallet } = useQuery({
    queryKey: ["myWallet"],
    queryFn: async () => {
      const response = await API_CLIENT.creditController.getMyWallet();
      if (!response.isSuccessful) {
        throw new Error(response.errorMessage);
      }
      return response.data;
    },
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
      alert(response.errorMessage);
      setPurchasing(false);
      return;
    }
    const purchaseUrl = response.data;
    const popupWindow = window.open(
      purchaseUrl,
      "_blank",
      "width=500,height=700"
    );
    if (!popupWindow) {
      alert("팝업 차단을 해제해주세요.");
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
        alert("결제가 완료되었습니다.");
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
        <Container maxWidth="md">
          <Paper sx={{ width: "100%", height: "100%", padding: 4 }}>
            <Stack spacing={2}>
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
                    return (
                      <Grid key={product.id} size={6}>
                        <Card
                          variant="outlined"
                          elevation={selected ? 4 : 2}
                          sx={{
                            p: 2,
                          }}
                        >
                          <CardActionArea
                            onClick={() => setSelectedProductId(product.id!)}
                          >
                            <Typography
                              variant="h4"
                              color={selected ? "primary" : "textSecondary"}
                              fontWeight={700}
                            >
                              {(product.creditAmount || 0).toLocaleString()}
                              크레딧
                            </Typography>
                            <Typography
                              variant="h6"
                              color={selected ? "textPrimary" : "textSecondary"}
                              fontWeight={selected ? 700 : 400}
                            >
                              {(product.price || 0).toLocaleString()}원
                            </Typography>
                          </CardActionArea>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
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
                        alert("구매할 크레딧 상품을 선택해주세요.");
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
        </Container>
      </Box>
    </Modal>
  );
}
