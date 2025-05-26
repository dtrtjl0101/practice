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
            "정말 유익한 토론이었어요! 다양한 관점을 들을 수 있어서 좋았습니다.정말 유익한 토론이었어요! 다양한 관점을 들을 수 있어서 좋았습니다.정말 유익한 토론이었어요! 다양한 관점을 들을 수 있어서 좋았습니다.정말 유익한 토론이었어요! 다양한 관점을 들을 수 있어서 좋았습니다.정말 유익한 토론이었어요! 다양한 관점을 들을 수 있어서 좋았습니다.정말 유익한 토론이었어요! 다양한 관점을 들을 수 있어서 좋았습니다.정말 유익한 토론이었어요! 다양한 관점을 들을 수 있어서 좋았습니다.정말 유익한 토론이었어요! 다양한 관점을 들을 수 있어서 좋았습니다.정말 유익한 토론이었어요! 다양한 관점을 들을 수 있어서 좋았습니다.",
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
          content:
            "진행자님이 정말 잘 이끌어주셔서 처음 참여하는데도 편했어요.",
          tags: ["WELL_MODERATED", "CALM", "GOOD_LISTENERS"],
          activityId: 2,
          activityTitle: "신간 소개 모임",
          createdAt: "2025-05-24T14:30:00Z",
          modifiedAt: "2025-05-24T14:30:00Z",
        },
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

        <Divider />

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
