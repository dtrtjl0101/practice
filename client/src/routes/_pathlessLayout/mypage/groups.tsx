import { GroupAdd } from "@mui/icons-material";
import { IconButton, Stack } from "@mui/material";
import { createFileRoute } from "@tanstack/react-router";
import GroupCreateModal from "../../../component/groupCreate/GroupCreateModal";
import { useState } from "react";
import GroupList, { GroupType } from "../../../component/groupList";

export const Route = createFileRoute("/_pathlessLayout/mypage/groups")({
  component: RouteComponent,
});

function RouteComponent() {
  const [openGroupCreateModal, setOpenGroupCreateModal] = useState(false);

  return (
    <>
      <GroupCreateModal
        open={openGroupCreateModal}
        onClose={() => setOpenGroupCreateModal(false)}
      />
      <Stack spacing={2} sx={{ padding: 2 }}>
        <GroupList
          type={GroupType.MY_GROUP}
          key="myGroups"
          size="small"
          title="내 모임"
          action={
            <IconButton onClick={() => setOpenGroupCreateModal(true)}>
              <GroupAdd />
            </IconButton>
          }
        />
        <GroupList
          type={GroupType.JOINED_GROUP}
          key="participantGroups"
          size="small"
          title="가입된 모임"
          action={
            <IconButton onClick={() => setOpenGroupCreateModal(true)}>
              <GroupAdd />
            </IconButton>
          }
        />
      </Stack>
    </>
  );
}
