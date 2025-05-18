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

export const Route = createFileRoute("/_pathlessLayout/books/$bookId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { bookId } = Route.useParams();
  const [purchasing, setPurchasing] = useState(false);

  const { data: book, isLoading } = useQuery({
    queryKey: ["book", bookId],
    queryFn: async () => {
      const response = await API_CLIENT.ebookController.getBook(Number(bookId));
      if (!response.isSuccessful) throw new Error(response.errorMessage);
      return response.data as BookMetadata;
    },
  });

  const handlePurchase = async () => {
    setPurchasing(true);
    const response = await API_CLIENT.ebookPurchaseController.purchaseEbook(
      Number(bookId)
    );
    setPurchasing(false);
    if (!response.isSuccessful) {
      alert(response.errorMessage);
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
                  {"price" in book && typeof book.price === "number"
                    ? book.price.toLocaleString() + "원"
                    : "-"}
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
                    bookId: `${book.id}`,
                  }}
                  variant="contained"
                >
                  도서 읽기
                </LinkButton>
              </Stack>
            </Stack>
          </Stack>
        )}
      </Paper>
    </Container>
  );
}
