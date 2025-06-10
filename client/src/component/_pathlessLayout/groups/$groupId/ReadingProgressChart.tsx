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
import { useMemo } from "react";

interface ReadingProgressData {
  date: string;
  myPercentage?: number;
  averagePercentage?: number;
}

interface ActivityInfo {
  activityId: number;
  groupId: number;
  bookId: number;
  bookTitle: string;
  bookAuthor: string;
  coverImageURL: string;
  bookDescription: string;
  startTime: string;
  endTime: string;
  description: string;
  isParticipant: boolean;
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
              {entry.dataKey === "myPercentage"
                ? "내 진행도"
                : entry.dataKey === "averagePercentage"
                  ? "모임 평균"
                  : "목표 독서율"}
              : {entry.value}%
            </Typography>
          </Box>
        ))}
      </Box>
    );
  }
  return null;
}

export function ReadingProgressChart({
  activityId,
}: {
  activityId: number;
  bookId: number;
}) {
  const theme = useTheme();

  // Activity 정보 가져오기
  const { data: activityInfo } = useQuery({
    queryKey: ["activityInfo", activityId],
    queryFn: async () => {
      const response =
        await API_CLIENT.activityController.getActivity(activityId);
      if (!response.isSuccessful) {
        throw new Error(response.error);
      }
      return response.data as ActivityInfo;
    },
  });

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

  // 차트 데이터 생성
  const chartData = useMemo(() => {
    if (!activityInfo) return [];

    const startDate = new Date(activityInfo.startTime);
    const endDate = new Date(activityInfo.endTime);
    const today = new Date();

    // 모든 날짜 범위 생성 (startDate부터 endDate까지)
    const dateRange = [];
    for (
      let d = new Date(startDate);
      d <= endDate;
      d.setDate(d.getDate() + 1)
    ) {
      dateRange.push(new Date(d));
    }

    // 기존 진행도 데이터를 Map으로 변환 (빠른 조회를 위해)
    const progressMap = new Map();
    readingProgressHistory.forEach((item) => {
      const dateKey = new Date(item.date).toDateString();
      progressMap.set(dateKey, item);
    });

    const result = dateRange.map((date, _) => {
      const dateKey = date.toDateString();
      const isToday = date.toDateString() === today.toDateString();
      const isFuture = date > today;

      // 목표 독서율 계산 (startTime: 0%, endTime: 100%의 직선)
      const totalDays = Math.ceil(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      const currentDay = Math.ceil(
        (date.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      const targetPercentage = Math.min(
        100,
        Math.max(0, (currentDay / totalDays) * 100)
      );

      // 기존 데이터가 있는 경우
      if (progressMap.has(dateKey) && !isFuture && !isToday) {
        const data = progressMap.get(dateKey);
        return {
          date,
          dateString: date.toLocaleDateString("ko-KR", {
            month: "short",
            day: "numeric",
          }),
          myPercentage: data.myPercentage,
          averagePercentage: data.averagePercentage,
          targetPercentage: Math.round(targetPercentage * 10) / 10,
        };
      }

      // 미래 날짜인 경우 - null로 처리해서 라인을 끊음
      if (isToday || isFuture) {
        return {
          date,
          dateString: date.toLocaleDateString("ko-KR", {
            month: "short",
            day: "numeric",
          }),
          myPercentage: null, // 미래 데이터는 null로 처리
          averagePercentage: null, // 미래 데이터는 null로 처리
          targetPercentage: Math.round(targetPercentage * 10) / 10, // 목표선은 계속 표시
        };
      }

      // 과거 날짜이지만 데이터가 없는 경우 (기본값 0으로 처리)
      return {
        date,
        dateString: date.toLocaleDateString("ko-KR", {
          month: "short",
          day: "numeric",
        }),
        myPercentage: 0,
        averagePercentage: 0,
        targetPercentage: Math.round(targetPercentage * 10) / 10,
      };
    });

    return result.filter((item) => item !== undefined);
  }, [activityInfo, readingProgressHistory]);

  // 통계 계산 (null이 아닌 데이터만 사용)
  const validData = chartData.filter((item) => item.myPercentage !== null);
  const latestData = validData[validData.length - 1];
  const myProgress = latestData?.myPercentage || 0;
  const avgProgress = latestData?.averagePercentage || 0;
  const targetProgress = latestData?.targetPercentage || 0;
  const totalDays = chartData.length;

  if (!activityInfo?.isParticipant) {
    return <ProgressChartSkeleton message={"모임에 가입해야합니다."} />;
  }

  if (isLoading) {
    return <ProgressChartSkeleton message={"로딩중..."} />;
  }

  if (readingProgressHistory.length === 0) {
    return (
      <Card variant="outlined">
        <CardContent sx={{ p: 3 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 3 }}
          >
            <Stack direction="row" spacing={2}>
              <Typography variant="h4" sx={{ mb: 2 }}>
                진행도
              </Typography>
              <Typography
                alignSelf="end"
                variant="subtitle1"
                color="text.secondary"
              >
                전일 기준
              </Typography>
            </Stack>
          </Stack>
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
          <Stack direction="row" spacing={2}>
            <Typography variant="h4" sx={{ mb: 2 }}>
              진행도
            </Typography>
            <Typography
              alignSelf="end"
              variant="subtitle1"
              color="text.secondary"
            >
              전일 기준
            </Typography>
          </Stack>
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
                  모임 평균
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

        {/* 차트 */}
        <Box sx={{ height: 300, width: "100%" }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis
                dataKey="dateString"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                interval="preserveStartEnd"
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

              {/* 목표 독서율 라인 */}
              <Line
                type="monotone"
                dataKey="targetPercentage"
                stroke={theme.palette.warning.main}
                strokeWidth={2}
                strokeDasharray="8 4"
                dot={false}
                activeDot={{
                  r: 6,
                  stroke: theme.palette.warning.main,
                  strokeWidth: 2,
                }}
                name="목표 독서율"
                connectNulls={false} // null 값에서 라인을 끊지 않음 (목표선은 계속 표시)
              />

              {/* 내 진행도 라인 */}
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
                connectNulls={true} // null 값에서 라인을 끊음
              />

              {/* 모임 평균 라인 */}
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
                name="모임 평균"
                connectNulls={true} // null 값에서 라인을 끊음
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
            {myProgress > targetProgress
              ? `목표보다 ${(myProgress - targetProgress).toFixed(1)}% 앞서고 있습니다! 🎉`
              : myProgress < targetProgress
                ? `목표보다 ${(targetProgress - myProgress).toFixed(1)}% 뒤처져 있습니다. 화이팅! 💪`
                : "목표와 동일한 진행도입니다! 👍"}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
}

// 로딩 스켈레톤
function ProgressChartSkeleton({ message }: { message: string }) {
  const theme = useTheme();
  return (
    <Card variant="outlined">
      <CardContent sx={{ p: 3 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 3 }}
        >
          <Stack direction="row" spacing={2}>
            <Typography variant="h4" sx={{ mb: 2 }}>
              진행도
            </Typography>
            <Typography
              alignSelf="end"
              variant="subtitle1"
              color="text.secondary"
            >
              전일 기준
            </Typography>
          </Stack>
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

        <Box
          sx={{
            textAlign: "center",
            py: 4,
            color: "text.secondary",
            bgcolor: alpha(theme.palette.text.primary, 0.1),
            borderRadius: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Timeline sx={{ fontSize: 48, mb: 1, opacity: 0.3 }} />
          <Typography variant="body2">{message}</Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
