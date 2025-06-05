import {
  Button,
  Container,
  Stack,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  Paper,
  useTheme,
  alpha,
} from "@mui/material";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import BookList from "../component/BookList";
import GroupList from "../component/GroupList";
import EventCarousel from "../component/EventCarousel";
import {
  Groups,
  MenuBook,
  TrendingUp,
  EmojiEvents,
  AutoStories,
  Workspaces,
  People,
} from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import API_CLIENT from "../api/api";
import { HomeStatistics } from "../types/HomeStatistics";

export const Route = createFileRoute("/")({
  component: Home,
});

// Hero Section Component
function HeroSection() {
  const navigate = useNavigate();
  const theme = useTheme();

  return (
    <Box
      sx={{
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.success.main} 100%)`,
        color: "white",
        py: 8,
        px: 3,
        borderRadius: 3,
        textAlign: "center",
        mb: 6,
      }}
    >
      <Typography variant="h2" component="h1" fontWeight="bold" gutterBottom>
        함께 읽고, 함께 성장하는
        <br />
        독서 여정
      </Typography>
      <Typography
        variant="h6"
        sx={{ mb: 4, opacity: 0.9, maxWidth: 600, mx: "auto" }}
      >
        새로운 책과 사람을 만나며 더 깊이 있는 독서를 경험해보세요.
        <br />
        책잇에서 전국 독서가들과 함께하는 특별한 독서 모임에 참여하세요.
      </Typography>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        justifyContent="center"
      >
        <Button
          variant="contained"
          size="large"
          sx={{
            bgcolor: theme.palette.common.white,
            color: theme.palette.primary.main,
            px: 4,
            py: 1.5,
            fontSize: "1.1rem",
            fontWeight: "bold",
            minWidth: "150px",
            "&:hover": {
              bgcolor: alpha(theme.palette.common.white, 0.9),
              transform: "translateY(-2px)",
            },
          }}
          onClick={() => navigate({ to: "/groups" })}
        >
          모임 찾기
        </Button>
        <Button
          variant="outlined"
          size="large"
          sx={{
            borderColor: theme.palette.common.white,
            color: theme.palette.common.white,
            px: 4,
            py: 1.5,
            fontSize: "1.1rem",
            fontWeight: "bold",
            minWidth: "150px",
            "&:hover": {
              bgcolor: alpha(theme.palette.common.white, 0.1),
              borderColor: theme.palette.common.white,
            },
          }}
          onClick={() =>
            navigate({ to: "/books", search: { title: undefined } })
          }
        >
          책 찾기
        </Button>
      </Stack>
    </Box>
  );
}

// Stats Section Component
function StatsSection() {
  const theme = useTheme();
  const { data: homeStats } = useQuery({
    queryKey: ["homeStats"],
    queryFn: async () => {
      const response =
        await API_CLIENT.statisticsController.getMainStatistics();
      if (!response.isSuccessful) {
        throw new Error(response.error);
      }
      return response.data as HomeStatistics;
    },
    initialData: {} as HomeStatistics,
  });

  const stats = [
    {
      icon: <Workspaces />,
      number: homeStats.totalGroups,
      label: "활성 모임",
      color: theme.palette.primary.main,
    },
    {
      icon: <People />,
      number: homeStats.totalUsers,
      label: "참여 회원",
      color: theme.palette.success.main,
    },
    {
      icon: <AutoStories />,
      number: homeStats.totalEbooks,
      label: "등록 권 수",
      color: theme.palette.secondary.main,
    },
    {
      icon: <TrendingUp />,
      number: homeStats.increasedActivities,
      label: "이번 달 신규 모임",
      color: theme.palette.warning.main,
    },
  ];

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        width: "100%",
        mb: 6,
      }}
    >
      <Grid container spacing={3} sx={{ maxWidth: "md", width: "100%" }}>
        {stats.map((stat) => (
          <Grid size={{ xs: 6, md: 3 }} key={stat.label}>
            <Card
              elevation={0}
              variant="outlined"
              sx={{
                textAlign: "center",
                py: 3,
                background: `linear-gradient(135deg, ${alpha(stat.color, 0.15)} 0%, ${alpha(stat.color, 0.05)} 100%)`,
                border: `1px solid ${alpha(stat.color, 0.2)}`,
                transition: "transform 0.3s ease",
                "&:hover": {
                  transform: "translateY(-4px)",
                },
              }}
            >
              <Avatar
                sx={{
                  bgcolor: stat.color,
                  width: 56,
                  height: 56,
                  mx: "auto",
                  mb: 2,
                }}
              >
                {stat.icon}
              </Avatar>
              <Typography variant="h4" fontWeight="bold" color={stat.color}>
                {stat.number}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {stat.label}
              </Typography>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

// Categories Section Component
function CategoriesSection() {
  const navigate = useNavigate();

  const categories = [
    {
      icon: "📖",
      title: "문학/소설",
      description: "한국문학, 세계문학, 추리소설",
      count: "234개 모임",
    },
    {
      icon: "💪",
      title: "자기계발",
      description: "성공, 습관, 자기관리",
      count: "189개 모임",
    },
    {
      icon: "💼",
      title: "경영/비즈니스",
      description: "경영전략, 마케팅, 투자",
      count: "156개 모임",
    },
    {
      icon: "🧠",
      title: "인문학",
      description: "철학, 역사, 심리학",
      count: "98개 모임",
    },
    {
      icon: "🔬",
      title: "과학/기술",
      description: "IT, 과학, 의학",
      count: "87개 모임",
    },
    {
      icon: "✍️",
      title: "에세이",
      description: "일상, 여행, 라이프스타일",
      count: "76개 모임",
    },
  ];

  return (
    <Box sx={{ mb: 6 }}>
      <Typography
        variant="h4"
        component="h2"
        textAlign="center"
        gutterBottom
        sx={{ mb: 4 }}
      >
        📚 관심 분야별 모임 찾기
      </Typography>
      <Grid container spacing={3}>
        {categories.map((category, index) => (
          <Grid size={{ xs: 6, md: 4, lg: 2 }} key={index}>
            <Card
              sx={{
                textAlign: "center",
                cursor: "pointer",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-8px)",
                  boxShadow: 3,
                },
                height: 1,
              }}
              variant="outlined"
              onClick={() =>
                navigate({
                  to: "/groups",
                  search: { category: category.title },
                })
              }
            >
              <CardContent sx={{ py: 3 }}>
                <Typography variant="h3" sx={{ mb: 2 }}>
                  {category.icon}
                </Typography>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  {category.title}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  {category.description}
                </Typography>
                <Chip
                  label={category.count}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

// How It Works Section Component
function HowItWorksSection() {
  const steps = [
    {
      number: "1",
      title: "관심 분야 선택",
      description: "좋아하는 장르나 관심있는 주제의 독서 모임을 찾아보세요.",
      icon: <MenuBook />,
    },
    {
      number: "2",
      title: "모임 참여하기",
      description:
        "마음에 드는 모임에 가입하거나 직접 새로운 모임을 만들어보세요.",
      icon: <Groups />,
    },
    {
      number: "3",
      title: "함께 독서하기",
      description:
        "책을 읽고 다른 멤버들과 생각을 나누며 더 깊은 독서를 경험하세요.",
      icon: <EmojiEvents />,
    },
  ];

  return (
    <Paper elevation={0} variant="outlined" sx={{ p: 6, mb: 6 }}>
      <Typography
        variant="h4"
        component="h2"
        textAlign="center"
        gutterBottom
        sx={{ mb: 4 }}
      >
        🚀 시작하는 방법
      </Typography>
      <Grid container spacing={4}>
        {steps.map((step, index) => (
          <Grid size={{ xs: 12, md: 4 }} key={index}>
            <Box textAlign="center">
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: "primary.main",
                  mx: "auto",
                  mb: 3,
                  fontSize: "2rem",
                  fontWeight: "bold",
                }}
              >
                {step.number}
              </Avatar>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                {step.title}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {step.description}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
}

// Main Home Component
function Home() {
  const navigate = useNavigate();
  const theme = useTheme();

  return (
    <Container maxWidth="lg" sx={{ my: 4 }}>
      <Stack spacing={6}>
        {/* Hero Section */}
        <HeroSection />

        {/* Live Stats */}
        <StatsSection />

        <Box className="coachmark-event-carousel">
          {/* Event Carousel */}
          <EventCarousel />
        </Box>

        {/* Featured Groups */}
        <Box
          sx={{ mb: 6 }}
          className="coachmark-popular-groups"
          maxWidth={"lg"}
        >
          <GroupList
            size="small"
            title="🔥 지금 인기있는 독서 모임"
            key="featuredGroups"
            action={
              <Button onClick={() => navigate({ to: "/groups" })}>
                모든 모임 보기
              </Button>
            }
          />
        </Box>

        {/* Categories */}
        <CategoriesSection />

        <Box className="coachmark-popular-books">
          <BookList
            size="small"
            title="🏆 이번 주 베스트셀러"
            action={
              <Button
                variant="outlined"
                onClick={() =>
                  navigate({ to: "/books", search: { title: undefined } })
                }
              >
                더보기
              </Button>
            }
          />
        </Box>

        {/* How It Works */}
        <HowItWorksSection />

        {/* Final CTA Section */}
        <Paper
          elevation={0}
          sx={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            p: 6,
            borderRadius: 3,
            textAlign: "center",
          }}
        >
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            지금 바로 시작해보세요!
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
            전국의 독서가들과 함께하는 특별한 독서 여정이 기다리고 있습니다.
          </Typography>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            justifyContent="center"
          >
            <Button
              variant="contained"
              size="large"
              sx={{
                bgcolor: theme.palette.common.white,
                color: "primary.main",
                px: 4,
                fontWeight: "bold",
              }}
              onClick={() => navigate({ to: "/register/member" })}
            >
              무료로 시작하기
            </Button>
            <Button
              variant="outlined"
              size="large"
              sx={{
                borderColor: theme.palette.common.white,
                color: theme.palette.common.white,
                px: 4,
                fontWeight: "bold",
                "&:hover": {
                  borderColor: theme.palette.common.white,
                  backgroundColor: alpha(theme.palette.common.white, 0.1),
                },
              }}
              // onClick={() => navigate({ to: "/about" })}
            >
              서비스 둘러보기
            </Button>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
}
