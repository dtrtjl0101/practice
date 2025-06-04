import { useState } from "react";
import { useSnackbar } from "notistack";
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
  CircularProgress,
} from "@mui/material";
import { Add, ExpandLess, ExpandMore } from "@mui/icons-material";
import {
  useMutation,
  useQuery,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
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

interface ReviewResponse {
  content: GroupReview[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
}

const REVIEWS_PER_PAGE = 3;

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
  const [showAllTags, setShowAllTags] = useState(false); // 태그 통계 전체 보기 상태
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  // 무한 스크롤 후기 목록 조회
  const {
    data: reviewsData,
    isLoading: reviewsLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ["group-reviews", groupId],
    queryFn: async ({ pageParam = 0 }) => {
      const response = await API_CLIENT.groupReviewController.getReviews(
        groupId,
        { page: pageParam, size: REVIEWS_PER_PAGE }
      );
      if (!response.isSuccessful) {
        throw new Error(response.errorMessage);
      }
      return response.data as ReviewResponse;
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.currentPage < lastPage.totalPages - 1) {
        return lastPage.currentPage + 1;
      }
      return undefined;
    },
    initialPageParam: 0,
  });

  // 모든 페이지의 리뷰를 평면화
  const reviews = reviewsData?.pages.flatMap((page) => page.content) || [];
  const totalReviews = reviewsData?.pages[0]?.totalItems || 0;

  // 참여한 활동 목록 조회 (후기 작성용)
  const { data: groupActivities } = useQuery({
    queryKey: ["group-activities", groupId],
    queryFn: async () => {
      const response =
        await API_CLIENT.activityController.getAllActivities(groupId);
      if (!response.isSuccessful) {
        throw new Error(response.errorMessage);
      }
      return response.data.content as Activity[];
    },
    enabled: canWriteReview,
    initialData: [] as Activity[],
  });

  // 후기 작성 뮤테이션
  const createReviewMutation = useMutation({
    mutationFn: async (reviewData: any) => {
      const response = await API_CLIENT.groupReviewController.createReview(
        groupId,
        reviewData
      );
      if (!response.isSuccessful) {
        enqueueSnackbar(response.errorMessage, { variant: "error" });
        throw new Error(response.errorMessage);
      }
      return response;
    },
    onSuccess: () => {
      enqueueSnackbar("후기가 등록되었습니다!", { variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["group-reviews", groupId] });
      handleCloseDialog();
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

  // 태그 통계 조회
  const { data: tagStatsData } = useQuery({
    queryKey: ["group-review-tags", groupId],
    queryFn: async () => {
      const response =
        await API_CLIENT.groupReviewController.getReviewStats(groupId);
      if (!response.isSuccessful) {
        throw new Error(response.errorMessage);
      }
      return response.data;
    },
    initialData: {
      tagCount: 0,
      reviewCount: 0,
      tagStats: [],
    },
    enabled: reviews && reviews.length > 0, // 후기가 있을 때만 통계 조회
  });

  // 태그 통계 데이터 렌더링
  const renderTagStats = () => {
    if (
      !tagStatsData ||
      !tagStatsData.tagStats ||
      tagStatsData.tagStats.length === 0
    ) {
      return null;
    }

    const maxTagCount = Math.max(
      ...tagStatsData.tagStats.map((stat) => stat.count || 0)
    );

    const INITIAL_TAGS_SHOW = 3; // 처음에 보여줄 태그 개수

    const sortedTagStats = [...tagStatsData.tagStats].sort(
      (a, b) => (b.count || 0) - (a.count || 0)
    );

    const displayTags = showAllTags
      ? sortedTagStats
      : sortedTagStats.slice(0, INITIAL_TAGS_SHOW);

    const hasMoreTags = tagStatsData.tagStats.length > INITIAL_TAGS_SHOW;

    return (
      <Box>
        <Typography variant="subtitle1" fontWeight={600}>
          이런 점이 좋았어요
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {tagStatsData.tagCount || 0}회, {tagStatsData.reviewCount || 0}명의
          참여자
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 1 }}>
          {displayTags.map((tagStat) => {
            const tagInfo =
              REVIEW_TAGS[tagStat.tag as keyof typeof REVIEW_TAGS];
            return (
              <Box key={tagStat.tag}>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2" fontSize={16}>
                    {tagInfo
                      ? `${tagInfo.emoji} ${tagInfo.label}`
                      : tagStat.tag}
                  </Typography>
                  <Typography variant="body2">{tagStat.count || 0}</Typography>
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
                      width: `${((tagStat.count || 0) / (maxTagCount || 1)) * 100}%`,
                      backgroundColor: "primary.main",
                      borderRadius: 4,
                    }}
                  />
                </Box>
              </Box>
            );
          })}

          {/* 태그 더보기/접기 버튼 */}
          {hasMoreTags && (
            <Box display="flex" justifyContent="center" mt={1}>
              <Button
                size="small"
                variant="text"
                onClick={() => setShowAllTags(!showAllTags)}
                startIcon={showAllTags ? <ExpandLess /> : <ExpandMore />}
              >
                {showAllTags
                  ? "접기"
                  : `더보기 (+${tagStatsData.tagStats.length - INITIAL_TAGS_SHOW})`}
              </Button>
            </Box>
          )}
        </Box>
      </Box>
    );
  };

  // 태그 렌더링 함수
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
            sx={{ cursor: "pointer" }}
          />
        )}
      </Box>
    );
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setReviewContent("");
    setSelectedTags([]);
    setSelectedActivity(null);
  };

  return (
    <Paper sx={{ p: 3 }} variant="outlined">
      <Stack spacing={3}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h4">모임 후기 ({totalReviews})</Typography>
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

        <Divider />

        {/* 통계 - 후기가 있을 때만 표시 */}
        {reviews && reviews.length > 0 && renderTagStats()}

        {reviewsLoading ? (
          <Stack spacing={2}>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} variant="rectangular" height={120} />
            ))}
          </Stack>
        ) : reviews && reviews.length > 0 ? (
          <Stack spacing={2}>
            {reviews.map((review) => (
              <Card key={review.reviewId} variant="outlined">
                <CardContent>
                  <Stack spacing={2}>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar
                        src={review.authorProfileImageURL}
                        sx={{ width: 40, height: 40 }}
                      />
                      <Stack>
                        <Typography variant="subtitle2">
                          {review.authorNickname}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {review.modifiedAt
                            ? new Date(review.modifiedAt).toLocaleDateString()
                            : new Date(review.createdAt).toLocaleDateString()}
                        </Typography>
                      </Stack>
                    </Box>

                    <Box>
                      {isContentLong(review.content) ? (
                        <>
                          <Typography
                            variant="body2"
                            onClick={() =>
                              toggleReviewExpansion(review.reviewId)
                            }
                            sx={{
                              cursor: "pointer",
                              // 축약된 상태일 때 ellipsis 적용
                              ...(!expandedReviews.has(review.reviewId) && {
                                display: "-webkit-box",
                                WebkitLineClamp: 3,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }),
                              // 확장된 상태일 때는 전체 내용 표시
                              ...(expandedReviews.has(review.reviewId) && {
                                whiteSpace: "pre-wrap", // 줄바꿈 유지
                              }),
                            }}
                          >
                            {review.content}
                          </Typography>

                          <Button
                            size="small"
                            onClick={() =>
                              toggleReviewExpansion(review.reviewId)
                            }
                            startIcon={
                              expandedReviews.has(review.reviewId) ? (
                                <ExpandLess />
                              ) : (
                                <ExpandMore />
                              )
                            }
                            sx={{ mt: 1, p: 0.5, minHeight: "auto" }}
                          >
                            {expandedReviews.has(review.reviewId)
                              ? "접기"
                              : "더보기"}
                          </Button>
                        </>
                      ) : (
                        <Typography
                          variant="body2"
                          onClick={() => toggleReviewExpansion(review.reviewId)}
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
                          {renderTags(review.tags, review.reviewId)}
                        </Box>
                      )}
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            ))}

            {/* 더 보기 버튼 또는 로딩 표시 */}
            {hasNextPage && (
              <Box display="flex" justifyContent="center" mt={2}>
                <Button
                  variant="outlined"
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  startIcon={
                    isFetchingNextPage ? <CircularProgress size={16} /> : null
                  }
                >
                  {isFetchingNextPage ? "로딩 중..." : "후기 더보기"}
                </Button>
              </Box>
            )}

            {/* 로딩 중일 때 스켈레톤 표시 */}
            {isFetchingNextPage && (
              <Stack spacing={2} mt={2}>
                {[1, 2].map((i) => (
                  <Skeleton key={i} variant="rectangular" height={120} />
                ))}
              </Stack>
            )}
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
        onClose={() => handleCloseDialog()}
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
              <option value="" />
              {groupActivities?.map((activity) => (
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
          <Button onClick={() => handleCloseDialog()}>취소</Button>
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
