import { GroupAdd } from "@mui/icons-material";
import {
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { createFileRoute } from "@tanstack/react-router";
import GroupCreateModal from "../../../component/groupCreate/GroupCreateModal";
import { useState } from "react";

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
      <Stack spacing={2}>
        <Card>
          <CardHeader
            title="내 그룹"
            action={
              <IconButton onClick={() => setOpenGroupCreateModal(true)}>
                <GroupAdd />
              </IconButton>
            }
          />
          <CardContent>
            <Typography>[여기에 그룹 표시]</Typography>
          </CardContent>
        </Card>
        <Card>
          <CardHeader title="내가 속한 그룹" />
          <CardContent>
            <Typography>[여기에 그룹 표시]</Typography>
          </CardContent>
        </Card>
      </Stack>
    </>
  );
}
