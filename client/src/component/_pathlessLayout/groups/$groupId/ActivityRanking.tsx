import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Avatar,
  Stack,
  Box,
  Chip,
  alpha,
  useTheme,
  Skeleton,
  Divider,
  Paper,
} from "@mui/material";
import { EmojiEvents, Star, Whatshot } from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import API_CLIENT from "../../../../api/api";

interface UserScore {
  userId: number;
  userProfileImageURL: string;
  userNickname: string;
  score: number;
}

export function ActivityRanking({ activityId }: { activityId: number }) {
  const theme = useTheme();

  const { data: scores, isLoading } = useQuery({
    queryKey: ["activityRanking", activityId],
    queryFn: async () => {
      const response =
        await API_CLIENT.activityController.getActivityTop5Scores(activityId);
      if (!response.isSuccessful) {
        throw new Error(response.error);
      }
      return response.data as UserScore[];
    },
    initialData: [] as UserScore[],
  });

  // 점수 기준으로 내림차순 정렬
  const sortedScores = [...scores].sort((a, b) => b.score - a.score);

  // 랭킹 아이콘 및 색상 결정
  const getRankingStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return {
          icon: <EmojiEvents sx={{ color: "#FFD700" }} />,
          bgColor: alpha("#FFD700", 0.1),
          borderColor: "#FFD700",
          textColor: "#B8860B",
        };
      case 2:
        return {
          icon: <EmojiEvents sx={{ color: "#C0C0C0" }} />,
          bgColor: alpha("#C0C0C0", 0.1),
          borderColor: "#C0C0C0",
          textColor: "#696969",
        };
      case 3:
        return {
          icon: <EmojiEvents sx={{ color: "#CD7F32" }} />,
          bgColor: alpha("#CD7F32", 0.1),
          borderColor: "#CD7F32",
          textColor: "#8B4513",
        };
      default:
        return {
          icon: <Star sx={{ color: theme.palette.primary.main }} />,
          bgColor: alpha(theme.palette.primary.main, 0.05),
          borderColor: theme.palette.divider,
          textColor: theme.palette.text.secondary,
        };
    }
  };

  if (isLoading) {
    return <RankingSkeleton />;
  }

  if (scores.length === 0) {
    return (
      <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}` }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
            🏆 활동 랭킹
          </Typography>
          <Box
            sx={{
              textAlign: "center",
              py: 4,
              color: "text.secondary",
            }}
          >
            <Whatshot sx={{ fontSize: 48, mb: 1, opacity: 0.3 }} />
            <Typography variant="body2">아직 점수 데이터가 없습니다</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Paper sx={{ p: 2 }} variant="outlined">
      <Stack spacing={2}>
        <Stack spacing={2} direction={"row"}>
          <Typography variant="h4" sx={{ mb: 3 }}>
            활동 랭킹
          </Typography>
          <Typography
            alignSelf="end"
            variant="subtitle1"
            color="text.secondary"
          >
            상위 5명
          </Typography>
        </Stack>
        <Divider />

        <Stack spacing={2}>
          {sortedScores.map((user, index) => {
            const rank = index + 1;
            const rankStyle = getRankingStyle(rank);

            return (
              <Box
                key={`${activityId}` + user.userId}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: `1px solid ${rankStyle.borderColor}`,
                  bgcolor: rankStyle.bgColor,
                  transition: "all 0.2s ease-in-out",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: theme.shadows[2],
                  },
                }}
              >
                <Stack direction="row" alignItems="center" spacing={2}>
                  {/* 랭킹 및 아이콘 */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      bgcolor: alpha(rankStyle.borderColor, 0.1),
                    }}
                  >
                    {rank <= 3 ? (
                      rankStyle.icon
                    ) : (
                      <Typography
                        variant="h6"
                        fontWeight={700}
                        color={rankStyle.textColor}
                      >
                        {rank}
                      </Typography>
                    )}
                  </Box>

                  {/* 사용자 정보 */}
                  <Avatar
                    src={user.userProfileImageURL}
                    sx={{
                      width: 48,
                      height: 48,
                      border: `2px solid ${rankStyle.borderColor}`,
                    }}
                  />

                  <Stack sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {user.userNickname}
                    </Typography>
                  </Stack>

                  {/* 점수 */}
                  <Box sx={{ textAlign: "right" }}>
                    <Chip
                      label={`${user.score.toLocaleString()}점`}
                      size="medium"
                      sx={{
                        bgcolor: alpha(rankStyle.borderColor, 0.2),
                        color: rankStyle.textColor,
                        fontWeight: 600,
                        fontSize: "0.875rem",
                      }}
                    />
                    {rank <= 3 && (
                      <Typography
                        variant="caption"
                        sx={{
                          display: "block",
                          mt: 0.5,
                          color: rankStyle.textColor,
                          fontWeight: 500,
                        }}
                      >
                        {rank === 1
                          ? "🥇 1등"
                          : rank === 2
                            ? "🥈 2등"
                            : "🥉 3등"}
                      </Typography>
                    )}
                  </Box>
                </Stack>
              </Box>
            );
          })}
        </Stack>
      </Stack>
    </Paper>
  );
}

// 로딩 스켈레톤 컴포넌트
function RankingSkeleton() {
  const title = "활동 랭킹";
  return (
    <Card elevation={0} sx={{ border: "1px solid #e0e0e0" }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
          🏆 {title}
        </Typography>

        <Stack spacing={2}>
          {[1, 2, 3, 4, 5].map((index) => (
            <Box
              key={index}
              sx={{
                p: 2,
                borderRadius: 2,
                border: "1px solid #e0e0e0",
              }}
            >
              <Stack direction="row" alignItems="center" spacing={2}>
                <Skeleton variant="circular" width={40} height={40} />
                <Skeleton variant="circular" width={48} height={48} />
                <Stack sx={{ flex: 1 }}>
                  <Skeleton variant="text" width={120} height={24} />
                  <Skeleton variant="text" width={80} height={20} />
                </Stack>
                <Skeleton
                  variant="rectangular"
                  width={80}
                  height={32}
                  sx={{ borderRadius: 2 }}
                />
              </Stack>
            </Box>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}
