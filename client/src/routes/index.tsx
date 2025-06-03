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
import EventCarousel from "../component/EventCarousel";
import {
  Groups,
  MenuBook,
  TrendingUp,
  LocationOn,
  Schedule,
  EmojiEvents,
  AutoStories,
} from "@mui/icons-material";

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
        새로운 책과 사람을 만나며 더 깊이 있는 독서를 경험해보세요. 전국
        독서가들과 함께하는 특별한 독서 모임에 참여하세요.
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

  const stats = [
    {
      icon: <Groups />,
      number: "1,234",
      label: "활성 모임",
      color: theme.palette.primary.main,
    },
    {
      icon: <MenuBook />,
      number: "45,678",
      label: "참여 회원",
      color: theme.palette.success.main,
    },
    {
      icon: <AutoStories />,
      number: "12,345",
      label: "완독한 책",
      color: theme.palette.info.main,
    },
    {
      icon: <TrendingUp />,
      number: "156",
      label: "이번 달 신규 모임",
      color: theme.palette.warning.main,
    },
  ];

  return (
    <Grid container spacing={3} sx={{ mb: 6 }}>
      {stats.map((stat) => (
        <Grid size={{ xs: 6, md: 3 }} key={stat.label}>
          <Card
            elevation={0}
            variant="outlined"
            sx={{
              textAlign: "center",
              py: 3,
              background: `linear-gradient(135deg, ${alpha(stat.color, 0.1)} 0%, ${alpha(stat.color, 0.05)} 100%)`,
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

// Featured Groups Section Component
function FeaturedGroupsSection() {
  const navigate = useNavigate();

  const featuredGroups = [
    {
      title: "아침 독서 모임",
      currentBook: "사피엔스",
      members: 24,
      nextMeeting: "화요일 오전 7시",
      tags: ["온라인", "인문학", "정기모임"],
      description:
        "매주 화요일 오전 7시, 온라인으로 만나는 아침 독서 모임입니다.",
      isOnline: true,
    },
    {
      title: "비즈니스 북클럽",
      currentBook: "린 스타트업",
      members: 18,
      nextMeeting: "목요일 오후 7시",
      tags: ["강남", "경영", "월 2회"],
      description: "직장인들을 위한 경영/비즈니스 도서 모임입니다.",
      isOnline: false,
      location: "강남",
    },
    {
      title: "소설 애호가 모임",
      currentBook: "윤성우의 열혈 프로그래밍",
      members: 32,
      nextMeeting: "일요일 오후 2시",
      tags: ["하이브리드", "소설", "주 1회"],
      description:
        "한국 현대소설부터 세계문학까지 다양한 소설을 함께 읽습니다.",
      isOnline: true,
    },
  ];

  return (
    <Box sx={{ mb: 6 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 3 }}
      >
        <Typography variant="h4" component="h2">
          🔥 지금 인기있는 독서 모임
        </Typography>
        <Button onClick={() => navigate({ to: "/groups" })}>
          모든 모임 보기
        </Button>
      </Stack>
      <Grid container spacing={3}>
        {featuredGroups.map((group, index) => (
          <Grid size={{ xs: 12, md: 6 }} key={index}>
            <Card
              sx={{
                height: "100%",
                cursor: "pointer",
                transition: "all 0.3s ease",
                borderLeft: 4,
                borderLeftColor: "primary.main",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: 3,
                },
              }}
              variant="outlined"
              onClick={() => navigate({ to: `/groups/${index + 1}` })}
            >
              <CardContent sx={{ p: 3 }}>
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={2}
                  sx={{ mb: 2 }}
                >
                  <Avatar
                    sx={{
                      bgcolor: "primary.main",
                      width: 48,
                      height: 48,
                    }}
                  >
                    📖
                  </Avatar>
                  <Box flex={1}>
                    <Typography variant="h6" fontWeight="bold" color="primary">
                      {group.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      현재 읽는 책: {group.currentBook} • {group.members}명 참여
                    </Typography>
                  </Box>
                </Stack>

                <Typography variant="body2" sx={{ mb: 2 }}>
                  {group.description}
                </Typography>

                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  sx={{ mb: 2 }}
                >
                  <Schedule fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    {group.nextMeeting}
                  </Typography>
                  {!group.isOnline && (
                    <>
                      <LocationOn fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {group.location}
                      </Typography>
                    </>
                  )}
                </Stack>

                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {group.tags.map((tag, tagIndex) => (
                    <Chip
                      key={tagIndex}
                      label={tag}
                      size="small"
                      variant="outlined"
                      color="primary"
                    />
                  ))}
                </Stack>
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
    <Paper
      elevation={0}
      sx={{ bgcolor: "grey.50", p: 6, borderRadius: 3, mb: 6 }}
    >
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

        {/* Event Carousel */}
        <EventCarousel />

        {/* Featured Groups */}
        <FeaturedGroupsSection />

        {/* Categories */}
        <CategoriesSection />

        <Box>
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
              onClick={() => navigate({ to: "/about" })}
            >
              서비스 둘러보기
            </Button>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
}
