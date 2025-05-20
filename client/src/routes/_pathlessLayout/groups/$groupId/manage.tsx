import {
  Avatar,
  Button,
  Card,
  CardContent,
  CardHeader,
  Container,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import API_CLIENT from "../../../../api/api";
import PageNavigation from "../../../../component/PageNavigation";

export const Route = createFileRoute("/_pathlessLayout/groups/$groupId/manage")(
  {
    component: RouteComponent,
    params: {
      parse: (params) => {
        const groupId = parseInt(params.groupId);
        if (isNaN(groupId)) {
          throw new Error("Invalid groupId");
        }
        return {
          groupId,
        };
      },
    },
  }
);

function RouteComponent() {
  return (
    <Container sx={{ my: 8 }}>
      <Stack spacing={4}>
        <PendingMemberCard />
        <MembersCard />
      </Stack>
    </Container>
  );
}

function PendingMemberCard() {
  const { groupId } = Route.useParams();

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const { data: pendingRequests, refetch } = useQuery({
    queryKey: ["pendingList", groupId, page],
    queryFn: async () => {
      const response = await API_CLIENT.groupController.getPendingList(
        groupId,
        {
          page,
          size: 20,
        }
      );
      if (!response.isSuccessful) {
        throw new Error(response.errorMessage);
      }
      setTotalPages(response.data.totalPages!);
      return response.data.content;
    },
    initialData: [],
  });

  const onApproveButtonClicked = async (
    request: NonNullable<typeof pendingRequests>[number]
  ) => {
    const response = await API_CLIENT.groupController.approveJoinRequest(
      groupId,
      request.userId!
    );
    if (!response.isSuccessful) {
      console.error("Failed to accept request:", response.errorMessage);
      alert("요청 수락에 실패했습니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    refetch();
    alert("요청이 수락되었습니다.");
  };
  const onRejectButtonClicked = async (
    request: NonNullable<typeof pendingRequests>[number]
  ) => {
    const response = await API_CLIENT.groupController.rejectJoinRequest(
      groupId,
      request.userId!
    );
    if (!response.isSuccessful) {
      console.error("Failed to reject request:", response.errorMessage);
      alert("요청 거절에 실패했습니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    refetch();
    alert("요청이 거절되었습니다.");
  };

  return (
    <Card>
      <CardHeader title="대기중인 모임원 가입 신청 목록" />
      <CardContent>
        <Stack spacing={2}>
          <PageNavigation
            pageZeroBased={page}
            setPage={setPage}
            totalPages={totalPages}
          />
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>닉네임</TableCell>
                  <TableCell>작업</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pendingRequests ? (
                  pendingRequests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        대기 중인 신청이 없습니다.
                      </TableCell>
                    </TableRow>
                  ) : (
                    pendingRequests.map((pending) => (
                      <TableRow key={pending.userId}>
                        <TableCell>{pending.userId}</TableCell>
                        <TableCell>
                          <Stack
                            direction={"row"}
                            spacing={1}
                            alignItems={"center"}
                          >
                            <Avatar src={pending.profileImageURL} />
                            <Typography>{pending.nickname}</Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Stack direction={"row"} spacing={1}>
                            <Button
                              variant="contained"
                              color="primary"
                              onClick={() => onApproveButtonClicked(pending)}
                            >
                              승인
                            </Button>
                            <Button
                              variant="contained"
                              color="error"
                              onClick={() => onRejectButtonClicked(pending)}
                            >
                              거절
                            </Button>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))
                  )
                ) : (
                  <Skeleton />
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <PageNavigation
            pageZeroBased={page}
            setPage={setPage}
            totalPages={totalPages}
          />
        </Stack>
      </CardContent>
    </Card>
  );
}

function MembersCard() {
  const { groupId } = Route.useParams();

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const { data: pendingRequests } = useQuery({
    queryKey: ["groupMembers", groupId, page],
    queryFn: async () => {
      const response = await API_CLIENT.groupController.getGroupMembers(
        groupId,
        {
          page,
          size: 20,
        }
      );
      if (!response.isSuccessful) {
        throw new Error(response.errorMessage);
      }
      setTotalPages(response.data.totalPages!);
      return response.data.content;
    },
    initialData: [],
  });

  return (
    <Card>
      <CardHeader title="모임원 목록" />
      <CardContent>
        <Stack spacing={2}>
          <PageNavigation
            pageZeroBased={page}
            setPage={setPage}
            totalPages={totalPages}
          />
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>닉네임</TableCell>
                  <TableCell>가입 신청일</TableCell>
                  <TableCell>승인일</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pendingRequests ? (
                  pendingRequests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        모임원이 없습니다
                      </TableCell>
                    </TableRow>
                  ) : (
                    pendingRequests.map((member) => (
                      <TableRow key={member.userId}>
                        <TableCell>{member.userId}</TableCell>
                        <TableCell>
                          <Stack
                            direction={"row"}
                            spacing={1}
                            alignItems={"center"}
                          >
                            <Avatar src={member.profileImageURL} />
                            <Typography>{member.nickname}</Typography>
                          </Stack>
                        </TableCell>

                        <TableCell>
                          {member.createdAt
                            ? new Date(member.createdAt).toLocaleString()
                            : "-"}
                        </TableCell>
                        <TableCell>
                          {member.approvedAt
                            ? new Date(member.approvedAt).toLocaleString()
                            : "-"}
                        </TableCell>
                      </TableRow>
                    ))
                  )
                ) : (
                  <Skeleton />
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <PageNavigation
            pageZeroBased={page}
            setPage={setPage}
            totalPages={totalPages}
          />
        </Stack>
      </CardContent>
    </Card>
  );
}
