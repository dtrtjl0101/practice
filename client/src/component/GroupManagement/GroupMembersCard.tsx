import {
  Card,
  CardHeader,
  Stack,
  CardContent,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography,
  Avatar,
  Box,
  Chip,
  IconButton,
  LinearProgress,
  Menu,
  Divider,
} from "@mui/material";
import {
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Group as GroupIcon,
  Notifications as NotificationsIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  AdminPanelSettings as AdminIcon,
} from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import API_CLIENT from "../../api/api";
import PageNavigation from "../PageNavigation";

interface Member {
  userId: number;
  nickname: string;
  profileImageURL: string;
  isApproved: boolean;
  isLeader: boolean;
  createdAt: string;
  approvedAt: string;
}

export default function GroupMembersCard({ groupId }: { groupId: number }) {
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedMember, setSelectedMember] = useState<null | Member>();
  const { data: members, refetch } = useQuery({
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

  const filteredMembers = members?.filter(
    (member) =>
      member.nickname
        ?.toLowerCase()
        .includes(searchTermDebounced.toLowerCase()) &&
      (roleFilter === "all" ||
        (roleFilter === "admin" && member.isLeader) ||
        (roleFilter === "member" && !member.isLeader)) &&
      member.isApproved
  );

  const handleKickMember = () => {
    if (!selectedMember) return;
    const confirmKick = window.confirm(
      `멤버 ${selectedMember.nickname}을(를) 추방하시겠습니까?`
    );
    if (!confirmKick) return;
    API_CLIENT.groupController
      .kickGroupMember(groupId, selectedMember.userId)
      .then((response) => {
        if (response.isSuccessful) {
          alert(`멤버 ${selectedMember.nickname}이(가) 추방되었습니다.`);
          refetch();
        } else {
          alert(`멤버 추방에 실패했습니다: ${response.errorMessage}`);
        }
      });
    handleMenuClose();
  };

  return (
    <Card>
      <CardHeader title="멤버 관리" />
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
                <MenuItem value="admin">모임지기</MenuItem>
                <MenuItem value="member">모임원</MenuItem>
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
                            label={member.isLeader ? "모임지기" : "모임원"}
                            color={member.isLeader ? "primary" : "default"}
                            size="small"
                            icon={member.isLeader ? <AdminIcon /> : undefined}
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
                          {/* <Typography variant="body2" color="text.secondary">
                            {member.lastActiveAt
                              ? new Date(
                                  member.lastActiveAt
                                ).toLocaleDateString("ko-KR")
                              : "정보 없음"}
                          </Typography> */}
                          <Typography variant="body2" color="text.secondary">
                            미구현
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {!member.isLeader && (
                            <IconButton
                              size="small"
                              onClick={(e) => handleMenuClick(e, member)}
                            >
                              <MoreVertIcon />
                            </IconButton>
                          )}
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
            <MenuItem onClick={handleKickMember} sx={{ color: "error.main" }}>
              <DeleteIcon sx={{ mr: 1 }} />
              멤버 추방
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
