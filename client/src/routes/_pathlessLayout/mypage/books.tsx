import { ShoppingCart } from "@mui/icons-material";
import { IconButton, Stack } from "@mui/material";
import { createFileRoute } from "@tanstack/react-router";
import BookList, { BookListKind } from "../../../component/BookList";

export const Route = createFileRoute("/_pathlessLayout/mypage/books")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = Route.useNavigate();

  return (
    <Stack spacing={2} sx={{ padding: 2 }}>
      <BookList
        kind={BookListKind.PURCHASED_BOOK}
        size="large"
        title="구매한 도서"
        action={
          <IconButton
            onClick={() =>
              navigate({ to: "/books", search: { title: undefined } })
            }
          >
            <ShoppingCart />
          </IconButton>
        }
      />
    </Stack>
  );
}
