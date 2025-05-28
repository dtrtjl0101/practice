import {
  Card,
  CardHeader,
  Stack,
  Button,
  CardContent,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  Checkbox,
  TableBody,
  Typography,
  Avatar,
  Box,
  LinearProgress,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import API_CLIENT from "../../api/api";
import PageNavigation from "../PageNavigation";

import {
  Cancel as CancelIcon,
  PersonAdd as PersonAddIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";

export default function PendingMemberCard({ groupId }: { groupId: number }) {
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedRequests, setSelectedRequests] = useState<number[]>([]);

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

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRequests(pendingRequests?.map((req) => req.userId!) || []);
    } else {
      setSelectedRequests([]);
    }
  };

  const handleSelectRequest = (userId: number, checked: boolean) => {
    if (checked) {
      setSelectedRequests((prev) => [...prev, userId]);
    } else {
      setSelectedRequests((prev) => prev.filter((id) => id !== userId));
    }
  };

  const handleBulkApprove = async () => {
    if (selectedRequests.length === 0) return;

    // 벌크 승인 로직
    for (const userId of selectedRequests) {
      await API_CLIENT.groupController.approveJoinRequest(groupId, userId);
    }

    setSelectedRequests([]);
    refetch();
    alert(`${selectedRequests.length}명의 신청이 승인되었습니다.`);
  };

  const handleBulkReject = async () => {
    if (selectedRequests.length === 0) return;

    // 벌크 거절 로직
    for (const userId of selectedRequests) {
      await API_CLIENT.groupController.rejectJoinRequest(groupId, userId);
    }

    setSelectedRequests([]);
    refetch();
    alert(`${selectedRequests.length}명의 신청이 거절되었습니다.`);
  };

  const onApproveButtonClicked = async (request: any) => {
    const response = await API_CLIENT.groupController.approveJoinRequest(
      groupId,
      request.userId!
    );
    if (!response.isSuccessful) {
      alert("요청 수락에 실패했습니다.");
      return;
    }
    refetch();
    alert("요청이 수락되었습니다.");
  };

  const onRejectButtonClicked = async (request: any) => {
    const response = await API_CLIENT.groupController.rejectJoinRequest(
      groupId,
      request.userId!
    );
    if (!response.isSuccessful) {
      alert("요청 거절에 실패했습니다.");
      return;
    }
    refetch();
    alert("요청이 거절되었습니다.");
  };

  return (
    <Card variant="outlined">
      <CardHeader
        title="가입 신청 관리"
        action={
          selectedRequests.length > 0 && (
            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                color="primary"
                size="small"
                onClick={handleBulkApprove}
              >
                선택 승인 ({selectedRequests.length})
              </Button>
              <Button
                variant="outlined"
                color="error"
                size="small"
                onClick={handleBulkReject}
              >
                선택 거절
              </Button>
            </Stack>
          )
        }
      />
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
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={
                        selectedRequests.length === pendingRequests?.length &&
                        pendingRequests.length > 0
                      }
                      indeterminate={
                        selectedRequests.length > 0 &&
                        selectedRequests.length < (pendingRequests?.length || 0)
                      }
                      onChange={(e) => handleSelectAll(e.target.checked)}
                    />
                  </TableCell>
                  <TableCell>사용자 정보</TableCell>
                  <TableCell>신청일</TableCell>
                  <TableCell>작업</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pendingRequests ? (
                  pendingRequests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                        <Stack spacing={2} alignItems="center">
                          <PersonAddIcon
                            sx={{ fontSize: 48, color: "text.disabled" }}
                          />
                          <Typography color="text.secondary">
                            대기 중인 가입 신청이 없습니다.
                          </Typography>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ) : (
                    pendingRequests.map((pending) => (
                      <TableRow key={pending.userId}>
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={selectedRequests.includes(pending.userId!)}
                            onChange={(e) =>
                              handleSelectRequest(
                                pending.userId!,
                                e.target.checked
                              )
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Stack
                            direction="row"
                            spacing={2}
                            alignItems="center"
                          >
                            <Avatar src={pending.profileImageURL} />
                            <Box>
                              <Typography variant="subtitle2">
                                {pending.nickname}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                ID: {pending.userId}
                              </Typography>
                            </Box>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {pending.createdAt
                              ? new Date(pending.createdAt).toLocaleString(
                                  "ko-KR"
                                )
                              : "-"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1}>
                            <Button
                              variant="contained"
                              color="primary"
                              size="small"
                              startIcon={<CheckCircleIcon />}
                              onClick={() => onApproveButtonClicked(pending)}
                            >
                              승인
                            </Button>
                            <Button
                              variant="outlined"
                              color="error"
                              size="small"
                              startIcon={<CancelIcon />}
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
                  <TableRow>
                    <TableCell colSpan={4}>
                      <LinearProgress />
                    </TableCell>
                  </TableRow>
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
