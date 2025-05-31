import { useMemo, useState } from "react";
import {
  Container,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Button,
  Tabs,
  Tab,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar,
  Stack,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Divider,
  CardMedia,
  CircularProgress,
  TablePagination,
} from "@mui/material";
import {
  AdminPanelSettings,
  Business,
  Person,
  MenuBook,
  MoreVert,
  Check,
  Close,
  Download,
  Email,
  Search,
  Refresh,
} from "@mui/icons-material";
import { createFileRoute } from "@tanstack/react-router";
import { useAtomValue } from "jotai";
import { AuthState } from "../../../states/auth";
import { Role } from "../../../types/role";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import API_CLIENT from "../../../api/api";
import { BookRequest } from "../../../types/book";

export const Route = createFileRoute("/mypage/admin/")({
  component: RouteComponent,
});

// 타입 정의
interface Publisher {
  publisherId: number;
  publisherName: string;
  profileImageURL: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
}

interface User {
  userId: number;
  nickname: string;
  profileImageURL: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

function RouteComponent() {
  const user = useAtomValue(AuthState.user);
  const isAdmin = user && user?.role === Role.ROLE_ADMIN;
  const queryClient = useQueryClient();

  const [currentTab, setCurrentTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // 페이지네이션 상태
  const [publisherPage, setPublisherPage] = useState(0);
  const [userPage, setUserPage] = useState(0);
  const [bookPage, setBookPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // 다이얼로그 상태
  const [openPublisherDialog, setOpenPublisherDialog] = useState(false);
  const [selectedPublisher, setSelectedPublisher] = useState<Publisher | null>(
    null
  );
  const [openUserDialog, setOpenUserDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [openBookDialog, setOpenBookDialog] = useState(false);
  const [selectedBook, setSelectedBook] = useState<BookRequest | null>(null);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  // 출판사 목록 조회
  const { data: publishers } = useQuery({
    queryKey: ["adminPublishers"],
    queryFn: async () => {
      const response = await API_CLIENT.adminController.fetchPublishers();
      if (!response.isSuccessful) {
        throw new Error(response.errorMessage);
      }
      return response.data.content as Publisher[];
    },
    enabled: isAdmin,
    initialData: [] as Publisher[],
  });

  // const { data: pendingPublishers } = useQuery({
  //   queryKey: ["adminPendingPublishers"],
  //   queryFn: async () => {
  //     const response = await API_CLIENT.adminController.fetchPendingList();
  //     if (!response.isSuccessful) {
  //       throw new Error(response.errorMessage);
  //     }
  //     return response.data.content as Publisher[];
  //   },
  //   enabled: isAdmin,
  //   initialData: [] as Publisher[],
  // });

  // 유저 목록 조회
  const { data: users } = useQuery({
    queryKey: ["adminUsers"],
    queryFn: async () => {
      const response = await API_CLIENT.adminController.fetchUsers();
      if (!response.isSuccessful) {
        throw new Error(response.errorMessage);
      }
      return response.data.content as User[];
    },
    enabled: isAdmin,
    initialData: [] as User[],
  });

  // 출판물 요청 목록 조회
  const { data: bookRequests } = useQuery({
    queryKey: ["adminBookRequests"],
    queryFn: async () => {
      const response =
        await API_CLIENT.ebookRequestController.getEbookRequests();
      if (!response.isSuccessful) {
        throw new Error(response.errorMessage);
      }
      return response.data.content as BookRequest[];
    },
    enabled: isAdmin,
    initialData: [] as BookRequest[],
  });

  // 필터링된 데이터
  const filteredPublishers = useMemo(() => {
    return publishers.filter((publisher) => {
      const matchesSearch = publisher.publisherName
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "ALL" || publisher.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [publishers, searchTerm, statusFilter]);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      return user.nickname.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [users, searchTerm]);

  const filteredBooks = useMemo(() => {
    return bookRequests.filter((book) => {
      const matchesSearch =
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "ALL" || book.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [bookRequests, searchTerm, statusFilter]);

  // 상태별 카운트
  const publisherStats = useMemo(() => {
    const pending = publishers.filter((p) => p.status === "PENDING").length;
    const approved = publishers.filter((p) => p.status === "APPROVED").length;
    const rejected = publishers.filter((p) => p.status === "REJECTED").length;
    return { pending, approved, rejected, total: publishers.length };
  }, [publishers]);

  // 출판사 승인/거부 뮤테이션
  const updatePublisherMutation = useMutation({
    mutationFn: async ({
      publisherId,
      action,
      reason,
    }: {
      publisherId: number;
      action: "APPROVE" | "REJECT";
      reason?: string;
    }) => {
      const response =
        action === "APPROVE"
          ? await API_CLIENT.adminController.acceptPublisher(publisherId)
          : await API_CLIENT.adminController.rejectPublisher(publisherId, {
              reason: reason ?? "",
            });
      if (!response.isSuccessful) {
        throw new Error(response.errorMessage);
      }
      return response.data;
    },
    onSuccess: () => {
      alert("출판사 상태가 업데이트되었습니다.");
      queryClient.invalidateQueries({ queryKey: ["adminPublishers"] });
      setOpenPublisherDialog(false);
    },
  });

  // 출판물 승인/거부 뮤테이션
  const updateBookMutation = useMutation({
    mutationFn: async ({
      requestId,
      action,
      reason,
    }: {
      requestId: number;
      action: "APPROVE" | "REJECT";
      reason?: string;
    }) => {
      const response =
        action === "APPROVE"
          ? await API_CLIENT.ebookRequestController.approveRequest(requestId)
          : await API_CLIENT.ebookRequestController.rejectRequest(requestId, {
              reason: reason ?? "",
            });
      if (!response.isSuccessful) {
        throw new Error(response.errorMessage);
      }
      return response.data;
    },
    onSuccess: () => {
      alert("출판물 상태가 업데이트되었습니다.");
      queryClient.invalidateQueries({ queryKey: ["adminBookRequests"] });
      setOpenBookDialog(false);
    },
  });

  // 요약 통계 카드
  const SummaryCards = () => (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Card variant="outlined">
          <CardContent>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
            >
              <Box>
                <Typography
                  color="textSecondary"
                  gutterBottom
                  variant="overline"
                >
                  총 출판사
                </Typography>
                <Typography variant="h4">{publisherStats.total}</Typography>
                <Typography variant="body2" color="warning.main">
                  승인 대기: {publisherStats.pending}
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: "primary.main" }}>
                <Business />
              </Avatar>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Card variant="outlined">
          <CardContent>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
            >
              <Box>
                <Typography
                  color="textSecondary"
                  gutterBottom
                  variant="overline"
                >
                  총 사용자
                </Typography>
                <Typography variant="h4">{users.length}</Typography>
                <Typography variant="body2" color="textSecondary">
                  활성 사용자
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: "success.main" }}>
                <Person />
              </Avatar>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Card variant="outlined">
          <CardContent>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
            >
              <Box>
                <Typography
                  color="textSecondary"
                  gutterBottom
                  variant="overline"
                >
                  출판물 요청
                </Typography>
                <Typography variant="h4">??</Typography>
                <Typography variant="body2" color="warning.main">
                  승인 대기: {bookRequests.length}
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: "info.main" }}>
                <MenuBook />
              </Avatar>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Card variant="outlined">
          <CardContent>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
            >
              <Box>
                <Typography
                  color="textSecondary"
                  gutterBottom
                  variant="overline"
                >
                  승인률
                </Typography>
                <Typography variant="h4" color="success.main">
                  {/* {bookStats.total > 0
                    ? Math.round((bookStats.approved / bookStats.total) * 100)
                    : 0}
                  % */}
                  ??
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  출판물 기준
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: "success.main" }}>
                <Check />
              </Avatar>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  // 검색 및 필터 섹션
  const SearchAndFilter = () => (
    <Paper sx={{ p: 2, mb: 3 }} variant="outlined">
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        alignItems="center"
      >
        <TextField
          placeholder="검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="small"
          sx={{ flexGrow: 1 }}
          InputProps={{
            startAdornment: <Search sx={{ color: "action.active", mr: 1 }} />,
          }}
        />
        {(currentTab === 0 || currentTab === 2) && (
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>상태</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              label="상태"
            >
              <MenuItem value="ALL">전체</MenuItem>
              <MenuItem value="PENDING">대기중</MenuItem>
              <MenuItem value="APPROVED">승인됨</MenuItem>
              <MenuItem value="REJECTED">거부됨</MenuItem>
            </Select>
          </FormControl>
        )}
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={() => {
            queryClient.invalidateQueries({ queryKey: ["adminPublishers"] });
            queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
            queryClient.invalidateQueries({ queryKey: ["adminBookRequests"] });
          }}
        >
          새로고침
        </Button>
      </Stack>
    </Paper>
  );

  if (!isAdmin) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">관리자 권한이 필요합니다.</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* 헤더 */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
      >
        <Box>
          <Stack direction="row" spacing={2} alignItems="center">
            <AdminPanelSettings fontSize="large" color="primary" />
            <Typography variant="h4" gutterBottom>
              관리자 대시보드
            </Typography>
          </Stack>
          <Typography variant="body1" color="textSecondary">
            일반 사용자, 출판사 및 출판물 관리
          </Typography>
        </Box>
      </Box>

      {/* 요약 통계 */}
      <SummaryCards />

      {/* 검색 및 필터 */}
      <SearchAndFilter />

      {/* 탭 네비게이션 */}
      <Paper sx={{ mb: 3 }} variant="outlined">
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          sx={{ borderBottom: 1, borderColor: "divider" }}
        >
          <Tab
            icon={<Business />}
            label={`출판사 관리 (${publisherStats.total})`}
          />
          <Tab icon={<Person />} label={`사용자 관리 (${users.length})`} />
          <Tab
            icon={<MenuBook />}
            label={`출판물 요청 (${bookRequests.length})`}
          />
        </Tabs>

        {/* 출판사 관리 탭 */}
        <TabPanel value={currentTab} index={0}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>출판사명</TableCell>
                  <TableCell>이메일</TableCell>
                  <TableCell>등록일</TableCell>
                  <TableCell>상태</TableCell>
                  <TableCell align="center">관리</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredPublishers
                  .slice(
                    publisherPage * rowsPerPage,
                    publisherPage * rowsPerPage + rowsPerPage
                  )
                  .map((publisher) => (
                    <TableRow
                      key={publisher.publisherId}
                      hover
                      sx={{ cursor: "pointer" }}
                      onClick={() => {
                        setSelectedPublisher(publisher);
                        setOpenPublisherDialog(true);
                      }}
                    >
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight={600}>
                          {publisher.publisherName}
                        </Typography>
                      </TableCell>
                      {/* <TableCell>{publisher.publisherEmail}</TableCell> */}
                      <TableCell>이메일</TableCell>
                      <TableCell>
                        {new Date(publisher.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={
                            publisher.status === "PENDING"
                              ? "대기중"
                              : publisher.status === "APPROVED"
                                ? "승인됨"
                                : "거부됨"
                          }
                          color={
                            publisher.status === "PENDING"
                              ? "warning"
                              : publisher.status === "APPROVED"
                                ? "success"
                                : "error"
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton size="small" color="primary">
                          <MoreVert />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={filteredPublishers.length}
            page={publisherPage}
            onPageChange={(_, newPage) => setPublisherPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) =>
              setRowsPerPage(parseInt(e.target.value, 10))
            }
          />
        </TabPanel>

        {/* 사용자 관리 탭 */}
        <TabPanel value={currentTab} index={1}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>사용자명</TableCell>
                  <TableCell>이메일</TableCell>
                  <TableCell>역할</TableCell>
                  <TableCell>등록일</TableCell>
                  <TableCell>상태</TableCell>
                  <TableCell align="center">관리</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers
                  .slice(
                    userPage * rowsPerPage,
                    userPage * rowsPerPage + rowsPerPage
                  )
                  .map((user) => (
                    <TableRow
                      key={user.userId}
                      hover
                      sx={{ cursor: "pointer" }}
                      onClick={() => {
                        setSelectedUser(user);
                        setOpenUserDialog(true);
                      }}
                    >
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight={600}>
                          {user.nickname}
                        </Typography>
                      </TableCell>
                      {/* <TableCell>{user.email}</TableCell> */}
                      <TableCell>이메일</TableCell>
                      <TableCell>
                        <Chip
                          label={
                            user.role === "ROLE_ADMIN"
                              ? "관리자"
                              : user.role === "ROLE_PUBLISHER"
                                ? "출판사"
                                : "사용자"
                          }
                          color={
                            user.role === "ROLE_ADMIN"
                              ? "error"
                              : user.role === "ROLE_PUBLISHER"
                                ? "warning"
                                : "default"
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(user.registeredAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={user.isActive ? "활성" : "비활성"}
                          color={user.isActive ? "success" : "default"}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton size="small" color="primary">
                          <MoreVert />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={filteredUsers.length}
            page={userPage}
            onPageChange={(_, newPage) => setUserPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) =>
              setRowsPerPage(parseInt(e.target.value, 10))
            }
          />
        </TabPanel>

        {/* 출판물 요청 관리 탭 */}
        <TabPanel value={currentTab} index={2}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>도서</TableCell>
                  <TableCell>출판사</TableCell>
                  <TableCell align="right">가격</TableCell>
                  <TableCell>요청일</TableCell>
                  <TableCell align="center">관리</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredBooks
                  .slice(
                    bookPage * rowsPerPage,
                    bookPage * rowsPerPage + rowsPerPage
                  )
                  .map((book) => (
                    <TableRow
                      key={book.requestId}
                      hover
                      sx={{ cursor: "pointer" }}
                      onClick={() => {
                        setSelectedBook(book);
                        setOpenBookDialog(true);
                      }}
                    >
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Avatar
                            src={book.coverImageURL}
                            variant="rounded"
                            sx={{ width: 40, height: 50 }}
                          >
                            {book.title[0]}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" fontWeight={600}>
                              {book.title}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              {book.author}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {book.publisherName}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight={600}>
                          ₩{book.price.toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell>{new Date().toLocaleDateString()}</TableCell>
                      <TableCell align="center">
                        <IconButton size="small" color="primary">
                          <MoreVert />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={filteredBooks.length}
            page={bookPage}
            onPageChange={(_, newPage) => setBookPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) =>
              setRowsPerPage(parseInt(e.target.value, 10))
            }
          />
        </TabPanel>
      </Paper>

      {/* 출판사 상세 다이얼로그 */}
      {selectedPublisher && (
        <PublisherDetailDialog
          publisher={selectedPublisher}
          open={openPublisherDialog}
          onClose={() => setOpenPublisherDialog(false)}
          onUpdate={(action, reason) => {
            updatePublisherMutation.mutate({
              publisherId: selectedPublisher.publisherId,
              action,
              reason,
            });
          }}
        />
      )}

      {/* 사용자 상세 다이얼로그 */}
      {selectedUser && (
        <UserDetailDialog
          user={selectedUser}
          open={openUserDialog}
          onClose={() => setOpenUserDialog(false)}
        />
      )}

      {/* 출판물 상세 다이얼로그 */}
      {selectedBook && (
        <BookDetailDialog
          book={selectedBook}
          open={openBookDialog}
          onClose={() => setOpenBookDialog(false)}
          onUpdate={(action, reason) => {
            updateBookMutation.mutate({
              requestId: selectedBook.requestId,
              action,
              reason,
            });
          }}
        />
      )}
    </Container>
  );
}

// 출판사 상세 다이얼로그
function PublisherDetailDialog({
  publisher,
  open,
  onClose,
  onUpdate,
}: {
  publisher: Publisher;
  open: boolean;
  onClose(): void;
  onUpdate(action: "APPROVE" | "REJECT", reason?: string): void;
}) {
  const [rejectReason, setRejectReason] = useState("");

  const handleApprove = () => {
    onUpdate("APPROVE");
  };

  const handleReject = () => {
    if (!rejectReason.trim()) {
      alert("거부 사유를 입력해주세요.");
      return;
    }
    onUpdate("REJECT", rejectReason);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>출판사 상세 정보</DialogTitle>
      <DialogContent>
        <Stack spacing={3}>
          <Box>
            <Typography variant="h5" gutterBottom>
              {publisher.publisherName}
            </Typography>
            <Chip
              label={
                publisher.status === "PENDING"
                  ? "승인 대기"
                  : publisher.status === "APPROVED"
                    ? "승인됨"
                    : "거부됨"
              }
              color={
                publisher.status === "PENDING"
                  ? "warning"
                  : publisher.status === "APPROVED"
                    ? "success"
                    : "error"
              }
            />
          </Box>

          <Divider />

          <Stack spacing={2}>
            <Box display="flex" alignItems="center" gap={1}>
              <Email fontSize="small" color="action" />
              <Typography variant="body1">
                {publisher.publisherEmail}
              </Typography>
            </Box>
            <Typography variant="body2" color="textSecondary">
              등록일: {new Date(publisher.registeredAt).toLocaleDateString()}
            </Typography>
          </Stack>

          {publisher.description && (
            <>
              <Divider />
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  출판사 소개
                </Typography>
                <Typography variant="body2">{publisher.description}</Typography>
              </Box>
            </>
          )}

          {publisher.status === "PENDING" && (
            <>
              <Divider />
              <TextField
                label="거부 사유 (거부 시에만 필요)"
                multiline
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="거부하는 경우 사유를 입력해주세요."
                fullWidth
              />
            </>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        {publisher.status === "PENDING" && (
          <>
            <Button
              variant="contained"
              color="error"
              startIcon={<Close />}
              onClick={handleReject}
            >
              거부
            </Button>
            <Button
              variant="contained"
              color="success"
              startIcon={<Check />}
              onClick={handleApprove}
            >
              승인
            </Button>
          </>
        )}
        <Button onClick={onClose}>닫기</Button>
      </DialogActions>
    </Dialog>
  );
}

// 사용자 상세 다이얼로그
function UserDetailDialog({
  user,
  open,
  onClose,
}: {
  user: User;
  open: boolean;
  onClose(): void;
}) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>사용자 상세 정보</DialogTitle>
      <DialogContent>
        <Stack spacing={3}>
          <Box>
            <Typography variant="h5" gutterBottom>
              {user.username}
            </Typography>
            <Stack direction="row" spacing={1}>
              <Chip
                label={
                  user.role === "ROLE_ADMIN"
                    ? "관리자"
                    : user.role === "ROLE_PUBLISHER"
                      ? "출판사"
                      : "사용자"
                }
                color={
                  user.role === "ROLE_ADMIN"
                    ? "error"
                    : user.role === "ROLE_PUBLISHER"
                      ? "warning"
                      : "default"
                }
                size="small"
              />
              <Chip
                label={user.isActive ? "활성" : "비활성"}
                color={user.isActive ? "success" : "default"}
                size="small"
              />
            </Stack>
          </Box>

          <Divider />

          <Stack spacing={2}>
            <Box display="flex" alignItems="center" gap={1}>
              <Email fontSize="small" color="action" />
              <Typography variant="body1">{user.email}</Typography>
            </Box>
            <Typography variant="body2" color="textSecondary">
              등록일: {new Date(user.registeredAt).toLocaleDateString()}
            </Typography>
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>닫기</Button>
      </DialogActions>
    </Dialog>
  );
}

// 출판물 상세 다이얼로그
function BookDetailDialog({
  book,
  open,
  onClose,
  onUpdate,
}: {
  book: BookRequest;
  open: boolean;
  onClose(): void;
  onUpdate(action: "APPROVE" | "REJECT", reason?: string): void;
}) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const { data: presignedURL, isLoading: urlLoading } = useQuery({
    queryKey: ["admin-download-url", book.requestId],
    queryFn: async () => {
      const response = await API_CLIENT.ebookRequestController.download(
        book.requestId
      );
      if (!response.isSuccessful) {
        throw new Error(response.error);
      }
      return response.data.presignedUrl;
    },
    enabled: Boolean(book) && open,
    retry: 1,
  });

  const downloadBook = async () => {
    if (!presignedURL || isDownloading) return;

    setIsDownloading(true);
    try {
      const response = await fetch(presignedURL);
      if (!response.ok) throw new Error("다운로드 실패");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `${book.title}.epub`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("다운로드 실패:", error);
      alert("다운로드에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsDownloading(false);
    }
  };

  // 파일 크기 포맷팅
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // 상태별 색상 및 텍스트
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "PENDING":
        return { color: "warning" as const, text: "심사중" };
      case "APPROVED":
        return { color: "success" as const, text: "승인됨" };
      case "REJECTED":
        return { color: "error" as const, text: "거부됨" };
      default:
        return { color: "default" as const, text: status };
    }
  };

  const statusDisplay = getStatusDisplay(book.status);

  const handleApprove = () => {
    onUpdate("APPROVE");
  };

  const handleReject = () => {
    if (!rejectReason.trim()) {
      alert("거부 사유를 입력해주세요.");
      return;
    }
    onUpdate("REJECT", rejectReason);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h6">출판물 상세 정보</Typography>
      </DialogTitle>

      <DialogContent>
        <Grid container spacing={3}>
          {/* 책 표지 */}
          <Grid size={{ xs: 12, md: 4 }}>
            <CardMedia
              component="img"
              image={book.coverImageURL}
              alt={book.title}
              sx={{
                width: "100%",
                maxWidth: 200,
                height: 260,
                borderRadius: 2,
                objectFit: "cover",
                border: "1px solid",
                borderColor: "grey.300",
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/api/placeholder/200/260";
              }}
            />
          </Grid>

          {/* 책 정보 */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Stack spacing={2}>
              {/* 제목 및 저자 */}
              <Box>
                <Typography variant="h4" gutterBottom>
                  {book.title}
                </Typography>
                <Typography
                  variant="subtitle1"
                  color="textSecondary"
                  gutterBottom
                >
                  {book.author}
                </Typography>

                {/* 상태 표시 */}
                <Chip
                  label={statusDisplay.text}
                  color={statusDisplay.color}
                  size="small"
                  variant="outlined"
                />
              </Box>

              <Divider />

              {/* 가격 정보 */}
              <Stack direction="row" spacing={2} alignItems="center">
                <Typography
                  variant="body1"
                  color="textSecondary"
                  sx={{ minWidth: 80 }}
                >
                  가격
                </Typography>
                <Typography variant="h5" color="primary.main" fontWeight={700}>
                  ₩{book.price.toLocaleString()}
                </Typography>
              </Stack>

              {/* 파일 크기 */}
              <Stack direction="row" spacing={2} alignItems="center">
                <Typography
                  variant="body1"
                  color="textSecondary"
                  sx={{ minWidth: 80 }}
                >
                  파일 크기
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {formatFileSize(book.size)}
                </Typography>
              </Stack>

              {/* 출판사 정보 */}
              <Divider />
              <Box>
                <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                  출판사 정보
                </Typography>
                <Stack spacing={1}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Business fontSize="small" color="action" />
                    <Typography variant="body2">
                      {book.publisherName}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Email fontSize="small" color="action" />
                    <Typography variant="body2">
                      {book.publisherEmail}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            </Stack>
          </Grid>

          {/* 책 설명 */}
          <Grid size={12}>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="subtitle2" gutterBottom fontWeight={600}>
              도서 소개
            </Typography>
            <Typography
              variant="body1"
              sx={{
                whiteSpace: "pre-line",
                maxHeight: 120,
                overflow: "auto",
                padding: 2,
                bgcolor: "grey.50",
                borderRadius: 1,
              }}
            >
              {book.description || "설명이 없습니다."}
            </Typography>
          </Grid>

          {/* 거부 사유 (있는 경우) */}
          {book.status === "REJECTED" && book.rejectReason && (
            <Grid size={12}>
              <Alert severity="error" variant="outlined">
                <Typography variant="subtitle2" gutterBottom>
                  거부 사유
                </Typography>
                <Typography variant="body2">{book.rejectReason}</Typography>
              </Alert>
            </Grid>
          )}

          {/* 관리자 액션 (승인 대기 상태인 경우) */}
          {book.status === "PENDING" && (
            <Grid size={12}>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                관리자 액션
              </Typography>
              <TextField
                label="거부 사유 (거부 시에만 필요)"
                multiline
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="거부하는 경우 사유를 입력해주세요."
                fullWidth
                sx={{ mb: 2 }}
              />
            </Grid>
          )}
        </Grid>
      </DialogContent>

      <DialogActions
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* 왼쪽: 승인/거부 버튼 */}
        <Stack direction="row" spacing={1}>
          <Button
            variant="contained"
            color="success"
            startIcon={<Check />}
            onClick={handleApprove}
          >
            승인
          </Button>
          <Button
            variant="contained"
            color="error"
            startIcon={<Close />}
            onClick={handleReject}
          >
            거부
          </Button>
        </Stack>

        {/* 오른쪽: 다운로드 및 닫기 버튼 */}
        <Stack direction="row" spacing={1}>
          <Button
            variant="contained"
            startIcon={
              isDownloading ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <Download />
              )
            }
            onClick={downloadBook}
            disabled={!presignedURL || isDownloading || urlLoading}
          >
            {isDownloading
              ? "다운로드 중..."
              : urlLoading
                ? "준비 중..."
                : "다운로드"}
          </Button>

          <Button onClick={onClose}>닫기</Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}
