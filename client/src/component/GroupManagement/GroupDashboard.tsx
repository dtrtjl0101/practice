import { Grid, Paper, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import API_CLIENT from "../../api/api";
import {
  PersonAdd as PersonAddIcon,
  Group as GroupIcon,
  Notifications as NotificationsIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";

export default function GroupDashboard({ groupId }: { groupId: number }) {
  const { data: groupMembersResponse } = useQuery({
    queryKey: ["groupMembersResponse", groupId],
    queryFn: async () => {
      const response = await API_CLIENT.groupController.getGroupMembers(
        groupId,
        {
          size: 5000,
        }
      );
      if (!response.isSuccessful) {
        throw new Error(response.errorMessage);
      }
      return response.data;
    },
    initialData: {},
  });

  const totalMembers = groupMembersResponse.totalItems;

  const approvedMembers = groupMembersResponse.content?.filter(
    (member) => member.isApproved
  );

  const pendingMembers = groupMembersResponse.content?.filter(
    (member) => !member.isApproved
  );
  const newMembersThisMonth = groupMembersResponse.content
    ?.filter(
      (member) =>
        member.approvedAt &&
        member.approvedAt.slice(0, 7) === new Date().toISOString().slice(0, 7)
    )
    .map((member) => member.approvedAt)?.length;

  return (
    <Grid container spacing={3} sx={{ "& > *": { minWidth: 140 } }}>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Paper sx={{ p: 3, textAlign: "center" }} variant="outlined">
          <GroupIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
          <Typography variant="h4" fontWeight="bold">
            {totalMembers}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            총 멤버 수
          </Typography>
        </Paper>
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Paper sx={{ p: 3, textAlign: "center" }} variant="outlined">
          <NotificationsIcon color="warning" sx={{ fontSize: 40, mb: 1 }} />
          <Typography variant="h4" fontWeight="bold">
            {pendingMembers?.length || 0}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            대기 중인 신청
          </Typography>
        </Paper>
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Paper sx={{ p: 3, textAlign: "center" }} variant="outlined">
          <CheckCircleIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
          <Typography variant="h4" fontWeight="bold">
            {approvedMembers?.length || 0}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            활동 중인 멤버
          </Typography>
        </Paper>
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Paper sx={{ p: 3, textAlign: "center" }} variant="outlined">
          <PersonAddIcon color="info" sx={{ fontSize: 40, mb: 1 }} />
          <Typography variant="h4" fontWeight="bold">
            +{newMembersThisMonth}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            이번 달 신규 멤버
          </Typography>
        </Paper>
      </Grid>
    </Grid>
  );
}
