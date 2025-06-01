import { useMemo, useState, useCallback } from "react";
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

interface PaginatedResponse<T> {
  content: T[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
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

  // 각 탭별 독립적인 검색 및 필터 상태
  const [publisherSearchTerm, setPublisherSearchTerm] = useState("");
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [bookSearchTerm, setBookSearchTerm] = useState("");
  const [publisherStatusFilter, setPublisherStatusFilter] = useState("ALL");
  const [bookStatusFilter, setBookStatusFilter] = useState("ALL");

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

  // 출판사 목록 조회 (페이지네이션 적용)
  const { data: publishersResponse } = useQuery({
    queryKey: [
      "adminPublishers",
      publisherPage,
      rowsPerPage,
      publisherSearchTerm,
      publisherStatusFilter,
    ],
    queryFn: async () => {
      const response = await API_CLIENT.adminController.fetchPublishers({
        page: publisherPage,
        size: rowsPerPage,
        search: publisherSearchTerm || undefined,
        status:
          publisherStatusFilter !== "ALL" ? publisherStatusFilter : undefined,
      });
      if (!response.isSuccessful) {
        throw new Error(response.errorMessage);
      }
      return response.data as PaginatedResponse<Publisher>;
    },
    enabled: isAdmin,
    initialData: {
      content: [] as Publisher[],
      currentPage: 0,
      totalItems: 0,
      totalPages: 0,
    },
  });

  // 유저 목록 조회 (페이지네이션 적용)
  const { data: usersResponse } = useQuery({
    queryKey: ["adminUsers", userPage, rowsPerPage, userSearchTerm],
    queryFn: async () => {
      const response = await API_CLIENT.adminController.fetchUsers({
        page: userPage,
        size: rowsPerPage,
        search: userSearchTerm || undefined,
      });
      if (!response.isSuccessful) {
        throw new Error(response.errorMessage);
      }
      return response.data as PaginatedResponse<User>;
    },
    enabled: isAdmin,
    initialData: {
      content: [] as User[],
      currentPage: 0,
      totalItems: 0,
      totalPages: 0,
    },
  });

  // 출판물 요청 목록 조회 (페이지네이션 적용)
  const { data: bookRequestsResponse } = useQuery({
    queryKey: [
      "adminBookRequests",
      bookPage,
      rowsPerPage,
      bookSearchTerm,
      bookStatusFilter,
    ],
    queryFn: async () => {
      const response = await API_CLIENT.ebookRequestController.getEbookRequests(
        {
          page: bookPage,
          size: rowsPerPage,
          search: bookSearchTerm || undefined,
          status: bookStatusFilter !== "ALL" ? bookStatusFilter : undefined,
        }
      );
      if (!response.isSuccessful) {
        throw new Error(response.errorMessage);
      }
      return response.data as PaginatedResponse<BookRequest>;
    },
    enabled: isAdmin,
    initialData: {
      content: [] as BookRequest[],
      currentPage: 0,
      totalItems: 0,
      totalPages: 0,
    },
  });

  // 전체 통계를 위한 별도 쿼리 (첫 페이지 데이터로 전체 수량 파악)
  const { data: publisherStatsResponse } = useQuery({
    queryKey: ["adminPublisherStats"],
    queryFn: async () => {
      const response = await API_CLIENT.adminController.fetchPublishers({
        page: 0,
        size: 1, // 최소한의 데이터만 가져와서 총 개수 확인
      });
      if (!response.isSuccessful) {
        throw new Error(response.errorMessage);
      }
      return response.data as PaginatedResponse<Publisher>;
    },
    enabled: isAdmin,
  });

  // 현재 탭의 데이터
  const publishers = publishersResponse?.content || [];
  const users = usersResponse?.content || [];
  const bookRequests = bookRequestsResponse?.content || [];

  // 상태별 카운트 (통계용)
  const publisherStats = useMemo(() => {
    const total = publisherStatsResponse?.totalItems || 0;
    // 실제로는 각 상태별로 별도 API 호출이 필요할 수 있습니다
    return {
      pending: 0, // API에서 상태별 카운트를 제공하지 않는 경우 별도 구현 필요
      approved: 0,
      rejected: 0,
      total,
    };
  }, [publisherStatsResponse]);

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
      queryClient.invalidateQueries({ queryKey: ["adminPublisherStats"] });
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

  // 페이지 변경 핸들러들
  const handlePublisherPageChange = useCallback((_: any, newPage: number) => {
    setPublisherPage(newPage);
  }, []);

  const handleUserPageChange = useCallback((_: any, newPage: number) => {
    setUserPage(newPage);
  }, []);

  const handleBookPageChange = useCallback((_: any, newPage: number) => {
    setBookPage(newPage);
  }, []);

  const handleRowsPerPageChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newRowsPerPage = parseInt(event.target.value, 10);
      setRowsPerPage(newRowsPerPage);
      // 모든 탭의 페이지를 0으로 리셋
      setPublisherPage(0);
      setUserPage(0);
      setBookPage(0);
    },
    []
  );

  // 검색어 변경 시 페이지 리셋
  const handlePublisherSearchChange = useCallback((value: string) => {
    setPublisherSearchTerm(value);
    setPublisherPage(0); // 검색 시 첫 페이지로 이동
  }, []);

  const handleUserSearchChange = useCallback((value: string) => {
    setUserSearchTerm(value);
    setUserPage(0); // 검색 시 첫 페이지로 이동
  }, []);

  const handleBookSearchChange = useCallback((value: string) => {
    setBookSearchTerm(value);
    setBookPage(0); // 검색 시 첫 페이지로 이동
  }, []);

  const handlePublisherStatusChange = useCallback((value: string) => {
    setPublisherStatusFilter(value);
    setPublisherPage(0); // 필터 변경 시 첫 페이지로 이동
  }, []);

  const handleBookStatusChange = useCallback((value: string) => {
    setBookStatusFilter(value);
    setBookPage(0); // 필터 변경 시 첫 페이지로 이동
  }, []);

  // 새로고침 핸들러
  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["adminPublishers"] });
    queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
    queryClient.invalidateQueries({ queryKey: ["adminBookRequests"] });
    queryClient.invalidateQueries({ queryKey: ["adminPublisherStats"] });
  }, [queryClient]);

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
                <Typography variant="h4">
                  {usersResponse?.totalItems || 0}
                </Typography>
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
                <Typography variant="h4">
                  {bookRequestsResponse?.totalItems || 0}
                </Typography>
                <Typography variant="body2" color="warning.main">
                  승인 대기:{" "}
                  {
                    bookRequests.filter((book) => book.status === "PENDING")
                      .length
                  }
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
  const SearchAndFilter = useCallback(() => {
    let searchTerm = "";
    let statusFilter = "ALL";
    let onSearchChange = handlePublisherSearchChange;
    let onStatusChange = handlePublisherStatusChange;
    let showStatusFilter = true;

    switch (currentTab) {
      case 0:
        searchTerm = publisherSearchTerm;
        statusFilter = publisherStatusFilter;
        onSearchChange = handlePublisherSearchChange;
        onStatusChange = handlePublisherStatusChange;
        showStatusFilter = true;
        break;
      case 1:
        searchTerm = userSearchTerm;
        onSearchChange = handleUserSearchChange;
        showStatusFilter = false;
        break;
      case 2:
        searchTerm = bookSearchTerm;
        statusFilter = bookStatusFilter;
        onSearchChange = handleBookSearchChange;
        onStatusChange = handleBookStatusChange;
        showStatusFilter = true;
        break;
    }

    return (
      <Paper sx={{ p: 2, mb: 3 }} variant="outlined">
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems="center"
        >
          <TextField
            placeholder="검색..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            size="small"
            sx={{ flexGrow: 1 }}
            InputProps={{
              startAdornment: <Search sx={{ color: "action.active", mr: 1 }} />,
            }}
          />
          {showStatusFilter && (
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>상태</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => onStatusChange(e.target.value)}
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
            onClick={handleRefresh}
          >
            새로고침
          </Button>
        </Stack>
      </Paper>
    );
  }, [
    currentTab,
    publisherSearchTerm,
    userSearchTerm,
    bookSearchTerm,
    publisherStatusFilter,
    bookStatusFilter,
    handlePublisherSearchChange,
    handleUserSearchChange,
    handleBookSearchChange,
    handlePublisherStatusChange,
    handleBookStatusChange,
    handleRefresh,
  ]);

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
            label={`출판사 관리 (${publishersResponse?.totalItems || 0})`}
          />
          <Tab
            icon={<Person />}
            label={`사용자 관리 (${usersResponse?.totalItems || 0})`}
          />
          <Tab
            icon={<MenuBook />}
            label={`출판물 요청 (${bookRequestsResponse?.totalItems || 0})`}
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
                {publishers.map((publisher) => (
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
            count={publishersResponse?.totalItems || 0}
            page={publisherPage}
            onPageChange={handlePublisherPageChange}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleRowsPerPageChange}
            labelRowsPerPage="페이지당 행 수:"
            labelDisplayedRows={({ from, to, count }) =>
              `${from}-${to} / ${count !== -1 ? count : `${to}개 이상`}`
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
                  <TableCell>등록일</TableCell>
                  <TableCell>상태</TableCell>
                  <TableCell align="center">관리</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
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
                    <TableCell>이메일</TableCell>
                    <TableCell>{new Date().toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Chip label="활성" color="success" size="small" />
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
            count={usersResponse?.totalItems || 0}
            page={userPage}
            onPageChange={handleUserPageChange}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleRowsPerPageChange}
            labelRowsPerPage="페이지당 행 수:"
            labelDisplayedRows={({ from, to, count }) =>
              `${from}-${to} / ${count !== -1 ? count : `${to}개 이상`}`
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
                {bookRequests.map((book) => (
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
            count={bookRequestsResponse?.totalItems || 0}
            page={bookPage}
            onPageChange={handleBookPageChange}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleRowsPerPageChange}
            labelRowsPerPage="페이지당 행 수:"
            labelDisplayedRows={({ from, to, count }) =>
              `${from}-${to} / ${count !== -1 ? count : `${to}개 이상`}`
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
              <Typography variant="body1">이메일</Typography>
            </Box>
            <Typography variant="body2" color="textSecondary">
              등록일: {new Date(publisher.createdAt).toLocaleDateString()}
            </Typography>
          </Stack>

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
              {user.nickname}
            </Typography>
          </Box>

          <Divider />

          <Stack spacing={2}>
            <Box display="flex" alignItems="center" gap={1}>
              <Email fontSize="small" color="action" />
              <Typography variant="body1">이메일</Typography>
            </Box>
            <Typography variant="body2" color="textSecondary">
              등록일: {new Date().toLocaleDateString()}
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
        {book.status === "PENDING" && (
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
        )}

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
