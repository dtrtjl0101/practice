import {
  GroupAdd,
  ShoppingCart,
  Edit,
  AutoStories,
  TrendingUp,
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
  Paper,
  Alert,
} from "@mui/material";
import { createFileRoute } from "@tanstack/react-router";
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

function ProfileSection({ userId }: { userId: number }) {
  const [openProfileEditModal, setOpenProfileEditModal] = useState(false);

  const { data: userProfile } = useQuery({
    queryKey: ["userProfile", userId],
    queryFn: async () => {
      const response = await API_CLIENT.userController.userInfo();
      if (!response.isSuccessful) {
        throw new Error(response.error);
      }
      const formattedUserData = {
        nickname: response.data?.nickname || "",
        profileImageURL: response.data?.profileImageURL || "",
        email: response.data?.email || "",
        role: response.data?.role || "ROLE_USER",
      };
      return formattedUserData;
    },
  });

  return (
    <>
      <UserProfileEditModal
        open={openProfileEditModal}
        onClose={() => setOpenProfileEditModal(false)}
        userData={userProfile}
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
                disabled={true} // API 준비 전까지 비활성화
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

function RecentActivitySection() {
  return (
    <Card variant="outlined">
      <CardHeader title="최근 활동" titleTypographyProps={{ variant: "h6" }} />
      <CardContent>
        <Stack spacing={2}>
          <Alert severity="info">구현 예정입니다...</Alert>
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
