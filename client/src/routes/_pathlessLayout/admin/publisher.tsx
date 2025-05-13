import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  CircularProgress,
  Modal,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import API_CLIENT, { wrapApiResponse } from "../../../api/api";
import PageNavigation from "../../../component/PageNavigation";

export const Route = createFileRoute("/_pathlessLayout/admin/publisher")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <Stack spacing={4}>
      <PendingPublisherCard />
      <PublisherCard />
    </Stack>
  );
}

function PublisherCard() {
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const { data: publishers, isLoading } = useQuery({
    queryKey: ["publishers", page],
    queryFn: async () => {
      const response = await wrapApiResponse(
        API_CLIENT.adminController.fetchPublishers({
          page,
          size: 20,
        })
      );
      if (!response.isSuccessful) {
        throw new Error(response.errorMessage);
      }
      setTotalPages(response.data.totalPages!);
      return response.data.content;
    },
    initialData: [],
  });

  if (isLoading)
    return (
      <Card>
        <CircularProgress />
      </Card>
    );

  return (
    <Card>
      <CardHeader title="출판사 목록" />
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
                  <TableCell>출판사명</TableCell>
                  <TableCell>상태</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {publishers ? (
                  publishers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        출판사가 존재하지 않습니다
                      </TableCell>
                    </TableRow>
                  ) : (
                    publishers.map((publisher) => (
                      <TableRow key={publisher.publisherId}>
                        <TableCell>{publisher.publisherId}</TableCell>
                        <TableCell>
                          <Stack
                            direction={"row"}
                            spacing={1}
                            alignItems={"center"}
                          >
                            <Avatar src={publisher.profileImageURL} />
                            <Typography>{publisher.publisherName}</Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          {publisher.status === "PENDING"
                            ? "가입대기"
                            : "가입됨"}
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

function PendingPublisherCard() {
  const [rejectingPublisherId, setRejectingPublisherId] = useState<
    number | null
  >(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const {
    data: pendingPublishers,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["publisherApplications", page],
    queryFn: async () => {
      const response = await wrapApiResponse(
        API_CLIENT.adminController.fetchPendingList({
          page,
          size: 10,
        })
      );
      if (!response.isSuccessful) {
        throw new Error(response.errorMessage);
      }
      setTotalPages(response.data.totalPages!);
      return response.data.content;
    },
    initialData: [],
  });

  const onApproveButtonClicked = async (id: number) => {
    const response = await wrapApiResponse(
      API_CLIENT.adminController.acceptPublisher(id)
    );

    if (!response.isSuccessful) {
      console.error(response.errorMessage);
      alert("승인 처리 중 오류가 발생했습니다.");
    }
    refetch();
    alert(`출판사 신청 (ID: ${id})이 승인되었습니다.`);
  };

  const onRejectButtonClicked = async (id: number) => {
    setRejectingPublisherId(id);
  };

  if (isLoading)
    return (
      <Card>
        <CircularProgress />
      </Card>
    );

  return (
    <>
      <RejectPublisherModal
        open={rejectingPublisherId !== null}
        onClose={() => setRejectingPublisherId(null)}
        publisherId={rejectingPublisherId}
        onReject={() => {
          setRejectingPublisherId(null);
          refetch();
        }}
      />
      <Card>
        <CardHeader title="대기중인 출판사 가입 신청 목록" />
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
                    <TableCell>출판사명</TableCell>
                    <TableCell>신청일</TableCell>
                    <TableCell>작업</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pendingPublishers ? (
                    pendingPublishers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} align="center">
                          대기 중인 신청이 없습니다.
                        </TableCell>
                      </TableRow>
                    ) : (
                      pendingPublishers.map((pending) => (
                        <TableRow key={pending.publisherId}>
                          <TableCell>{pending.publisherId}</TableCell>
                          <TableCell>
                            <Stack
                              direction={"row"}
                              spacing={1}
                              alignItems={"center"}
                            >
                              <Avatar src={pending.profileImageURL} />
                              <Typography>{pending.publisherName}</Typography>
                            </Stack>
                          </TableCell>
                          <TableCell>
                            {new Date(pending.createdAt!).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Stack direction={"row"} spacing={1}>
                              <Button
                                variant="contained"
                                color="primary"
                                onClick={() =>
                                  onApproveButtonClicked(pending.publisherId!)
                                }
                              >
                                승인
                              </Button>
                              <Button
                                variant="contained"
                                color="error"
                                onClick={() =>
                                  onRejectButtonClicked(pending.publisherId!)
                                }
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
    </>
  );
}

function RejectPublisherModal(props: {
  open: boolean;
  onClose: () => void;
  publisherId: number | null;
  onReject: () => void;
}) {
  const { open, onClose, publisherId, onReject } = props;
  const [reason, setReason] = useState<string>("");

  const onRejectButtonClicked = async () => {
    if (!publisherId) return;
    const response = await wrapApiResponse(
      API_CLIENT.adminController.rejectPublisher(publisherId, {
        reason,
      })
    );
    if (!response.isSuccessful) {
      console.error(response.errorMessage);
      alert("거절 처리 중 오류가 발생했습니다.");
    }
    onClose();
    onReject();
    alert(`출판사 신청 (ID: ${publisherId})이 거절되었습니다.`);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          width: "100vw",
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Card>
          <CardHeader title="거절 사유" />
          <CardContent>
            <Stack spacing={2}>
              <Typography variant="body1">
                출판사 가입 신청을 거절하는 이유를 입력해주세요.
              </Typography>
              <TextField
                label="사유"
                multiline
                rows={4}
                fullWidth
                variant="outlined"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </Stack>
          </CardContent>
          <CardActions sx={{ justifyContent: "flex-end" }}>
            <Button
              variant="contained"
              color="primary"
              onClick={onRejectButtonClicked}
            >
              거절
            </Button>
            <Button variant="outlined" color="secondary" onClick={onClose}>
              취소
            </Button>
          </CardActions>
        </Card>
      </Box>
    </Modal>
  );
}
