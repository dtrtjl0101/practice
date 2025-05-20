import { GroupAdd, ShoppingCart } from "@mui/icons-material";
import {
  Container,
  Card,
  CardHeader,
  CardContent,
  Button,
  Stack,
  IconButton,
} from "@mui/material";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import BookList, { BookListKind } from "../../component/BookList";
import GroupCreateModal from "../../component/groupCreate/GroupCreateModal";
import GroupList, { GroupListKind } from "../../component/groupList";
import HighlightBrowserModal from "../../component/HighlightBrowserModal";

export const Route = createFileRoute("/_pathlessLayout/mypage")({
  component: RouteComponent,
});

function RouteComponent() {
  const [openHighlightBrowserModal, setOpenHighlightBrowserModal] =
    useState(false);

  return (
    <>
      <HighlightBrowserModal
        open={openHighlightBrowserModal}
        onClose={() => setOpenHighlightBrowserModal(false)}
      />
      <Container sx={{ my: 8 }}>
        <Stack spacing={4}>
          <Card>
            <CardHeader title="마이페이지" />
            <CardContent>
              <Button
                variant="contained"
                onClick={() => setOpenHighlightBrowserModal(true)}
              >
                하이라이트 관리
              </Button>
            </CardContent>
          </Card>
          <GroupsCards />
          <BooksCard />
        </Stack>
      </Container>
    </>
  );
}

function GroupsCards() {
  const [openGroupCreateModal, setOpenGroupCreateModal] = useState(false);

  return (
    <>
      <GroupCreateModal
        open={openGroupCreateModal}
        onClose={() => setOpenGroupCreateModal(false)}
      />
      <GroupList
        kind={GroupListKind.MY_GROUP}
        key="myGroups"
        size="small"
        title="내가 만든 모임"
        action={
          <IconButton onClick={() => setOpenGroupCreateModal(true)}>
            <GroupAdd />
          </IconButton>
        }
      />
      <GroupList
        kind={GroupListKind.JOINED_GROUP}
        key="participantGroups"
        size="small"
        title="가입된 모임"
        action={
          <IconButton onClick={() => setOpenGroupCreateModal(true)}>
            <GroupAdd />
          </IconButton>
        }
      />
    </>
  );
}

function BooksCard() {
  const navigate = Route.useNavigate();

  return (
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
  );
}
