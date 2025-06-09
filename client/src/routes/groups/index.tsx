import { Button, Container, IconButton, Stack } from "@mui/material";
import { createFileRoute } from "@tanstack/react-router";
import GroupList from "../../component/GroupList";
import GroupCreateModal from "../../component/groupCreate/GroupCreateModal";
import { useState } from "react";
import { Add } from "@mui/icons-material";

export const Route = createFileRoute("/groups/")({
  component: RouteComponent,
  validateSearch: (search) => {
    // 단일 문자열 또는 문자열 배열 모두 허용
    const terms = search.searchTerms;
    const normalized =
      typeof terms === "string"
        ? [terms]
        : Array.isArray(terms)
          ? terms
          : ([] as string[]);

    return {
      searchTerms: normalized,
    };
  },
});

function RouteComponent() {
  const { searchTerms } = Route.useSearch();
  const [openGroupCreateModal, setOpenGroupCreateModal] = useState(false);

  return (
    <Container sx={{ my: 8 }}>
      <GroupCreateModal
        open={openGroupCreateModal}
        onClose={() => setOpenGroupCreateModal(false)}
      />
      <Stack spacing={2}>
        <GroupList
          key="allGroups-large"
          size="large"
          keyPrefix="allGroups"
          title="모든 모임"
          initialSearchTerms={searchTerms}
          action={
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setOpenGroupCreateModal(true)}
            >
              모임 만들기
            </Button>
          }
        />
      </Stack>
    </Container>
  );
}
