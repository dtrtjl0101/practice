import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Skeleton,
  Stack,
  Chip,
  useTheme,
  alpha,
  Paper,
  Divider,
} from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { TrendingUp, MenuBook, Timeline } from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import API_CLIENT from "../../../../api/api";

interface ReadingProgressData {
  date: string;
  myPercentage: number;
  averagePercentage: number;
}

// 커스텀 툴팁 컴포넌트
function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <Box
        sx={{
          bgcolor: "background.paper",
          border: 1,
          borderColor: "divider",
          borderRadius: 2,
          p: 2,
          boxShadow: 2,
        }}
      >
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          {/* {new Date(label).toLocaleDateString("ko-KR", {
            month: "long",
            day: "numeric",
          })} */}
          {label}
        </Typography>
        {payload.map((entry: any, index: number) => (
          <Box
            key={index}
            sx={{ display: "flex", alignItems: "center", gap: 1 }}
          >
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                bgcolor: entry.color,
              }}
            />
            <Typography variant="body2" color="text.secondary">
              {entry.dataKey === "myPercentage" ? "내 진행도" : "평균 진행도"}:{" "}
              {entry.value}%
            </Typography>
          </Box>
        ))}
      </Box>
    );
  }
  return null;
}

export function ReadingProgressChart({ activityId }: { activityId: number }) {
  const theme = useTheme();

  const { data: readingProgressHistory, isLoading } = useQuery({
    queryKey: ["readingProgressHistory", activityId],
    queryFn: async () => {
      const response =
        await API_CLIENT.readingProgressController.getProgressHistory(
          activityId
        );
      if (!response.isSuccessful) {
        throw new Error(response.error);
      }
      return response.data as ReadingProgressData[];
    },
    initialData: [] as ReadingProgressData[],
  });

  // 데이터 가공
  const chartData = readingProgressHistory.map((item) => ({
    ...item,
    date: new Date(item.date).toLocaleDateString("ko-KR", {
      month: "short",
      day: "numeric",
    }),
    fullDate: item.date,
  }));

  // 통계 계산
  const latestData = readingProgressHistory[readingProgressHistory.length - 1];
  const firstData = readingProgressHistory[0];
  const myProgress = latestData?.myPercentage || 0;
  const avgProgress = latestData?.averagePercentage || 0;
  const totalDays = readingProgressHistory.length;
  const myGrowth =
    latestData && firstData
      ? latestData.myPercentage - firstData.myPercentage
      : 0;

  if (isLoading) {
    return <ProgressChartSkeleton />;
  }

  if (readingProgressHistory.length === 0) {
    return (
      <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}` }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h4" sx={{ mb: 2 }}>
            진행도
          </Typography>
          <Box
            sx={{
              textAlign: "center",
              py: 4,
              color: "text.secondary",
            }}
          >
            <Timeline sx={{ fontSize: 48, mb: 1, opacity: 0.3 }} />
            <Typography variant="body2">
              아직 진행도 데이터가 없습니다
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Paper sx={{ p: 2 }} variant="outlined">
      {/* 헤더 */}
      <Stack spacing={2}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 3 }}
        >
          <Typography variant="h4">진행도</Typography>
          <Chip
            icon={<MenuBook />}
            label={`${totalDays}일간`}
            size="small"
            variant="outlined"
          />
        </Stack>
        <Divider />

        {/* 통계 카드들 */}
        <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
          <Box
            sx={{
              flex: 1,
              p: 2,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1}>
              <Box
                sx={{
                  p: 1,
                  borderRadius: 1,
                  bgcolor: theme.palette.primary.main,
                  color: "white",
                }}
              >
                <TrendingUp fontSize="small" />
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  내 진행도
                </Typography>
                <Typography variant="h6" fontWeight={700} color="primary.main">
                  {myProgress}%
                </Typography>
              </Box>
            </Stack>
          </Box>

          <Box
            sx={{
              flex: 1,
              p: 2,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.secondary.main, 0.1),
              border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`,
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1}>
              <Box
                sx={{
                  p: 1,
                  borderRadius: 1,
                  bgcolor: theme.palette.secondary.main,
                  color: "white",
                }}
              >
                <MenuBook fontSize="small" />
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  평균 진행도
                </Typography>
                <Typography
                  variant="h6"
                  fontWeight={700}
                  color="secondary.main"
                >
                  {avgProgress}%
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Stack>

        {/* 성장률 표시 */}
        {myGrowth !== 0 && (
          <Box sx={{ mb: 3 }}>
            <Chip
              label={`${myGrowth > 0 ? "+" : ""}${myGrowth.toFixed(1)}% 성장`}
              size="small"
              color={myGrowth > 0 ? "success" : "error"}
              sx={{ fontWeight: 600 }}
            />
          </Box>
        )}

        {/* 차트 */}
        <Box sx={{ height: 300, width: "100%" }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
              />
              <YAxis
                domain={[0, 100]}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                label={{
                  value: "진행도 (%)",
                  angle: -90,
                  position: "insideLeft",
                  style: {
                    textAnchor: "middle",
                    fill: theme.palette.text.secondary,
                  },
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ paddingTop: "20px" }} iconType="circle" />
              <Line
                type="monotone"
                dataKey="myPercentage"
                stroke={theme.palette.primary.main}
                strokeWidth={3}
                dot={{ fill: theme.palette.primary.main, strokeWidth: 2, r: 5 }}
                activeDot={{
                  r: 7,
                  stroke: theme.palette.primary.main,
                  strokeWidth: 2,
                }}
                name="내 진행도"
              />
              <Line
                type="monotone"
                dataKey="averagePercentage"
                stroke={theme.palette.secondary.main}
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{
                  fill: theme.palette.secondary.main,
                  strokeWidth: 2,
                  r: 4,
                }}
                activeDot={{
                  r: 6,
                  stroke: theme.palette.secondary.main,
                  strokeWidth: 2,
                }}
                name="평균 진행도"
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>

        {/* 하단 정보 */}
        <Box
          sx={{
            mt: 2,
            pt: 2,
            borderTop: `1px solid ${theme.palette.divider}`,
            textAlign: "center",
          }}
        >
          <Typography variant="body2" color="text.secondary">
            {myProgress > avgProgress
              ? `평균보다 ${(myProgress - avgProgress).toFixed(1)}% 앞서고 있습니다! 🎉`
              : myProgress < avgProgress
                ? `평균보다 ${(avgProgress - myProgress).toFixed(1)}% 뒤처져 있습니다. 화이팅! 💪`
                : "평균과 동일한 진행도입니다! 👍"}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
}

// 로딩 스켈레톤
function ProgressChartSkeleton() {
  return (
    <Card elevation={0} sx={{ border: "1px solid #e0e0e0" }}>
      <CardContent sx={{ p: 3 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 3 }}
        >
          <Typography variant="h4">진행도</Typography>
          <Skeleton
            variant="rectangular"
            width={80}
            height={24}
            sx={{ borderRadius: 2 }}
          />
        </Stack>

        <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
          <Skeleton
            variant="rectangular"
            height={80}
            sx={{ flex: 1, borderRadius: 2 }}
          />
          <Skeleton
            variant="rectangular"
            height={80}
            sx={{ flex: 1, borderRadius: 2 }}
          />
        </Stack>

        <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
      </CardContent>
    </Card>
  );
}
