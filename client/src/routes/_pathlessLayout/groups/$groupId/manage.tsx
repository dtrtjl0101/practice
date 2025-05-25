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
  Box,
  Chip,
  TextField,
  InputAdornment,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Paper,
  Divider,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  Checkbox,
  Alert,
  LinearProgress,
  Modal,
} from "@mui/material";
import {
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  PersonAdd as PersonAddIcon,
  Group as GroupIcon,
  Settings as SettingsIcon,
  BarChart as BarChartIcon,
  Notifications as NotificationsIcon,
  FilterList as FilterListIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  AdminPanelSettings as AdminIcon,
} from "@mui/icons-material";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useParams } from "@tanstack/react-router";
import API_CLIENT from "../../../../api/api";
import PageNavigation from "../../../../component/PageNavigation";
import GroupEditForm from "../../../../component/groupCreate/GroupEditForm";

export const Route = createFileRoute("/_pathlessLayout/groups/$groupId/manage")(
  {
    component: RouteComponent,
    params: {
      parse: (params) => {
        const groupId = parseInt(params.groupId);
        if (isNaN(groupId)) {
          throw new Error("Invalid groupId");
        }
        return { groupId };
      },
    },
  }
);

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`group-management-tabpanel-${index}`}
      aria-labelledby={`group-management-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

function RouteComponent() {
  const [tabValue, setTabValue] = useState(0);
  const { groupId } = Route.useParams();
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const { data: groupData } = useQuery({
    queryKey: ["getGroup", groupId],
    queryFn: async () => {
      const response = await API_CLIENT.groupController.getGroup(groupId);
      if (!response.isSuccessful) {
        throw new Error(response.errorMessage);
      }
      return response.data;
    },
  });
  const groupName = groupData?.name;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={4}>
        {/* 헤더 영역 */}
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            {groupName} 그룹 관리
          </Typography>
          <Typography variant="body1" color="text.secondary">
            멤버 관리, 설정 변경 및 그룹 운영을 관리하세요
          </Typography>
        </Box>

        {/* 대시보드 카드 */}
        <GroupDashboard />

        {/* 탭 네비게이션 */}
        <Paper elevation={0} sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="그룹 관리 탭"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab
              icon={<PersonAddIcon />}
              label="가입 신청"
              iconPosition="start"
            />
            <Tab icon={<GroupIcon />} label="멤버 관리" iconPosition="start" />
            <Tab
              icon={<SettingsIcon />}
              label="그룹 설정"
              iconPosition="start"
            />
            <Tab icon={<BarChartIcon />} label="통계" iconPosition="start" />
          </Tabs>
        </Paper>

        {/* 탭 패널 */}
        <TabPanel value={tabValue} index={0}>
          <PendingMemberCard />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <MembersCard />
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <GroupSettingsCard />
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <GroupStatisticsCard />
        </TabPanel>
      </Stack>
    </Container>
  );
}

function GroupDashboard() {
  const { groupId } = Route.useParams();

  // $groupId에서 caching
  const { data: groupData } = useQuery({
    queryKey: ["getGroup", groupId],
    queryFn: async () => {
      const response = await API_CLIENT.groupController.getGroup(groupId);
      if (!response.isSuccessful) {
        throw new Error(response.errorMessage);
      }
      return response.data;
    },
  });

  const totalMembers = groupData?.memberCount || 0;

  const { data: pendingRequests } = useQuery({
    queryKey: ["pendingCount", groupId],
    queryFn: async () => {
      const response = await API_CLIENT.groupController.getPendingList(groupId);
      if (!response.isSuccessful) {
        throw new Error(response.errorMessage);
      }
      return response.data.content?.length || 0;
    },
    initialData: 0,
  });

  const { data: getGroupMembersResponse } = useQuery({
    queryKey: ["groupMembersCount", groupId],
    queryFn: async () => {
      const response =
        await API_CLIENT.groupController.getGroupMembers(groupId);
      if (!response.isSuccessful) {
        throw new Error(response.errorMessage);
      }
      return response.data.content;
    },
    initialData: [],
  });

  const newMembersThisMonth = getGroupMembersResponse
    ?.filter(
      (member) =>
        member.approvedAt &&
        member.approvedAt.slice(0, 7) === new Date().toISOString().slice(0, 7)
    )
    .map((member) => member.approvedAt)?.length;

  return (
    <Grid container spacing={3} sx={{ "& > *": { minWidth: 150 } }}>
      <Grid item sx={{ xs: 12, sm: 6, md: 3 }}>
        <Paper sx={{ p: 3, textAlign: "center" }}>
          <GroupIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
          <Typography variant="h4" fontWeight="bold">
            {totalMembers}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            총 멤버 수
          </Typography>
        </Paper>
      </Grid>

      <Grid item sx={{ xs: 12, sm: 6, md: 3 }}>
        <Paper sx={{ p: 3, textAlign: "center" }}>
          <NotificationsIcon color="warning" sx={{ fontSize: 40, mb: 1 }} />
          <Typography variant="h4" fontWeight="bold">
            {pendingRequests}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            대기 중인 신청
          </Typography>
        </Paper>
      </Grid>

      <Grid item sx={{ xs: 12, sm: 6, md: 3 }}>
        <Paper sx={{ p: 3, textAlign: "center" }}>
          <CheckCircleIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
          <Typography variant="h4" fontWeight="bold" color="error">
            {/* {activeMembers} */}
            TODO
          </Typography>
          <Typography variant="body2" color="text.secondary">
            활동 중인 멤버
          </Typography>
        </Paper>
      </Grid>

      <Grid item sx={{ xs: 12, sm: 6, md: 3 }}>
        <Paper sx={{ p: 3, textAlign: "center" }}>
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

function PendingMemberCard() {
  const { groupId } = Route.useParams();
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
    <Card>
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

function MembersCard() {
  const { groupId } = Route.useParams();
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedMember, setSelectedMember] = useState<any>(null);

  const { data: members } = useQuery({
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

  const handleMenuClick = (
    event: React.MouseEvent<HTMLElement>,
    member: any
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedMember(member);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedMember(null);
  };

  const searchTermDebounced = useDebounce(searchTerm, 500); // 300ms 후 실행

  const filteredMembers = members?.filter((member) =>
    member.nickname?.toLowerCase().includes(searchTermDebounced.toLowerCase())
  );

  return (
    <Card>
      <CardHeader
        title="멤버 관리"
        action={
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              size="small"
            >
              내보내기
            </Button>
            <Button
              variant="contained"
              startIcon={<PersonAddIcon />}
              size="small"
            >
              멤버 초대
            </Button>
          </Stack>
        }
      />
      <CardContent>
        <Stack spacing={3}>
          {/* 검색 및 필터 */}
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              placeholder="멤버 검색..."
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 300 }}
            />

            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>역할</InputLabel>
              <Select
                value={roleFilter}
                label="역할"
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <MenuItem value="all">전체</MenuItem>
                <MenuItem value="admin">관리자</MenuItem>
                <MenuItem value="member">멤버</MenuItem>
              </Select>
            </FormControl>
          </Stack>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>멤버 정보</TableCell>
                  <TableCell>역할</TableCell>
                  <TableCell>가입일</TableCell>
                  <TableCell>최근 활동</TableCell>
                  <TableCell>작업</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {members ? (
                  members.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                        <Stack spacing={2} alignItems="center">
                          <GroupIcon
                            sx={{ fontSize: 48, color: "text.disabled" }}
                          />
                          <Typography color="text.secondary">
                            멤버가 없습니다.
                          </Typography>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredMembers?.map((member) => (
                      <TableRow key={member.userId}>
                        <TableCell>
                          <Stack
                            direction="row"
                            spacing={2}
                            alignItems="center"
                          >
                            <Avatar src={member.profileImageURL} />
                            <Box>
                              <Typography variant="subtitle2">
                                {member.nickname}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                ID: {member.userId}
                              </Typography>
                            </Box>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={member.role || "멤버"}
                            color={
                              member.role === "admin" ? "primary" : "default"
                            }
                            size="small"
                            icon={
                              member.role === "admin" ? (
                                <AdminIcon />
                              ) : undefined
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {member.createdAt
                              ? new Date(member.createdAt).toLocaleDateString(
                                  "ko-KR"
                                )
                              : "-"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {member.lastActiveAt
                              ? new Date(
                                  member.lastActiveAt
                                ).toLocaleDateString("ko-KR")
                              : "정보 없음"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={(e) => handleMenuClick(e, member)}
                          >
                            <MoreVertIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )
                ) : (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <LinearProgress />
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* 멤버 액션 메뉴 */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleMenuClose}>
              <EditIcon sx={{ mr: 1 }} />
              역할 변경
            </MenuItem>
            <MenuItem onClick={handleMenuClose}>
              <NotificationsIcon sx={{ mr: 1 }} />
              메시지 보내기
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleMenuClose} sx={{ color: "error.main" }}>
              <DeleteIcon sx={{ mr: 1 }} />
              멤버 제거
            </MenuItem>
          </Menu>

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

function GroupSettingsCard() {
  const { groupId } = Route.useParams();
  const [isEditing, setIsEditing] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // 폼 상태 관리
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    groupImageURL: "",
    tags: [] as string[],
  });

  // 그룹 데이터 가져오기
  const { data: groupData, refetch } = useQuery({
    queryKey: ["getGroup", groupId],
    queryFn: async () => {
      const response = await API_CLIENT.groupController.getGroup(groupId);
      if (!response.isSuccessful) {
        throw new Error(response.errorMessage);
      }
      return response.data;
    },
  });

  // 그룹 데이터가 로드되면 폼 데이터 초기화
  useEffect(() => {
    if (groupData) {
      setFormData({
        name: groupData.name || "",
        description: groupData.description || "",
        groupImageURL: groupData.groupImageURL || "",
        tags: groupData.tags || [],
      });
    }
  }, [groupData]);

  const handleSave = async () => {
    try {
      // updateGroup API는 description과 groupImageURL만 포함
      const updateData = {
        description: formData.description,
        groupImageURL: formData.groupImageURL,
      };

      const response = await API_CLIENT.groupController.updateGroup(
        groupId,
        updateData
      );
      if (!response.isSuccessful) {
        throw new Error(response.errorMessage);
      }
      setIsEditing(false);
      refetch();
      alert("그룹 정보가 성공적으로 수정되었습니다.");
    } catch (error) {
      alert("그룹 정보 수정에 실패했습니다.");
    }
  };

  const handleCancel = () => {
    // 원래 데이터로 되돌리기
    if (groupData) {
      setFormData({
        name: groupData.name || "",
        description: groupData.description || "",
        groupImageURL: groupData.groupImageURL || "",
        tags: groupData.tags || [],
      });
    }
    setPreviewImage(null);
    setIsEditing(false);
  };

  const handleDeleteGroup = () => {
    throw new Error("Function not implemented.");
  };

  return (
    <Stack spacing={3}>
      {/* 그룹 정보 수정 카드 */}
      <Card>
        <CardHeader
          title="그룹 정보 수정"
          action={
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => setIsEditing(true)}
              disabled={isEditing} // 이미 편집 중이면 버튼 비활성화
            >
              수정
            </Button>
          }
        />
        <Modal
          open={isEditing}
          onClose={handleCancel}
          sx={{
            width: "100vw",
            height: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Container sx={{ height: "60vh", width: "120vh" }}>
            <GroupEditForm
              groupEditData={formData}
              onEditDone={handleSave}
              onCancel={handleCancel}
            />
          </Container>
        </Modal>
        <CardContent>
          <Stack spacing={4}>
            {/* 그룹 이미지 */}
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                그룹 이미지
              </Typography>
              <Stack direction="row" spacing={3} alignItems="center">
                <Avatar
                  src={previewImage || formData.groupImageURL}
                  sx={{ width: 80, height: 80 }}
                >
                  <GroupIcon sx={{ fontSize: 40 }} />
                </Avatar>
              </Stack>
            </Box>

            {/* 그룹명 */}
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                그룹명
              </Typography>
              <Typography
                variant="body2"
                fontStyle="italic"
                color="text.secondary"
                gutterBottom
              >
                *현재 수정 불가
              </Typography>

              <Typography variant="body1">{groupData?.name || "-"}</Typography>
            </Box>

            {/* 그룹 설명 */}
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                그룹 설명
              </Typography>

              <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
                {groupData?.description || "설명이 없습니다."}
              </Typography>
            </Box>

            {/* 태그 */}
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                태그
              </Typography>
              <Typography
                variant="body2"
                fontStyle="italic"
                color="text.secondary"
                gutterBottom
              >
                *현재 수정 불가
              </Typography>
              <Stack spacing={2}>
                {/* 현재 태그들 */}
                <Box>
                  {formData.tags.length > 0 ? (
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {formData.tags.map((tag, index) => (
                        <Chip
                          key={index}
                          label={tag}
                          variant="outlined"
                          size="small"
                        />
                      ))}
                    </Stack>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      등록된 태그가 없습니다.
                    </Typography>
                  )}
                </Box>
              </Stack>
            </Box>

            {/* 그룹 ID (읽기 전용) */}
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                그룹 ID
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {groupData?.groupId}
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* 기타 설정들 */}
      <Card>
        <CardHeader title="그룹 설정" />
        <CardContent>
          <Stack spacing={3}>
            <Alert severity="info">아래 기능들은 개발 중입니다.</Alert>

            <Stack spacing={2}>
              <Typography variant="h6">개발 예정 기능</Typography>
              <Box component="ul" sx={{ pl: 2 }}>
                <Typography
                  component="li"
                  variant="body2"
                  color="text.secondary"
                >
                  공개/비공개 설정
                </Typography>
                <Typography
                  component="li"
                  variant="body2"
                  color="text.secondary"
                >
                  가입 승인 방식 설정 (자동/수동)
                </Typography>
                <Typography
                  component="li"
                  variant="body2"
                  color="text.secondary"
                >
                  멤버 권한 관리
                </Typography>
                <Typography
                  component="li"
                  variant="body2"
                  color="text.secondary"
                >
                  그룹 카테고리 설정
                </Typography>
                <Typography
                  component="li"
                  variant="body2"
                  color="text.secondary"
                >
                  알림 설정
                </Typography>
              </Box>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* 위험한 작업들 */}
      <Card>
        <CardHeader
          title="위험 구역"
          titleTypographyProps={{ color: "error.main" }}
        />
        <CardContent>
          <Stack spacing={2}>
            <Alert severity="warning">
              아래 작업들은 신중하게 수행해주세요. 되돌릴 수 없습니다.
            </Alert>

            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={handleDeleteGroup}
              >
                그룹 삭제
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}

function GroupStatisticsCard() {
  return (
    <Card>
      <CardHeader title="통계 및 분석" />
      <CardContent>
        <Stack spacing={3}>
          <Alert severity="info">통계 기능은 개발 중입니다.</Alert>
          <Typography variant="body2" color="text.secondary">
            • 멤버 활동 통계
            <br />
            • 가입 신청 추이
            <br />
            • 게시글/댓글 분석
            <br />
            • 참여도 분석
            <br />• 월별/주별 리포트
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}

function useDebounce(value: any, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
