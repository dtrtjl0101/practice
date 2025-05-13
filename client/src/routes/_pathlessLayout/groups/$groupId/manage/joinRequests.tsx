import {
  Divider,
  IconButton,
  ListItem,
  ListItemText,
  Pagination,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { createFileRoute } from "@tanstack/react-router";
import { Cancel, Check } from "@mui/icons-material";
import API_CLIENT from "../../../../../api/api";

export const Route = createFileRoute(
  "/_pathlessLayout/groups/$groupId/manage/joinRequests"
)({
  component: RouteComponent,
});

type Request = {
  id: number;
  userId: number;
  groupId: number;
  status: string;
  createdAt: Date;
};

function RouteComponent() {
  const {} = Route.useParams();

  // TODO: Fetch join requests from the server
  const requests = [
    {
      id: 1,
      userId: 1,
      groupId: 1,
      status: "pending",
      createdAt: new Date(),
    },
    {
      id: 2,
      userId: 2,
      groupId: 1,
      status: "approved",
      createdAt: new Date(),
    },
  ];

  const handleAcceptRequest = async (request: Request) => {
    const response = await API_CLIENT.groupController.approveJoinRequest(
      request.groupId,
      request.userId
    );
    if (!response.isSuccessful) {
      console.error("Failed to accept request:", response.errorMessage);
      alert("요청 수락에 실패했습니다. 잠시 후 다시 시도해주세요.");
      return;
    }
    alert("요청이 수락되었습니다.");
    // TODO: refetch
  };
  const handleRejectRequest = async (_request: Request) => {
    // TODO
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Stack spacing={2}>
        <Typography variant="h5">승인 대기중 가입 요청</Typography>
        <Divider />
        <Stack spacing={2}>
          {requests.map((request: Request) => (
            <ListItem
              key={request.id}
              secondaryAction={
                <>
                  <IconButton onClick={() => handleAcceptRequest(request)}>
                    <Check />
                  </IconButton>
                  <IconButton onClick={() => handleRejectRequest(request)}>
                    <Cancel />
                  </IconButton>
                </>
              }
            >
              <ListItemText
                primary={`Request ID: ${request.id}`}
                secondary={`Group ID: ${request.groupId}`}
              />
            </ListItem>
          ))}
          <Divider />
          <Pagination count={10} sx={{ alignSelf: "center" }} />
        </Stack>
      </Stack>
    </Paper>
  );
}
