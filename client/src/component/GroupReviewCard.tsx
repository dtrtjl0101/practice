import { useState } from "react";
import {
  Paper,
  Stack,
  Typography,
  Divider,
  Button,
  Chip,
  Box,
  Card,
  CardContent,
  Avatar,
  Skeleton,
  Alert,
} from "@mui/material";
import { Add, ExpandLess, ExpandMore } from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { GroupReview } from "../types/groupReview";

// 태그 정의
const REVIEW_TAGS = {
  // 모임 분위기
  FUNNY: { emoji: "😀", label: "유쾌하고 웃음이 많아요" },
  CALM: { emoji: "🧘", label: "차분하고 편안해요" },
  PASSIONATE: { emoji: "🔥", label: "열정이 느껴졌어요" },
  HEARTWARMING: { emoji: "🥰", label: "따뜻한 모임이었어요" },

  // 대화 흐름
  DEEP_THOUGHT: { emoji: "🤔", label: "생각이 깊어졌어요" },
  INSIGHTFUL: { emoji: "🧠", label: "지식이 쌓였어요" },
  DIVERSE_OPINIONS: { emoji: "🎭", label: "다양한 의견을 만났어요" },
  TALKATIVE: { emoji: "🎙️", label: "대화가 활발해요" },
  GOOD_LISTENERS: { emoji: "👂", label: "잘 들어주는 분들이 많아요" },

  // 운영 방식
  STRUCTURED: { emoji: "📌", label: "주제가 명확해요" },
  CASUAL: { emoji: "🌀", label: "자유롭게 흘러가는 느낌이에요" },
  WELL_MODERATED: { emoji: "🧭", label: "진행자가 잘 이끌어요" },
};

export default function GroupReviewCard({
  groupId,
  canWriteReview,
}: {
  groupId: number;
  canWriteReview: boolean;
}) {
  const [expandedReviews, setExpandedReviews] = useState<Set<number>>(
    new Set()
  );

  // 후기 목록 조회
  const { data: reviews, isLoading: reviewsLoading } = useQuery({
    queryKey: ["group-reviews", groupId],
    queryFn: async () => {
      // API 호출 예시 (실제 구현 시)
      // const response = await API_CLIENT.groupController.getGroupReviews(groupId);
      // return response.data as GroupReview[];

      // 목업 데이터
      return [
        {
          id: 1,
          authorId: 1,
          authorName: "김독서",
          authorProfileImage: "/api/placeholder/40/40",
          content:
            "정말 유익한 시간이었습니다. 다양한 관점과 따뜻한 분위기가 좋았어요.",
          tags: ["INSIGHTFUL", "DIVERSE_OPINIONS", "HEARTWARMING"],
          activityId: 1,
          activityTitle: "이번 달 추천도서 토론",
          createdAt: "2025-05-25T10:00:00Z",
          modifiedAt: "2025-05-25T10:00:00Z",
        },
        {
          id: 2,
          authorId: 2,
          authorName: "박서평",
          authorProfileImage: "/api/placeholder/40/40",
          content:
            "진행이 매끄럽고 참여자들의 이야기를 잘 들어주는 분위기였습니다.",
          tags: ["WELL_MODERATED", "CALM", "GOOD_LISTENERS"],
          activityId: 2,
          activityTitle: "신간 소개 모임",
          createdAt: "2025-05-24T14:30:00Z",
          modifiedAt: "2025-05-24T14:30:00Z",
        },
        {
          id: 3,
          authorId: 3,
          authorName: "이문학",
          authorProfileImage: "/api/placeholder/40/40",
          content: "모두가 열정적으로 참여해서 에너지가 넘쳤어요.",
          tags: ["PASSIONATE", "FUNNY"],
          activityId: 3,
          activityTitle: "에세이 나눔",
          createdAt: "2025-05-23T18:00:00Z",
          modifiedAt: "2025-05-23T18:00:00Z",
        },
        {
          id: 4,
          authorId: 4,
          authorName: "정철학",
          authorProfileImage: "/api/placeholder/40/40",
          content: "자유로운 분위기 속에서도 주제가 명확해서 좋았습니다.",
          tags: ["STRUCTURED", "CASUAL"],
          activityId: 4,
          activityTitle: "심리학 서적 토론",
          createdAt: "2025-05-22T16:20:00Z",
          modifiedAt: "2025-05-22T16:20:00Z",
        },
        {
          id: 5,
          authorId: 5,
          authorName: "송지식",
          authorProfileImage: "/api/placeholder/40/40",
          content:
            "많은 인사이트를 얻을 수 있었고 모두가 적극적으로 참여했어요.",
          tags: ["INSIGHTFUL", "TALKATIVE", "PASSIONATE"],
          activityId: 5,
          activityTitle: "경제 도서 읽기 모임",
          createdAt: "2025-05-21T11:10:00Z",
          modifiedAt: "2025-05-21T11:10:00Z",
        },
        {
          id: 6,
          authorId: 6,
          authorName: "안차분",
          authorProfileImage: "/api/placeholder/40/40",
          content: "편안하고 차분한 분위기에서 이야기할 수 있어서 좋았습니다.",
          tags: ["CALM", "GOOD_LISTENERS"],
          activityId: 6,
          activityTitle: "고전문학 탐구 모임",
          createdAt: "2025-05-20T15:00:00Z",
          modifiedAt: "2025-05-20T15:00:00Z",
        },
        {
          id: 7,
          authorId: 7,
          authorName: "장열정",
          authorProfileImage: "/api/placeholder/40/40",
          content: "활발한 대화와 명확한 진행이 인상 깊었어요.",
          tags: ["TALKATIVE", "WELL_MODERATED", "STRUCTURED"],
          activityId: 7,
          activityTitle: "과학책 탐독회",
          createdAt: "2025-05-19T10:45:00Z",
          modifiedAt: "2025-05-19T10:45:00Z",
        },
        {
          id: 8,
          authorId: 8,
          authorName: "최자유",
          authorProfileImage: "/api/placeholder/40/40",
          content:
            "자연스럽게 흘러가는 대화가 좋아요. 부담 없이 참여할 수 있어요.",
          tags: ["CASUAL", "CALM"],
          activityId: 8,
          activityTitle: "수필 낭독 모임",
          createdAt: "2025-05-18T17:00:00Z",
          modifiedAt: "2025-05-18T17:00:00Z",
        },
        {
          id: 9,
          authorId: 9,
          authorName: "하청취",
          authorProfileImage: "/api/placeholder/40/40",
          content: "서로의 말을 경청하고 존중하는 분위기가 너무 좋았어요.",
          tags: ["GOOD_LISTENERS", "HEARTWARMING"],
          activityId: 9,
          activityTitle: "인문학 카페 모임",
          createdAt: "2025-05-17T13:30:00Z",
          modifiedAt: "2025-05-17T13:30:00Z",
        },
        {
          id: 10,
          authorId: 10,
          authorName: "백지식",
          authorProfileImage: "/api/placeholder/40/40",
          content: "지식을 나누는 재미가 있는 모임이었어요.",
          tags: ["INSIGHTFUL", "DEEP_THOUGHT"],
          activityId: 10,
          activityTitle: "지식 나눔 독서회",
          createdAt: "2025-05-16T12:10:00Z",
          modifiedAt: "2025-05-16T12:10:00Z",
        },
        // ... 이후 20개는 계속됩니다
      ] as GroupReview[];
    },
  });

  // 후기 확장/축소 토글
  const toggleReviewExpansion = (reviewId: number) => {
    setExpandedReviews((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(reviewId)) {
        newSet.delete(reviewId);
      } else {
        newSet.add(reviewId);
      }
      return newSet;
    });
  };

  // 3줄 이상이거나 200자 이상인 경우 긴 내용으로 간주
  const isContentLong = (content: string) => {
    return content.split("\n").length > 3 || content.length > 200;
  };

  const getTruncatedContent = (content: string) => {
    const lines = content.split("\n");
    if (lines.length > 3) {
      return lines.slice(0, 3).join("\n");
    }
    if (content.length > 150) {
      return content.substring(0, 150) + "...";
    }
    return content;
  };

  let totalTags = 0;
  const tagCounts: Record<string, number> = {};
  reviews?.forEach((review) => {
    review.tags.forEach((tag) => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      totalTags += 1;
    });
  });

  const tagStatsData = Object.entries(tagCounts).map(([tagKey, count]) => ({
    key: tagKey,
    emoji: REVIEW_TAGS[tagKey as keyof typeof REVIEW_TAGS]?.emoji ?? "",
    label: REVIEW_TAGS[tagKey as keyof typeof REVIEW_TAGS]?.label ?? tagKey,
    count,
  }));

  const maxCount = Math.max(...tagStatsData.map((d) => d.count));

  // 태그 렌더링 함수 (긴 텍스트일 때만 접힌 상태에서 1개만 표시 + 나머지 개수)
  const renderTags = (tags: string[], reviewId: number) => {
    const isExpanded = expandedReviews.has(reviewId);
    const shouldShowAll = isExpanded || tags.length <= 1;

    if (shouldShowAll) {
      return (
        <Box display="flex" gap={1} flexWrap="wrap">
          {tags.map((tagKey) => {
            const tag = REVIEW_TAGS[tagKey as keyof typeof REVIEW_TAGS];
            return (
              <Chip
                key={tagKey}
                label={`${tag.emoji} ${tag.label}`}
                size="small"
                variant="outlined"
              />
            );
          })}
        </Box>
      );
    }

    // 접힌 상태: 첫 번째 태그만 표시 + 나머지 개수
    const firstTag = REVIEW_TAGS[tags[0] as keyof typeof REVIEW_TAGS];
    const remainingCount = tags.length - 1;

    return (
      <Box display="flex" gap={1} alignItems="center">
        <Chip
          label={`${firstTag.emoji} ${firstTag.label}`}
          size="small"
          variant="outlined"
        />
        {remainingCount > 0 && (
          <Chip
            label={`+${remainingCount}`}
            size="small"
            variant="outlined"
            onClick={() => {
              toggleReviewExpansion(reviewId);
            }}
          />
        )}
      </Box>
    );
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Stack spacing={3}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h4">모임 후기</Typography>
          {canWriteReview && (
            <Button variant="contained" startIcon={<Add />} onClick={() => {}}>
              후기 작성
            </Button>
          )}
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1" fontWeight={600}>
            이런 점이 좋았어요
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {totalTags}회, {reviews?.length ?? 0}명의 참여자
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 1 }}>
            {tagStatsData.map((tag) => (
              <Box key={tag.key}>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2" fontSize={16}>
                    {tag.emoji} "{tag.label}"
                  </Typography>
                  <Typography variant="body2">{tag.count}</Typography>
                </Box>
                <Box
                  sx={{
                    height: 8,
                    width: "100%",
                    backgroundColor: "#eee",
                    borderRadius: 4,
                    mt: 0.5,
                  }}
                >
                  <Box
                    sx={{
                      height: "100%",
                      width: `${(tag.count / maxCount) * 100}%`,
                      backgroundColor: "primary.main",
                      borderRadius: 4,
                    }}
                  />
                </Box>
              </Box>
            ))}
          </Box>
        </Box>

        {reviewsLoading ? (
          <Stack spacing={2}>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} variant="rectangular" height={120} />
            ))}
          </Stack>
        ) : reviews && reviews.length > 0 ? (
          <Stack spacing={2}>
            {reviews.map((review) => (
              <Card key={review.id} variant="outlined">
                <CardContent>
                  <Stack spacing={2}>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar
                        src={review.authorProfileImage}
                        sx={{ width: 40, height: 40 }}
                      >
                        {review.authorName[0]}
                      </Avatar>
                      <Stack>
                        <Typography variant="subtitle2">
                          {review.authorName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {review.activityTitle} •{" "}
                          {new Date(review.createdAt).toLocaleDateString()}
                        </Typography>
                      </Stack>
                    </Box>

                    <Box>
                      {isContentLong(review.content) ? (
                        <>
                          <Typography
                            variant="body2"
                            onClick={() => toggleReviewExpansion(review.id)}
                            sx={{
                              cursor: "pointer",
                            }}
                          >
                            {expandedReviews.has(review.id)
                              ? review.content
                              : getTruncatedContent(review.content)}
                          </Typography>

                          <Button
                            size="small"
                            onClick={() => toggleReviewExpansion(review.id)}
                            startIcon={
                              expandedReviews.has(review.id) ? (
                                <ExpandLess />
                              ) : (
                                <ExpandMore />
                              )
                            }
                            sx={{ mt: 1, p: 0.5, minHeight: "auto" }}
                          >
                            {expandedReviews.has(review.id) ? "접기" : "더보기"}
                          </Button>
                        </>
                      ) : (
                        <Typography
                          variant="body2"
                          onClick={() => toggleReviewExpansion(review.id)}
                          sx={{
                            cursor: "pointer",
                          }}
                        >
                          {review.content}
                        </Typography>
                      )}
                      {/* 태그 렌더링 */}
                      {review.tags.length > 0 && (
                        <Box sx={{ mt: 1 }}>
                          {renderTags(review.tags, review.id)}
                        </Box>
                      )}
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        ) : (
          <Alert severity="info">
            아직 작성된 후기가 없습니다. 첫 번째 후기를 작성해보세요!
          </Alert>
        )}
      </Stack>
    </Paper>
  );
}
