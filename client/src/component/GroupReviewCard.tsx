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
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import { Add, ExpandLess, ExpandMore } from "@mui/icons-material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { GroupReview } from "../types/groupReview";
import API_CLIENT from "../api/api";
import { Activity } from "../types/activity";

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
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<number | null>(null);
  const [reviewContent, setReviewContent] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [expandedReviews, setExpandedReviews] = useState<Set<number>>(
    new Set()
  );

  const queryClient = useQueryClient();

  // 후기 목록 조회
  const { data: reviews, isLoading: reviewsLoading } = useQuery({
    queryKey: ["group-reviews", groupId],
    queryFn: async () => {
      const response =
        await API_CLIENT.groupController.getGroupReviews(groupId);
      return response.data as GroupReview[];

      return;
    },
  });

  // 참여한 활동 목록 조회 (후기 작성용)
  const { data: myActivities } = useQuery({
    queryKey: ["my-activities", groupId],
    queryFn: async () => {
      const response =
        await API_CLIENT.activityController.getAllActivities(groupId);
      if (!response.isSuccessful) {
        throw new Error(response.errorMessage);
      }
      return response.data.content as Activity[];
    },
    enabled: canWriteReview,
  });

  // 후기 작성/수정 뮤테이션
  const createReviewMutation = useMutation({
    mutationFn: async (reviewData: any) => {
      // 실제 API 호출
      // return API_CLIENT.groupController.createReview(groupId, reviewData);
      console.log("Creating review:", reviewData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["group-reviews", groupId] });
      setOpenDialog(false);
      setReviewContent("");
      setSelectedTags([]);
      setSelectedActivity(null);
    },
  });

  const handleSubmitReview = () => {
    if (!selectedActivity || !reviewContent.trim()) return;

    createReviewMutation.mutate({
      activityId: selectedActivity,
      content: reviewContent,
      tags: selectedTags,
    });
  };

  const handleTagToggle = (tagKey: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagKey)
        ? prev.filter((t) => t !== tagKey)
        : [...prev, tagKey]
    );
  };

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

  // 태그 통계 데이터
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
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setOpenDialog(true)}
            >
              후기 작성
            </Button>
          )}
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* 통계 */}
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
      {/* 후기 작성 다이얼로그 */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>모임 후기 작성</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              select
              label="참여한 활동"
              value={selectedActivity || ""}
              onChange={(e) => setSelectedActivity(Number(e.target.value))}
              SelectProps={{ native: true }}
              fullWidth
            >
              <option value=""></option>
              {myActivities?.map((activity) => (
                <option key={activity.activityId} value={activity.activityId}>
                  {activity.bookTitle} ({activity.startTime} ~{" "}
                  {activity.endTime})
                </option>
              ))}
            </TextField>

            <TextField
              label="후기 내용"
              multiline
              rows={4}
              value={reviewContent}
              onChange={(e) => setReviewContent(e.target.value)}
              placeholder="모임에 대한 솔직한 후기를 작성해주세요..."
              fullWidth
              inputProps={{ maxLength: 1000 }}
            />

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                모임 분위기 (복수 선택 가능)
              </Typography>
              <Box display="flex" gap={1} flexWrap="wrap" mb={2}>
                {Object.entries(REVIEW_TAGS)
                  .slice(0, 4)
                  .map(([key, tag]) => (
                    <Chip
                      key={key}
                      label={`${tag.emoji} ${tag.label}`}
                      onClick={() => handleTagToggle(key)}
                      color={selectedTags.includes(key) ? "primary" : "default"}
                      variant={
                        selectedTags.includes(key) ? "filled" : "outlined"
                      }
                    />
                  ))}
              </Box>

              <Typography variant="subtitle2" gutterBottom>
                대화 흐름
              </Typography>
              <Box display="flex" gap={1} flexWrap="wrap" mb={2}>
                {Object.entries(REVIEW_TAGS)
                  .slice(4, 9)
                  .map(([key, tag]) => (
                    <Chip
                      key={key}
                      label={`${tag.emoji} ${tag.label}`}
                      onClick={() => handleTagToggle(key)}
                      color={selectedTags.includes(key) ? "primary" : "default"}
                      variant={
                        selectedTags.includes(key) ? "filled" : "outlined"
                      }
                    />
                  ))}
              </Box>

              <Typography variant="subtitle2" gutterBottom>
                운영 방식
              </Typography>
              <Box display="flex" gap={1} flexWrap="wrap">
                {Object.entries(REVIEW_TAGS)
                  .slice(9)
                  .map(([key, tag]) => (
                    <Chip
                      key={key}
                      label={`${tag.emoji} ${tag.label}`}
                      onClick={() => handleTagToggle(key)}
                      color={selectedTags.includes(key) ? "primary" : "default"}
                      variant={
                        selectedTags.includes(key) ? "filled" : "outlined"
                      }
                    />
                  ))}
              </Box>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>취소</Button>
          <Button
            variant="contained"
            onClick={handleSubmitReview}
            disabled={
              !selectedActivity ||
              !reviewContent.trim() ||
              createReviewMutation.isPending
            }
          >
            {createReviewMutation.isPending ? "저장 중..." : "후기 등록"}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
