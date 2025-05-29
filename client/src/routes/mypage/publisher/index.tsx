import { useState } from "react";
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
} from "@mui/material";
import {
  Add,
  MenuBook,
  Visibility,
  ShoppingCart,
  AttachMoney,
  Star,
  PendingActions,
  Edit,
  Delete,
  FileUpload,
  Analytics,
} from "@mui/icons-material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import { createFileRoute } from "@tanstack/react-router";
import { useAtomValue } from "jotai";
import { AuthState } from "../../../states/auth";
import { Role } from "../../../types/role";

export const Route = createFileRoute("/mypage/publisher/")({
  component: RouteComponent,
});

// 더미 데이터
const salesData = [
  { name: "1월", sales: 4000, revenue: 2400000, views: 12000 },
  { name: "2월", sales: 3000, revenue: 1800000, views: 10000 },
  { name: "3월", sales: 5000, revenue: 3000000, views: 15000 },
  { name: "4월", sales: 4500, revenue: 2700000, views: 13500 },
  { name: "5월", sales: 6000, revenue: 3600000, views: 18000 },
  { name: "6월", sales: 5500, revenue: 3300000, views: 16500 },
];

const bookSalesData = [
  { name: "소설 A", sales: 1200, revenue: 720000, views: 4500, activities: 15 },
  { name: "에세이 B", sales: 800, revenue: 480000, views: 3200, activities: 8 },
  {
    name: "자기계발 C",
    sales: 1500,
    revenue: 900000,
    views: 5800,
    activities: 22,
  },
  { name: "시집 D", sales: 600, revenue: 360000, views: 2100, activities: 5 },
  { name: "소설 E", sales: 900, revenue: 540000, views: 3800, activities: 12 },
];

const pendingBooks = [
  {
    id: 1,
    title: "새로운 소설",
    author: "김작가",
    submittedAt: "2025-05-25",
    status: "심사중",
  },
  {
    id: 2,
    title: "여행 에세이",
    author: "박여행",
    submittedAt: "2025-05-24",
    status: "보완요청",
  },
  {
    id: 3,
    title: "요리책",
    author: "이셰프",
    submittedAt: "2025-05-23",
    status: "심사중",
  },
];

const publishedBooks = [
  {
    id: 1,
    title: "소설 A",
    author: "김소설",
    publishedAt: "2025-03-15",
    sales: 1200,
    revenue: 720000,
    views: 4500,
    activities: 15,
    cover: "/api/placeholder/60/80",
  },
  {
    id: 2,
    title: "에세이 B",
    author: "박에세이",
    publishedAt: "2025-02-20",
    sales: 800,
    revenue: 480000,
    views: 3200,
    activities: 8,
    cover: "/api/placeholder/60/80",
  },
  {
    id: 3,
    title: "자기계발 C",
    author: "이성장",
    publishedAt: "2025-01-10",
    sales: 1500,
    revenue: 900000,
    views: 5800,
    activities: 22,
    cover: "/api/placeholder/60/80",
  },
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

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
  const [currentTab, setCurrentTab] = useState(0);
  const [timePeriod, setTimePeriod] = useState("month");
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const user = useAtomValue(AuthState.user);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  // 요약 통계 카드
  const SummaryCards = () => (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Card>
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
                  총 판매량
                </Typography>
                <Typography variant="h4">
                  {bookSalesData
                    .reduce((sum, book) => sum + book.sales, 0)
                    .toLocaleString()}
                </Typography>
                <Typography variant="body2" color="success.main">
                  +12% 전월 대비
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: "primary.main" }}>
                <ShoppingCart />
              </Avatar>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Card>
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
                  총 매출
                </Typography>
                <Typography variant="h4">
                  ₩
                  {(
                    bookSalesData.reduce((sum, book) => sum + book.revenue, 0) /
                    1000000
                  ).toFixed(1)}
                  M
                </Typography>
                <Typography variant="body2" color="success.main">
                  +8% 전월 대비
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: "success.main" }}>
                <AttachMoney />
              </Avatar>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Card>
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
                  활동 선정 수
                </Typography>
                <Typography variant="h4">
                  {bookSalesData.reduce(
                    (sum, book) => sum + book.activities,
                    0
                  )}
                </Typography>
                <Typography variant="body2" color="success.main">
                  +15% 전월 대비
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: "warning.main" }}>
                <Star />
              </Avatar>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Card>
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
                  총 조회수
                </Typography>
                <Typography variant="h4">
                  {(
                    bookSalesData.reduce((sum, book) => sum + book.views, 0) /
                    1000
                  ).toFixed(1)}
                  K
                </Typography>
                <Typography variant="body2" color="success.main">
                  +20% 전월 대비
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: "info.main" }}>
                <Visibility />
              </Avatar>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  // 차트 섹션
  const ChartsSection = () => (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      <Grid size={{ xs: 12, lg: 8 }}>
        <Paper sx={{ p: 3 }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography variant="h6">판매 추이</Typography>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>기간</InputLabel>
              <Select
                value={timePeriod}
                onChange={(e) => setTimePeriod(e.target.value)}
                label="기간"
              >
                <MenuItem value="week">주간</MenuItem>
                <MenuItem value="month">월간</MenuItem>
                <MenuItem value="year">연간</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="sales"
                stroke="#8884d8"
                name="판매량"
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#82ca9d"
                name="매출"
              />
            </LineChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>

      <Grid size={{ xs: 12, lg: 4 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            도서별 판매 비율
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={bookSalesData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="sales"
              >
                {bookSalesData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>
    </Grid>
  );

  if (user?.role !== Role.ROLE_PUBLISHER) {
    alert("출판사 계정만 접근 가능합니다.");
    return;
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* 헤더 */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
      >
        <Box>
          <Typography variant="h4" gutterBottom>
            출판사 관리
          </Typography>
          <Typography variant="body1" color="textSecondary">
            출판물 관리 및 성과 분석
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpenAddDialog(true)}
          size="large"
        >
          새 도서 등록
        </Button>
      </Box>

      {/* 요약 통계 */}
      <SummaryCards />

      {/* 차트 */}
      <ChartsSection />

      {/* 탭 네비게이션 */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          sx={{ borderBottom: 1, borderColor: "divider" }}
        >
          <Tab icon={<MenuBook />} label="출간 도서" />
          <Tab icon={<PendingActions />} label="승인 대기" />
          <Tab icon={<Analytics />} label="상세 분석" />
        </Tabs>

        {/* 출간 도서 탭 */}
        <TabPanel value={currentTab} index={0}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>도서</TableCell>
                  <TableCell align="right">판매량</TableCell>
                  <TableCell align="right">매출</TableCell>
                  <TableCell align="right">조회수</TableCell>
                  <TableCell align="right">활동 선정</TableCell>
                  <TableCell align="right">출간일</TableCell>
                  <TableCell align="center">관리</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {publishedBooks.map((book) => (
                  <TableRow key={book.id} hover>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar
                          src={book.cover}
                          variant="rounded"
                          sx={{ width: 40, height: 50 }}
                        />
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
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight={600}>
                        {book.sales.toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight={600}>
                        ₩{(book.revenue / 1000).toLocaleString()}K
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2">
                        {book.views.toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Chip
                        label={`${book.activities}회`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" color="textSecondary">
                        {book.publishedAt}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton size="small" color="primary">
                        <Edit />
                      </IconButton>
                      <IconButton size="small" color="error">
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* 승인 대기 탭 */}
        <TabPanel value={currentTab} index={1}>
          <Box mb={2}>
            <Alert severity="info">
              현재 {pendingBooks.length}권의 도서가 승인 대기 중입니다.
            </Alert>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>제목</TableCell>
                  <TableCell>저자</TableCell>
                  <TableCell>제출일</TableCell>
                  <TableCell>상태</TableCell>
                  <TableCell align="center">관리</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pendingBooks.map((book) => (
                  <TableRow key={book.id} hover>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {book.title}
                      </Typography>
                    </TableCell>
                    <TableCell>{book.author}</TableCell>
                    <TableCell>
                      <Typography variant="body2" color="textSecondary">
                        {book.submittedAt}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={book.status}
                        color={book.status === "심사중" ? "warning" : "error"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton size="small" color="primary">
                        <Edit />
                      </IconButton>
                      <IconButton size="small" color="error">
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* 상세 분석 탭 */}
        <TabPanel value={currentTab} index={2}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  도서별 성과 비교
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={bookSalesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="sales" fill="#8884d8" name="판매량" />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  활동 선정 현황
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={bookSalesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar
                      dataKey="activities"
                      fill="#82ca9d"
                      name="활동 선정 수"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>

      {/* 도서 등록 다이얼로그 */}
      <Dialog
        open={openAddDialog}
        onClose={() => setOpenAddDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>새 도서 등록</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField label="도서명" fullWidth />
            <TextField label="저자명" fullWidth />
            <TextField label="도서 소개" multiline rows={4} fullWidth />
            <Box>
              <Button
                variant="outlined"
                startIcon={<FileUpload />}
                component="label"
              >
                표지 이미지 업로드
                <input type="file" hidden accept="image/*" />
              </Button>
            </Box>
            <Box>
              <Button
                variant="outlined"
                startIcon={<FileUpload />}
                component="label"
              >
                전자책 파일 업로드
                <input type="file" hidden accept=".pdf,.epub" />
              </Button>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddDialog(false)}>취소</Button>
          <Button variant="contained">등록 신청</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
