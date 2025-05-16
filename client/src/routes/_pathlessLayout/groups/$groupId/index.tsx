import { createFileRoute } from "@tanstack/react-router";
import { GroupInfo } from "../../../../types/groups";
import { Container, Divider, Paper, Stack, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import API_CLIENT from "../../../../api/api";
import { useState } from "react";
import { ActivityCard } from "../../../../component/_pathlessLayout/groups/$groupId/ActivityCard";
import { GroupHeader } from "../../../../component/_pathlessLayout/groups/$groupId/GroupHeader";

export const Route = createFileRoute("/_pathlessLayout/groups/$groupId/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { groupId } = Route.useParams();
  const [joinGroupRequested, setJoinGroupRequested] = useState(false);

  const { data: group } = useQuery({
    queryKey: ["group", groupId],
    queryFn: async () => {
      const groupIdNumber = parseInt(groupId);
      if (isNaN(groupIdNumber)) {
        throw new Error("Invalid group ID");
      }
      const response = await API_CLIENT.groupController.getGroup(groupIdNumber);
      if (!response.isSuccessful) {
        throw new Error(response.errorMessage);
      }

      return response.data as GroupInfo;
    },
  });

  const handleJoinGroup = async () => {
    const groupIdNumber = parseInt(groupId);
    if (isNaN(groupIdNumber)) {
      alert("Invalid group ID");
      return;
    }
    const response =
      await API_CLIENT.groupController.requestJoinGroup(groupIdNumber);
    if (!response.isSuccessful) {
      alert(response.errorMessage);
      return;
    }
    setJoinGroupRequested(true);
    alert("모임 가입 요청이 완료되었습니다.");
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Stack spacing={4} sx={{ mb: 2 }}>
        <GroupHeader
          group={group}
          groupId={groupId}
          joinGroupRequested={joinGroupRequested}
          handleJoinGroup={handleJoinGroup}
        />
        <ActivityCard groupId={groupId} />
        <Paper sx={{ p: 2 }}>
          <Stack spacing={2}>
            <Typography variant="h4">모임 대화방</Typography>
            <Divider />
            <Typography variant="body1" sx={{ mt: 2 }}>
              현재활동
            </Typography>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
}
