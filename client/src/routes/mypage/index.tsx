import {
  GroupAdd,
  ShoppingCart,
  Edit,
  AutoStories,
  TrendingUp,
  Add,
  Schedule,
  ArrowForward,
  Group,
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
  Paper,
  Alert,
  Divider,
  Skeleton,
} from "@mui/material";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import BookList, { BookListKind } from "../../component/BookList";
import GroupCreateModal from "../../component/groupCreate/GroupCreateModal";
import GroupList, { GroupListKind } from "../../component/GroupList";
import HighlightBrowserModal from "../../component/HighlightBrowserModal";
import { useAtomValue } from "jotai";
import { AuthState } from "../../states/auth";
import { useQuery } from "@tanstack/react-query";
import API_CLIENT from "../../api/api";
import UserProfileEditModal from "../../component/UserProfileEditModal";
import { UserProfile } from "../../types/userInfo";

export const Route = createFileRoute("/mypage/")({
  component: RouteComponent,
});

function RouteComponent() {
  const [openHighlightBrowserModal, setOpenHighlightBrowserModal] =
    useState(false);
  const user = useAtomValue(AuthState.user);

  if (!user) {
    return (
      <Container sx={{ my: 4 }}>
        <Alert severity="error">로그인 후 이용할 수 있습니다.</Alert>
      </Container>
    );
  }

  return (
    <>
      <HighlightBrowserModal
        open={openHighlightBrowserModal}
        onClose={() => setOpenHighlightBrowserModal(false)}
      />
      <Container sx={{ my: 4 }}>
        <Stack spacing={4}>
          {/* 프로필 섹션 */}
          <ProfileSection userId={user?.memberId} />

          {/* 통계 카드들 */}
          <StatsSection userId={user?.memberId} />

          {/* 최근 활동 */}
          <RecentActivitySection userId={user?.memberId} />

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

function ProfileSection({ userId }: { userId: number }) {
  const [openProfileEditModal, setOpenProfileEditModal] = useState(false);

  const { data: userProfile } = useQuery({
    queryKey: ["userProfile", userId],
    queryFn: async () => {
      const response = await API_CLIENT.userController.userInfo();
      if (!response.isSuccessful) {
        throw new Error(response.error);
      }
      return response.data as UserProfile;
    },
  });

  return (
    <>
      <UserProfileEditModal
        open={openProfileEditModal}
        onClose={() => setOpenProfileEditModal(false)}
        userData={
          userProfile as {
            nickname: string;
            email: string;
            profileImageURL?: string;
            role: string;
          }
        }
        userId={userId}
      />

      <Card variant="outlined">
        <CardContent>
          <Box display="flex" alignItems="center" gap={3}>
            <Box position="relative">
              <Avatar
                src={userProfile?.profileImageURL}
                sx={{ width: 80, height: 80 }}
              >
                {userProfile?.nickname?.charAt(0)}
              </Avatar>
            </Box>

            <Box flex={1}>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <Typography variant="h5" component="h1">
                  {userProfile?.nickname}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" mb={1}>
                {userProfile?.email}
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={1}>
                회원가입일:{" "}
                {new Date(userProfile?.createdAt ?? 0).toLocaleDateString(
                  "ko-KR",
                )}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                역할:{" "}
                {userProfile?.role === "ROLE_ADMIN"
                  ? "관리자"
                  : userProfile?.role === "ROLE_PUBLISHER"
                    ? "출판사"
                    : "유저"}
              </Typography>
            </Box>

            {/* 프로필 편집 버튼 */}
            <Box>
              <Button
                variant="outlined"
                startIcon={<Edit />}
                onClick={() => setOpenProfileEditModal(true)}
                sx={{ borderRadius: 2 }}
              >
                프로필 편집
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </>
  );
}

function StatsSection({ userId }: { userId: number }) {
  const { data: highlightCount } = useQuery({
    queryKey: ["highlightCount", userId],
    queryFn: async () => {
      const response = await API_CLIENT.userController.getMyHighlights();
      if (!response.isSuccessful) {
        throw new Error(response.error);
      }
      return response.data.totalItems;
    },
  });

  const { data: joinedActivityCount } = useQuery({
    queryKey: ["joinedActivityCount", userId],
    queryFn: async () => {
      const response = await API_CLIENT.userController.getMyActivities({
        pageable: { page: 0, size: 0 },
      });
      if (!response.isSuccessful) {
        throw new Error(response.error);
      }
      return response.data.totalItems;
    },
  });

  const { data: purchasedBookCount } = useQuery({
    queryKey: ["purchasedBookCount", userId],
    queryFn: async () => {
      const response = await API_CLIENT.ebookPurchaseController.getMyBooks();
      if (!response.isSuccessful) {
        throw new Error(response.error);
      }
      return response.data.totalItems;
    },
  });

  const { data: joinedGroupCount } = useQuery({
    queryKey: ["joinedGroupCount", userId],
    queryFn: async () => {
      const response = await API_CLIENT.userController.getMyGroups({
        pageable: { page: 0, size: 0 },
      });
      if (!response.isSuccessful) {
        throw new Error(response.error);
      }
      return response.data.totalItems;
    },
  });

  const stats = [
    {
      icon: <TrendingUp />,
      title: "등록한 하이라이트",
      count: highlightCount,
      color: "primary",
    },
    {
      icon: <AutoStories />,
      title: "가입한 활동",
      count: joinedActivityCount,
      color: "success",
    },
    {
      icon: <ShoppingCart />,
      title: "구매한 책",
      count: purchasedBookCount,
      color: "info",
    },
    {
      icon: <GroupAdd />,
      title: "가입한 모임",
      count: joinedGroupCount,
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

interface RecentActivity {
  recentGroupId: number;
  recentGroupName: string;
  recentGroupImageURL: string;
  recentActivityId: number;
  recentActivityBookTitle: string;
  recentActivityBookAuthor: string;
  recentActivityBookCoverImageURL: string;
}

function RecentActivitySection({ userId }: { userId: number }) {
  const navigate = useNavigate();

  // 최근 활동 데이터 가져오기
  const {
    data: recentActivity,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["recentActivity", userId],
    queryFn: async () => {
      try {
        // 사용자 정보에서 최근 활동 정보 가져오기
        const response = await API_CLIENT.userController.userInfo();

        if (!response.isSuccessful) {
          throw new Error(response.error);
        }

        const data = response.data;

        // 최근 활동이 있는지 확인
        if (data.recentGroupId && data.recentActivityId) {
          return {
            recentGroupId: data.recentGroupId,
            recentGroupName: data.recentGroupName,
            recentGroupImageURL: data.recentGroupImageURL,
            recentActivityId: data.recentActivityId,
            recentActivityBookTitle: data.recentActivityBookTitle,
            recentActivityBookAuthor: data.recentActivityBookAuthor,
            recentActivityBookCoverImageURL:
              data.recentActivityBookCoverImageURL,
          } as RecentActivity;
        }

        return null;
      } catch (error) {
        console.error("최근 활동 조회 실패:", error);
        return null;
      }
    },
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5분간 캐시
  });

  const handleNavigateToActivity = () => {
    if (recentActivity) {
      navigate({
        to: "/groups/$groupId",
        params: {
          groupId: recentActivity.recentGroupId,
        },
      });
    }
  };

  const handleNavigateToGroup = () => {
    if (recentActivity) {
      navigate({
        to: "/groups/$groupId",
        params: { groupId: recentActivity.recentGroupId },
      });
    }
  };

  return (
    <Card variant="outlined">
      <CardHeader
        title="최근 활동"
        titleTypographyProps={{ variant: "h6" }}
        action={
          recentActivity && (
            <Button
              size="small"
              endIcon={<ArrowForward />}
              onClick={() =>
                navigate({ to: "/groups", search: { searchTerms: [] } })
              }
              sx={{ fontSize: "0.875rem" }}
            >
              전체 보기
            </Button>
          )
        }
      />
      <CardContent>
        {isLoading ? (
          <RecentActivitySkeleton />
        ) : error ? (
          <Alert severity="error">최근 활동을 불러오는데 실패했습니다.</Alert>
        ) : !recentActivity ? (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            py={4}
            color="text.secondary"
          >
            <Schedule sx={{ fontSize: 48, opacity: 0.5, mb: 2 }} />
            <Typography variant="body2" mb={2}>
              최근 참여한 활동이 없습니다
            </Typography>
            <Button
              variant="outlined"
              size="small"
              startIcon={<Group />}
              onClick={() =>
                navigate({ to: "/groups", search: { searchTerms: [] } })
              }
            >
              모임 둘러보기
            </Button>
          </Box>
        ) : (
          <Paper
            elevation={0}
            sx={{
              p: 2,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
              cursor: "pointer",
              transition: "all 0.2s ease",
              "&:hover": {
                borderColor: "primary.main",
                boxShadow: 2,
                transform: "translateY(-1px)",
              },
            }}
            onClick={handleNavigateToActivity}
          >
            <Stack spacing={2}>
              {/* 그룹 정보 */}
              <Box
                display="flex"
                alignItems="center"
                gap={1.5}
                onClick={(e) => {
                  e.stopPropagation();
                  handleNavigateToGroup();
                }}
                sx={{
                  cursor: "pointer",
                  p: 1,
                  borderRadius: 1,
                  "&:hover": { bgcolor: "action.hover" },
                }}
              >
                <Avatar
                  src={recentActivity.recentGroupImageURL}
                  sx={{ width: 32, height: 32, bgcolor: "primary.main" }}
                >
                  {recentActivity.recentGroupName.charAt(0)}
                </Avatar>
                <Box flex={1}>
                  <Typography variant="subtitle2" fontWeight={600} noWrap>
                    {recentActivity.recentGroupName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    독서 모임
                  </Typography>
                </Box>
                <Group sx={{ fontSize: 16, color: "action.active" }} />
              </Box>

              <Divider />

              {/* 활동 정보 - 도서 기반 */}
              <Box display="flex" alignItems="center" gap={1.5}>
                <Avatar
                  src={recentActivity.recentActivityBookCoverImageURL}
                  variant="rounded"
                  sx={{
                    width: 40,
                    height: 50,
                    bgcolor: "grey.200",
                    "& img": {
                      objectFit: "cover",
                    },
                  }}
                >
                  📚
                </Avatar>
                <Box flex={1}>
                  <Typography variant="body2" fontWeight={600} mb={0.5} noWrap>
                    {recentActivity.recentActivityBookTitle}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                    mb={0.5}
                  >
                    {recentActivity.recentActivityBookAuthor}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    독서 활동
                  </Typography>
                </Box>
                <ArrowForward sx={{ fontSize: 16, color: "action.active" }} />
              </Box>
            </Stack>
          </Paper>
        )}
      </CardContent>
    </Card>
  );
}

function RecentActivitySkeleton() {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
      }}
    >
      <Stack spacing={2}>
        {/* 그룹 정보 스켈레톤 */}
        <Box display="flex" alignItems="center" gap={1.5}>
          <Skeleton variant="circular" width={32} height={32} />
          <Box flex={1}>
            <Skeleton width="60%" height={20} />
            <Skeleton width="40%" height={16} />
          </Box>
        </Box>

        <Divider />

        {/* 활동 정보 스켈레톤 */}
        <Box display="flex" alignItems="center" gap={1.5}>
          <Skeleton variant="circular" width={20} height={20} />
          <Box flex={1}>
            <Skeleton width="80%" height={18} />
            <Box display="flex" gap={1} mt={0.5}>
              <Skeleton width={60} height={16} />
              <Skeleton width={80} height={16} />
            </Box>
          </Box>
        </Box>
      </Stack>
    </Paper>
  );
}

export default RecentActivitySection;

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
          <Button variant="outlined" startIcon={<AutoStories />}>
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
          key={"myGroups-small"}
          kind={GroupListKind.MY_GROUP}
          title={"내가 만든 모임"}
          size="small"
          keyPrefix="myGroups"
          action={
            <IconButton onClick={() => setOpenGroupCreateModal(true)}>
              <Add />
            </IconButton>
          }
        />
        <GroupList
          key={"joinedGroups-small"}
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
