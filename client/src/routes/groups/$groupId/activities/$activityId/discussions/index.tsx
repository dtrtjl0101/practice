import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Typography,
  Container,
  Button,
  Paper,
  Stack,
  Box,
  Card,
  CardContent,
  Divider,
  Avatar,
  Chip,
  CircularProgress,
  CardActionArea,
  TextField,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import API_CLIENT from "../../../../../../api/api";
import { Discussion } from "../../../../../../types/discussion";
import MessageIcon from "@mui/icons-material/Message";
import { Search, ArrowBack, StickyNote2Outlined } from "@mui/icons-material";
import { useState, useMemo, useEffect } from "react";
import StarIcon from "@mui/icons-material/Star";
import { useAtomValue } from "jotai";
import { AuthState } from "../../../../../../states/auth";

export const Route = createFileRoute(
  "/groups/$groupId/activities/$activityId/discussions/"
)({
  component: RouteComponent,
  params: {
    parse: (params) => {
      const groupId = parseInt(params.groupId);
      if (isNaN(groupId)) {
        throw new Error("Invalid groupId");
      }
      const activityId = parseInt(params.activityId);
      if (isNaN(activityId)) {
        throw new Error("Invalid activityId");
      }
      return {
        groupId,
        activityId,
      };
    },
  },
});

interface PaginatedResponse {
  content: Discussion[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
}

function RouteComponent() {
  const user = useAtomValue(AuthState.user);
  const navigate = useNavigate();
  const { groupId, activityId } = Route.useParams();

  // State for pagination and filtering
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [discussionSearchTerm, setDiscussionSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"latest" | "oldest" | "comments">(
    "latest"
  );
  const [filterBy, setFilterBy] = useState<"all" | "debate" | "discussion">(
    "all"
  );

  // Track if client-side filtering is active (정렬은 서버에서 처리하므로 제외)
  const hasClientFilters = discussionSearchTerm.trim() || filterBy !== "all";

  const {
    data: discussionsResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: [
      "discussions",
      activityId,
      // 클라이언트 필터가 없을 때만 서버 사이드 페이징과 정렬 파라미터 포함
      ...(hasClientFilters ? [] : [currentPage, pageSize, sortBy]),
    ],
    queryFn: async () => {
      try {
        // 서버 사이드 정렬 파라미터 준비 (property,direction 형식)
        const getSortParams = (sortType: string): string[] => {
          switch (sortType) {
            case "latest":
              return ["createdAt,desc"]; // 생성일자만으로 최신순 정렬
            case "oldest":
              return ["createdAt,asc"]; // 생성일자로 오래된순 정렬
            case "comments":
              return ["commentCount,desc"]; // 댓글 수만으로 정렬
            default:
              return ["createdAt,desc"];
          }
        };

        // If client-side filtering is active, fetch all data
        // Otherwise, use server-side pagination and sorting
        const requestParams = hasClientFilters
          ? { page: 0, size: 1000 } // Fetch large amount to get all data for client filtering
          : {
              page: currentPage - 1,
              size: pageSize,
              sort: getSortParams(sortBy), // 서버 정렬 파라미터 배열로 전달
            };

        const response = await API_CLIENT.discussionController.getDiscussions(
          activityId,
          requestParams
        );
        if (!response.isSuccessful) {
          throw new Error(response.errorMessage);
        }
        return response.data as PaginatedResponse;
      } catch (error) {
        console.error("게시글 목록을 불러오는 중 오류가 발생했습니다:", error);
        throw error;
      }
    },
  });

  const { data: groupInfoResponse } = useQuery({
    queryKey: ["groupIdResponse"],
    queryFn: async () => {
      const response = await API_CLIENT.groupController.getGroup(groupId);
      if (!response.isSuccessful) {
        throw new Error(response.error);
      }
      return response.data;
    },
  });

  const leaderId = groupInfoResponse?.leaderId;
  const isLeader = leaderId === user?.memberId;

  // Client-side filtering and sorting when filters are active
  const processedDiscussions = useMemo(() => {
    if (!discussionsResponse?.content) return [];

    // If no client-side filters, return server data as-is (already sorted by server)
    if (!hasClientFilters) {
      return discussionsResponse.content;
    }

    let filtered = discussionsResponse.content;

    // Apply search filter
    if (discussionSearchTerm.trim()) {
      filtered = filtered.filter(
        (discussion) =>
          discussion.title
            .toLowerCase()
            .includes(discussionSearchTerm.toLowerCase()) ||
          discussion.content
            .toLowerCase()
            .includes(discussionSearchTerm.toLowerCase()) ||
          discussion.authorName
            .toLowerCase()
            .includes(discussionSearchTerm.toLowerCase())
      );
    }

    // Apply type filter
    if (filterBy !== "all") {
      filtered = filtered.filter((discussion) => {
        if (filterBy === "debate") {
          return discussion.isDebate;
        } else if (filterBy === "discussion") {
          return !discussion.isDebate;
        }
        return true;
      });
    }

    // Apply sorting (only when client-side filtering is active)
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "latest": {
          // 생성일자만으로 최신순 정렬
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return dateB - dateA; // 최신순 (내림차순)
        }
        case "oldest": {
          // 생성일자로 오래된순 정렬
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return dateA - dateB; // 오래된순 (오름차순)
        }
        case "comments": {
          // 댓글 수만으로 정렬 (많은 순)
          return (b.commentCount || 0) - (a.commentCount || 0);
        }
        default:
          return 0;
      }
    });

    return sorted;
  }, [
    discussionsResponse?.content,
    discussionSearchTerm,
    filterBy,
    sortBy,
    hasClientFilters,
  ]);

  // Client-side pagination when filters are active
  const paginatedDiscussions = useMemo(() => {
    if (!hasClientFilters) {
      return processedDiscussions; // Server-side pagination
    }

    // Client-side pagination
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return processedDiscussions.slice(startIndex, endIndex);
  }, [processedDiscussions, currentPage, pageSize, hasClientFilters]);

  // Calculate pagination info
  const paginationInfo = useMemo(() => {
    if (!hasClientFilters && discussionsResponse) {
      // Use server pagination info
      return {
        totalItems: discussionsResponse.totalItems,
        totalPages: discussionsResponse.totalPages,
        currentItems: discussionsResponse.content.length,
      };
    } else {
      // Use client pagination info
      const totalItems = processedDiscussions.length;
      const totalPages = Math.ceil(totalItems / pageSize);
      return {
        totalItems,
        totalPages,
        currentItems: paginatedDiscussions.length,
      };
    }
  }, [
    discussionsResponse,
    processedDiscussions,
    paginatedDiscussions,
    pageSize,
    hasClientFilters,
  ]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [discussionSearchTerm, filterBy, sortBy]);

  const handleNavigateToDiscussion = (discussionId: number) => {
    navigate({
      from: Route.to,
      to: "$discussionId",
      params: {
        discussionId: discussionId.toString(),
      },
    });
  };

  const handleNavigateToGroup = () => {
    navigate({
      from: Route.to,
      to: "/groups/$groupId",
      params: {
        groupId,
      },
    });
  };

  const handleCreateNewDiscussion = () => {
    navigate({
      from: Route.to,
      to: `new`,
    });
  };

  const handlePageChange = (_: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePageSizeChange = (event: any) => {
    setPageSize(event.target.value);
    setCurrentPage(1);
  };

  const handleSortChange = (event: any) => {
    setSortBy(event.target.value);
  };

  const handleFilterChange = (event: any) => {
    setFilterBy(event.target.value);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDiscussionSearchTerm(event.target.value);
  };

  const clearAllFilters = () => {
    setDiscussionSearchTerm("");
    setFilterBy("all");
    setSortBy("latest");
    setCurrentPage(1);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          fontWeight="bold"
          textAlign="center"
          color="primary.main"
          sx={{ mb: 4 }}
        >
          게시판
        </Typography>

        {/* Navigation and Create Button */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 3 }}
        >
          <Button
            variant="outlined"
            color="primary"
            onClick={handleNavigateToGroup}
            size="medium"
            startIcon={<ArrowBack />}
          >
            이전 페이지
          </Button>

          <Button
            variant="contained"
            color="primary"
            onClick={handleCreateNewDiscussion}
            size="medium"
            sx={{ px: 3 }}
          >
            새 게시글 작성
          </Button>
        </Stack>

        {/* Search and Filter Controls */}
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                placeholder="게시물 검색... (제목, 내용, 작성자)"
                value={discussionSearchTerm}
                onChange={handleSearchChange}
                size="small"
                slotProps={{
                  input: {
                    startAdornment: (
                      <Search sx={{ color: "action.active", mr: 1 }} />
                    ),
                  },
                }}
                fullWidth
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>정렬</InputLabel>
                  <Select
                    value={sortBy}
                    onChange={handleSortChange}
                    label="정렬"
                  >
                    <MenuItem value="latest">최신순</MenuItem>
                    <MenuItem value="oldest">오래된순</MenuItem>
                    {/* <MenuItem value="comments">댓글순</MenuItem> */}
                  </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>필터</InputLabel>
                  <Select
                    value={filterBy}
                    onChange={handleFilterChange}
                    label="필터"
                  >
                    <MenuItem value="all">전체</MenuItem>
                    <MenuItem value="debate">토론</MenuItem>
                    <MenuItem value="discussion">일반</MenuItem>
                  </Select>
                </FormControl>

                {hasClientFilters && (
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={clearAllFilters}
                    sx={{ minWidth: "auto", px: 2 }}
                  >
                    초기화
                  </Button>
                )}
              </Stack>
            </Grid>
          </Grid>
        </Paper>
      </Box>

      {/* Results Summary */}
      {discussionsResponse && !isLoading && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {hasClientFilters ? (
              <>
                전체 {discussionsResponse.totalItems}개 중 필터링된 결과:{" "}
                {paginationInfo.totalItems}개
                {paginationInfo.totalPages > 1 &&
                  ` • ${paginationInfo.totalPages}페이지 중 ${currentPage}페이지`}
              </>
            ) : (
              <>
                전체 {paginationInfo.totalItems}개의 게시글
                {paginationInfo.totalPages > 1 &&
                  ` • ${paginationInfo.totalPages}페이지 중 ${currentPage}페이지`}
              </>
            )}
          </Typography>
        </Box>
      )}

      <Divider sx={{ mb: 4 }} />

      {/* Discussion List */}
      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress size={40} />
        </Box>
      ) : error ? (
        <Paper
          variant="outlined"
          sx={{
            p: 4,
            textAlign: "center",
            borderRadius: 2,
          }}
        >
          <Typography color="error.main" variant="h6" sx={{ mb: 2 }}>
            오류가 발생했습니다
          </Typography>
          <Typography color="error.main">
            게시글을 불러오는 중 문제가 발생했습니다. 다시 시도해주세요.
          </Typography>
        </Paper>
      ) : (
        <Stack spacing={3}>
          {!paginatedDiscussions || paginatedDiscussions.length === 0 ? (
            <Paper
              variant="outlined"
              sx={{
                p: 6,
                textAlign: "center",
                borderRadius: 2,
              }}
            >
              <Typography
                color="text.secondary"
                fontSize="1.1rem"
                sx={{ mb: 2 }}
              >
                {hasClientFilters
                  ? "검색 조건에 맞는 게시글이 없습니다."
                  : "등록된 게시글이 없습니다."}
              </Typography>
              {!hasClientFilters && (
                <Button variant="outlined" onClick={handleCreateNewDiscussion}>
                  첫 게시글 작성하기
                </Button>
              )}
              {hasClientFilters && (
                <Button variant="outlined" onClick={clearAllFilters}>
                  모든 필터 초기화
                </Button>
              )}
            </Paper>
          ) : (
            <>
              {/* Discussion Cards */}
              <Stack spacing={2}>
                {paginatedDiscussions.map((discussion) => (
                  <DiscussionCard
                    key={discussion.discussionId}
                    isLeader={isLeader}
                    discussion={discussion}
                    onClick={handleNavigateToDiscussion}
                  />
                ))}
              </Stack>
              {/* Pagination Controls */}

              <Paper sx={{ p: 3, mt: 4 }} variant="outlined">
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  justifyContent="space-between"
                  alignItems="center"
                  spacing={2}
                >
                  {/* Page Size Selector */}
                  <FormControl size="small">
                    <InputLabel>페이지당 항목</InputLabel>
                    <Select
                      value={pageSize}
                      onChange={handlePageSizeChange}
                      label="페이지당 항목"
                      sx={{ minWidth: 120 }}
                    >
                      <MenuItem value={5}>5개</MenuItem>
                      <MenuItem value={10}>10개</MenuItem>
                      <MenuItem value={20}>20개</MenuItem>
                      <MenuItem value={50}>50개</MenuItem>
                    </Select>
                  </FormControl>

                  {/* Pagination */}
                  <Pagination
                    count={paginationInfo.totalPages}
                    page={currentPage}
                    onChange={handlePageChange}
                    color="primary"
                    shape="rounded"
                    showFirstButton
                    showLastButton
                    size="medium"
                  />

                  {/* Page Info */}
                  <Typography variant="body2" color="text.secondary">
                    {hasClientFilters ? (
                      <>
                        {paginationInfo.totalItems}개 중{" "}
                        {Math.min(
                          (currentPage - 1) * pageSize + 1,
                          paginationInfo.totalItems
                        )}
                        -
                        {Math.min(
                          currentPage * pageSize,
                          paginationInfo.totalItems
                        )}
                        개 표시
                      </>
                    ) : (
                      <>
                        전체 {paginationInfo.totalItems}개 중{" "}
                        {Math.min(
                          (currentPage - 1) * pageSize + 1,
                          paginationInfo.totalItems
                        )}
                        -
                        {Math.min(
                          currentPage * pageSize,
                          paginationInfo.totalItems
                        )}
                        개 표시
                      </>
                    )}
                  </Typography>
                </Stack>
              </Paper>
            </>
          )}
        </Stack>
      )}
    </Container>
  );
}

interface DiscussionCardProps {
  isLeader: boolean;
  discussion: Discussion;
  onClick: (id: number) => void;
}

interface DiscussionCardProps {
  isLeader: boolean;
  discussion: Discussion;
  onClick: (discussionId: number) => void;
}

function DiscussionCard({
  isLeader,
  discussion,
  onClick,
}: DiscussionCardProps) {
  const formattedDate = new Date(
    discussion.modifiedAt || discussion.createdAt
  ).toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  // 토론 통계 계산
  const debateStats = useMemo(() => {
    if (!discussion.isDebate) return null;

    const agree = discussion.agreeCount || 0;
    const disagree = discussion.disagreeCount || 0;
    const neutral = discussion.neutralCount || 0;
    const total = agree + disagree + neutral;

    if (total === 0) {
      return {
        agreePercent: 0,
        disagreePercent: 0,
        neutralPercent: 0,
        total: 0,
        dominantType: "neutral" as const,
      };
    }

    const agreePercent = (agree / total) * 100;
    const disagreePercent = (disagree / total) * 100;
    const neutralPercent = (neutral / total) * 100;

    // 가장 높은 비율 확인
    let dominantType: "agree" | "disagree" | "neutral" = "neutral";
    if (agreePercent > disagreePercent && agreePercent > neutralPercent) {
      dominantType = "agree";
    } else if (
      disagreePercent > agreePercent &&
      disagreePercent > neutralPercent
    ) {
      dominantType = "disagree";
    }

    return {
      agreePercent,
      disagreePercent,
      neutralPercent,
      total,
      dominantType,
      agree,
      disagree,
      neutral,
    };
  }, [
    discussion.isDebate,
    discussion.agreeCount,
    discussion.disagreeCount,
    discussion.neutralCount,
  ]);

  // 토론 카드의 배경 그라데이션 생성
  const getDebateCardStyle = useMemo(() => {
    if (!discussion.isDebate || !debateStats || debateStats.total === 0) {
      return {};
    }

    const { agreePercent, neutralPercent, dominantType } = debateStats;

    // 그라데이션 색상 정의
    const colors = {
      agree: "rgba(76, 175, 80, 0.1)", // 초록색 (찬성)
      disagree: "rgba(244, 67, 54, 0.1)", // 빨간색 (반대)
      neutral: "rgba(158, 158, 158, 0.1)", // 회색 (중립)
    };

    // 보더 색상
    const borderColors = {
      agree: "rgba(76, 175, 80, 0.3)",
      disagree: "rgba(244, 67, 54, 0.3)",
      neutral: "rgba(158, 158, 158, 0.3)",
    };

    return {
      background: `linear-gradient(135deg, 
        ${colors.agree} 0%, 
        ${colors.agree} ${agreePercent}%, 
        ${colors.neutral} ${agreePercent}%, 
        ${colors.neutral} ${agreePercent + neutralPercent}%, 
        ${colors.disagree} ${agreePercent + neutralPercent}%, 
        ${colors.disagree} 100%)`,
      borderColor: borderColors[dominantType],
      borderWidth: "2px",
    };
  }, [discussion.isDebate, debateStats]);

  // 해시태그를 컴포넌트로 변환하는 함수
  const parseContentWithHashtags = useMemo(() => {
    const content = discussion.content.trim() || "내용이 없습니다.";
    const hashtagPattern = /#\w[\w-]*/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = hashtagPattern.exec(content)) !== null) {
      // 해시태그 이전의 텍스트 추가
      if (match.index > lastIndex) {
        const beforeText = content.slice(lastIndex, match.index);
        if (beforeText) {
          parts.push(beforeText);
        }
      }

      // 해시태그 컴포넌트 추가
      parts.push(
        <Chip
          key={`hashtag-${match.index}`}
          icon={<StickyNote2Outlined />}
          label={"메모"}
          size="small"
          color="primary"
          sx={{
            height: 18,
            fontSize: "0.8rem",
            mx: 0.3,
            "& .MuiChip-label": {
              px: 0.6,
            },
          }}
        />
      );

      lastIndex = match.index + match[0].length;
    }

    // 마지막 텍스트 추가
    if (lastIndex < content.length) {
      const remainingText = content.slice(lastIndex);
      if (remainingText) {
        parts.push(remainingText);
      }
    }

    return parts.length > 0 ? parts : [content];
  }, [discussion.content]);

  return (
    <CardActionArea onClick={() => onClick(discussion.discussionId)}>
      <Card
        variant="outlined"
        sx={{
          height: "100%",
          transition: "all 0.3s ease",
          position: "relative",
          overflow: "hidden",
          ...getDebateCardStyle,
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: 4,
            borderColor:
              discussion.isDebate && debateStats?.total
                ? getDebateCardStyle.borderColor
                : "primary.main",
          },
        }}
      >
        <CardContent sx={{ p: 3, position: "relative", zIndex: 1 }}>
          {/* Header: Title and Badges */}
          <Stack
            direction="row"
            alignItems="flex-start"
            justifyContent="space-between"
            sx={{ mb: 2 }}
          >
            <Typography
              variant="h6"
              fontWeight="600"
              sx={{
                color: "text.primary",
                flex: 1,
                mr: 2,
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
              }}
            >
              {discussion.title}
            </Typography>

            <Stack direction="row" spacing={1} alignItems="center">
              <Chip
                icon={<MessageIcon fontSize="small" />}
                label={discussion.commentCount}
                size="small"
                color="primary"
                variant={discussion.commentCount > 0 ? "filled" : "outlined"}
                sx={{ height: 26 }}
              />
              {discussion.isDebate && (
                <Chip
                  label="토론"
                  color="success"
                  size="small"
                  variant="filled"
                  sx={{ height: 26, fontWeight: "bold" }}
                />
              )}
            </Stack>
          </Stack>

          {/* 토론 통계 표시 */}
          {discussion.isDebate && debateStats && debateStats.total > 0 && (
            <Box sx={{ mb: 2 }}>
              <Stack
                direction="row"
                spacing={2}
                alignItems="center"
                sx={{ mb: 1 }}
              >
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <Chip
                    label={`찬성 ${debateStats.agree}`}
                    color={"primary"}
                    size="small"
                    variant="outlined"
                  />
                </Stack>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <Chip
                    label={`중립 ${debateStats.neutral}`}
                    color={"default"}
                    size="small"
                    variant="outlined"
                  />
                </Stack>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <Chip
                    label={`반대 ${debateStats.disagree}`}
                    color={"error"}
                    size="small"
                    variant="outlined"
                  />
                </Stack>
              </Stack>

              {/* 투표 비율 바 */}
              <Box
                sx={{
                  position: "relative",
                  height: 6,
                  borderRadius: 3,
                  overflow: "hidden",
                  bgcolor: "grey.200",
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    height: "100%",
                    width: `${debateStats.agreePercent}%`,
                    bgcolor: "success.main",
                    borderRadius: "3px 0 0 3px",
                  }}
                />
                <Box
                  sx={{
                    position: "absolute",
                    left: `${debateStats.agreePercent}%`,
                    top: 0,
                    height: "100%",
                    width: `${debateStats.neutralPercent}%`,
                    bgcolor: "grey.400",
                  }}
                />
                <Box
                  sx={{
                    position: "absolute",
                    right: 0,
                    top: 0,
                    height: "100%",
                    width: `${debateStats.disagreePercent}%`,
                    bgcolor: "error.main",
                    borderRadius: "0 3px 3px 0",
                  }}
                />
              </Box>
            </Box>
          )}

          {/* Content Preview */}
          <Typography
            variant="body2"
            color="text.secondary"
            component="div"
            sx={{
              mb: 3,
              overflow: "hidden",
              minHeight: "3.6rem",
              lineHeight: 1.6,
              display: "-webkit-box",
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: 3,
              "& > *": {
                display: "inline",
              },
            }}
          >
            {parseContentWithHashtags}
          </Typography>

          {/* Footer: Author Info and Metadata */}
          <Divider sx={{ mb: 2 }} />

          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <Avatar
                src={discussion.authorProfileImage}
                alt={discussion.authorName}
                sx={{ width: 28, height: 28 }}
              />
              <Typography variant="body2" fontWeight="500" color="text.primary">
                {discussion.authorName}
              </Typography>
              {isLeader && (
                <Chip
                  icon={<StarIcon fontSize="small" />}
                  label="모임지기"
                  size="small"
                  color="warning"
                  variant="outlined"
                  sx={{ height: 22, fontSize: "0.75rem" }}
                />
              )}
            </Stack>

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontSize: "0.8rem" }}
            >
              {formattedDate}
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </CardActionArea>
  );
}

export default DiscussionCard;
