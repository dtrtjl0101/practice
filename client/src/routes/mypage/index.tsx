import {
  GroupAdd,
  ShoppingCart,
  Edit,
  CameraAlt,
  AutoStories,
  TrendingUp,
  Schedule,
  Group,
  PersonOutline,
  Add,
} from "@mui/icons-material";
import {
  Container,
  Card,
  CardHeader,
  CardContent,
  Button,
  Stack,
  IconButton,
  Avatar,
  Typography,
  Box,
  Grid,
  Chip,
  Divider,
  Paper,
  Badge,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
} from "@mui/material";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import BookList, { BookListKind } from "../../component/BookList";
import GroupCreateModal from "../../component/groupCreate/GroupCreateModal";
import GroupList, { GroupListKind } from "../../component/GroupList";
import HighlightBrowserModal from "../../component/HighlightBrowserModal";

export const Route = createFileRoute("/mypage/")({
  component: RouteComponent,
});

// 임시 사용자 데이터 (API 연동 전)
const mockUserData = {
  nickname: "독서러버",
  email: "reader@example.com",
  profileImage: null, // null이면 기본 아바타
  joinDate: "2024-01-15",
  stats: {
    highlightCount: 127,
    purchasedBookCount: 23,
    readBookCount: 18,
    joinedGroupCount: 5,
  },
};

const mockRecentActivities = [
  {
    id: 1,
    type: "group_join",
    title: "클래식 문학 읽기 모임",
    date: "2024-06-08",
  },
  { id: 2, type: "book_purchase", title: "데미안", date: "2024-06-05" },
  { id: 3, type: "group_join", title: "SF 소설 토론회", date: "2024-06-01" },
];

function RouteComponent() {
  const [openHighlightBrowserModal, setOpenHighlightBrowserModal] =
    useState(false);

  return (
    <>
      <HighlightBrowserModal
        open={openHighlightBrowserModal}
        onClose={() => setOpenHighlightBrowserModal(false)}
      />
      <Container sx={{ my: 4 }}>
        <Stack spacing={4}>
          {/* 프로필 섹션 */}
          <ProfileSection />

          {/* 통계 카드들 */}
          <StatsSection />

          {/* 최근 활동 */}
          <RecentActivitySection />

          {/* 기존 기능들 */}
          <ManagementSection
            onOpenHighlightBrowser={() => setOpenHighlightBrowserModal(true)}
          />

          <GroupsSection />
          <BooksSection />
        </Stack>
      </Container>
    </>
  );
}

function ProfileSection() {
  const [isEditingNickname, setIsEditingNickname] = useState(false);

  const handleProfileImageChange = () => {
    // TODO: 프로필 이미지 변경 로직
    console.log("프로필 이미지 변경");
  };

  const handleNicknameEdit = () => {
    // TODO: 닉네임 수정 로직
    setIsEditingNickname(!isEditingNickname);
  };

  return (
    <Card variant="outlined">
      <CardContent>
        <Box display="flex" alignItems="center" gap={3}>
          <Box position="relative">
            <Avatar
              src={mockUserData.profileImage ?? undefined}
              sx={{ width: 80, height: 80 }}
            >
              {mockUserData.nickname.charAt(0)}
            </Avatar>
            <IconButton
              size="small"
              sx={{
                position: "absolute",
                bottom: -4,
                right: -4,
                bgcolor: "primary.main",
                color: "white",
                "&:hover": { bgcolor: "primary.dark" },
                width: 28,
                height: 28,
              }}
              onClick={handleProfileImageChange}
            >
              <CameraAlt fontSize="small" />
            </IconButton>
          </Box>

          <Box flex={1}>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <Typography variant="h5" component="h1">
                {mockUserData.nickname}
              </Typography>
              <IconButton size="small" onClick={handleNicknameEdit}>
                <Edit fontSize="small" />
              </IconButton>
            </Box>
            <Typography variant="body2" color="text.secondary" mb={1}>
              {mockUserData.email}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              가입일:{" "}
              {new Date(mockUserData.joinDate).toLocaleDateString("ko-KR")}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

function StatsSection() {
  const stats = [
    {
      icon: <TrendingUp />,
      title: "등록한 하이라이트",
      count: mockUserData.stats.highlightCount,
      color: "primary",
    },
    {
      icon: <AutoStories />,
      title: "읽은 책",
      count: mockUserData.stats.readBookCount,
      color: "success",
    },
    {
      icon: <ShoppingCart />,
      title: "구매한 책",
      count: mockUserData.stats.purchasedBookCount,
      color: "info",
    },
    {
      icon: <GroupAdd />,
      title: "가입한 모임",
      count: mockUserData.stats.joinedGroupCount,
      color: "warning",
    },
  ];

  return (
    <Grid container spacing={2}>
      {stats.map((stat, index) => (
        <Grid size={{ xs: 6, md: 3 }} key={index}>
          <Paper
            elevation={1}
            sx={{
              p: 2,
              textAlign: "center",
              cursor: "pointer",
              transition: "transform 0.2s",
              "&:hover": { transform: "translateY(-2px)" },
            }}
          >
            <Box color={`${stat.color}.main`} mb={1}>
              {stat.icon}
            </Box>
            <Typography variant="h4" component="div" mb={0.5}>
              {stat.count}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {stat.title}
            </Typography>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
}

function RecentActivitySection() {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "group_join":
        return <GroupAdd fontSize="small" />;
      case "book_purchase":
        return <ShoppingCart fontSize="small" />;
      default:
        return <Schedule fontSize="small" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "group_join":
        return "primary";
      case "book_purchase":
        return "success";
      default:
        return "default";
    }
  };

  return (
    <Card variant="outlined">
      <CardHeader title="최근 활동" titleTypographyProps={{ variant: "h6" }} />
      <CardContent>
        <Stack spacing={2}>
          {mockRecentActivities.map((activity, index) => (
            <Box key={activity.id}>
              <Box display="flex" alignItems="center" gap={2}>
                <Box color={`${getActivityColor(activity.type)}.main`}>
                  {getActivityIcon(activity.type)}
                </Box>
                <Box flex={1}>
                  <Typography variant="body2">{activity.title}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(activity.date).toLocaleDateString("ko-KR")}
                  </Typography>
                </Box>
                <Chip
                  label={
                    activity.type === "group_join" ? "모임 가입" : "도서 구매"
                  }
                  size="small"
                  color={getActivityColor(activity.type) as any}
                  variant="outlined"
                />
              </Box>
              {index < mockRecentActivities.length - 1 && (
                <Divider sx={{ mt: 2 }} />
              )}
            </Box>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}

function ManagementSection({
  onOpenHighlightBrowser,
}: {
  onOpenHighlightBrowser: () => void;
}) {
  return (
    <Card variant="outlined">
      <CardHeader title="관리" titleTypographyProps={{ variant: "h6" }} />
      <CardContent>
        <Stack direction="row" spacing={2} flexWrap="wrap">
          <Button
            variant="contained"
            startIcon={<TrendingUp />}
            onClick={onOpenHighlightBrowser}
          >
            하이라이트 관리
          </Button>
          <Button
            variant="outlined"
            startIcon={<AutoStories />}
            disabled // API 준비 전까지 비활성화
          >
            읽은 책 관리
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}

function GroupsSection() {
  const [openGroupCreateModal, setOpenGroupCreateModal] = useState(false);

  return (
    <>
      <GroupCreateModal
        open={openGroupCreateModal}
        onClose={() => setOpenGroupCreateModal(false)}
      />
      <Stack spacing={3}>
        <GroupList
          kind={GroupListKind.MY_GROUP}
          title={"내가 만든 모임"}
          size="small"
          keyPrefix="myGroups"
          action={
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setOpenGroupCreateModal(true)}
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1,
                fontWeight: 600,
                boxShadow: 2,
                "&:hover": {
                  boxShadow: 4,
                  transform: "translateY(-1px)",
                },
                transition: "all 0.2s ease",
              }}
            >
              모임 만들기
            </Button>
          }
        />
        <GroupList
          kind={GroupListKind.JOINED_GROUP}
          title={"가입한 모임"}
          size="small"
          keyPrefix="joinedGroups"
        />
      </Stack>
    </>
  );
}

function BooksSection() {
  const navigate = Route.useNavigate();

  return (
    <Stack spacing={3}>
      <BookList
        kind={BookListKind.PURCHASED_BOOK}
        size="small"
        title="구매한 도서"
        action={
          <IconButton
            onClick={() =>
              navigate({ to: "/books", search: { title: undefined } })
            }
          >
            <ShoppingCart />
          </IconButton>
        }
      />

      {/* 읽은 책 목록 - API 준비 전까지는 플레이스홀더 */}
      <Card variant="outlined">
        <CardHeader
          title="읽은 책 목록"
          titleTypographyProps={{ variant: "h6" }}
          action={
            <IconButton disabled>
              <AutoStories />
            </IconButton>
          }
        />
        <CardContent>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            minHeight={200}
            color="text.secondary"
          >
            <Stack alignItems="center" spacing={2}>
              <AutoStories sx={{ fontSize: 48, opacity: 0.5 }} />
              <Typography variant="body2">
                읽은 책 목록 기능 준비 중입니다
              </Typography>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Stack>
  );
}
