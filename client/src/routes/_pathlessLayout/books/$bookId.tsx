import { Divider } from "@mui/material";
import {
  Button,
  CardMedia,
  Container,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import API_CLIENT from "../../../api/api";
import { BookMetadata } from "../../../types/book";
import LinkButton from "../../../component/LinkButton";
import CreditPurchaseModal from "../../../component/CreditPurchaseModal";

export const Route = createFileRoute("/_pathlessLayout/books/$bookId")({
  component: RouteComponent,
  params: {
    parse: (params) => {
      const bookId = Number(params.bookId);
      if (isNaN(bookId)) {
        throw new Error("Invalid book ID");
      }
      return { bookId };
    },
  },
});

function RouteComponent() {
  const { bookId } = Route.useParams();
  const [purchasing, setPurchasing] = useState(false);
  const [openCreditPurchaseModal, setOpenCreditPurchaseModal] = useState(false);

  const { data: book, isLoading } = useQuery({
    queryKey: ["book", bookId],
    queryFn: async () => {
      const response = await API_CLIENT.ebookController.getBook(bookId);
      if (!response.isSuccessful) throw new Error(response.errorMessage);
      return response.data as BookMetadata;
    },
  });

  const { data: readProgress } = useQuery({
    queryKey: ["readProgress", bookId],
    queryFn: async () => {
      const response =
        await API_CLIENT.readingProgressController.getMyProgress(bookId);
      if (!response.isSuccessful) throw new Error(response.errorMessage);
      return response.data;
    },
  });

  const handlePurchase = async () => {
    setPurchasing(true);
    const response =
      await API_CLIENT.ebookPurchaseController.purchaseEbook(bookId);
    setPurchasing(false);
    if (!response.isSuccessful) {
      switch (response.errorCode) {
        case "CREDIT_NOT_ENOUGH": {
          const shouldOpenCreditPurchaseModal = confirm(
            "잔액이 부족합니다. 충전하시겠습니까?"
          );
          if (shouldOpenCreditPurchaseModal) {
            setOpenCreditPurchaseModal(true);
          }
          break;
        }
        default: {
          alert(response.errorMessage);
          break;
        }
      }
      return;
    }
    alert("구매가 완료되었습니다!");
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Paper sx={{ p: 4 }}>
        {isLoading || !book ? (
          <Typography>로딩 중...</Typography>
        ) : (
          <Stack direction={{ xs: "column", md: "row" }} spacing={4}>
            <CardMedia
              image={book.bookCoverImageURL}
              sx={{
                width: 192,
                height: 256,
                borderRadius: 2,
                mb: 2,
              }}
            />
            <Stack spacing={2} flex={1}>
              <Typography variant="h4">{book.title}</Typography>
              <Typography variant="subtitle1" color="textSecondary">
                {book.author}
              </Typography>
              <Divider />
              <Typography variant="body1" sx={{ whiteSpace: "pre-line" }}>
                {book.description}
              </Typography>
              <Divider />
              <Stack direction="row" spacing={2} alignItems="center">
                <Typography
                  variant="body1"
                  color="textSecondary"
                  sx={{ minWidth: 80 }}
                >
                  가격
                </Typography>
                <Typography variant="h5" color="primary.main" fontWeight={700}>
                  {book.price.toLocaleString() + "원"}
                </Typography>
              </Stack>
              <Stack direction="row" spacing={2} alignItems="center">
                <Typography
                  variant="body1"
                  color="textSecondary"
                  sx={{ minWidth: 80 }}
                >
                  출간일
                </Typography>
                <Typography variant="body2">
                  {"publishedAt" in book && book.publishedAt
                    ? new Date(book.publishedAt as string).toLocaleDateString()
                    : "-"}
                </Typography>
              </Stack>

              <Stack spacing={2} direction="row" justifyContent="flex-end">
                <Button
                  variant="contained"
                  onClick={handlePurchase}
                  disabled={purchasing}
                >
                  {purchasing ? "구매 중..." : "구매하기"}
                </Button>
                <LinkButton
                  to="/reader/$bookId"
                  params={{
                    bookId,
                  }}
                  search={{
                    activityId: undefined,
                    temporalProgress: false,
                    initialPage: readProgress?.cfi,
                  }}
                  variant="contained"
                >
                  {`도서 읽기${readProgress?.percentage ? ` (${readProgress.percentage}%)` : ""}`}
                </LinkButton>
              </Stack>
            </Stack>
          </Stack>
        )}
      </Paper>
      <CreditPurchaseModal
        open={openCreditPurchaseModal}
        onClose={() => setOpenCreditPurchaseModal(false)}
        onPurchased={() => setOpenCreditPurchaseModal(false)}
      />
    </Container>
  );
}
