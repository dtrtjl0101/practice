import React, { useMemo, useState } from "react";
import {
  Box,
  Typography,
  Popover,
  Popper,
  Stack,
  Card,
  CardContent,
  Avatar,
  alpha,
  useTheme,
  Skeleton,
} from "@mui/material";
import {
  HighlightSummary,
  HighlightNotification,
} from "../../../../types/highlight";
import { useQuery } from "@tanstack/react-query";
import API_CLIENT from "../../../../api/api";
import { useNavigate } from "@tanstack/react-router";
import HighlightSummaryCard from "../../../HighlightSumarryCard";

interface ActivityNotificationSectionProps {
  activityId: number;
  groupId: number;
  isLoading?: boolean;
  onMemoClick?: (notification: HighlightNotification) => void;
}

// 시간 포맷팅 함수
function formatTimeAgo(dateString: string): string {
  const now = new Date();
  const createdAt = new Date(dateString);
  const diffInMinutes = Math.floor(
    (now.getTime() - createdAt.getTime()) / (1000 * 60)
  );

  if (diffInMinutes < 1) return "방금 전";
  if (diffInMinutes < 60) return `${diffInMinutes}분 전`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}시간 전`;

  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}일 전`;
}

// 알림 메시지 생성 (하이라이트로 고정)
function getNotificationMessage(notification: HighlightNotification): string {
  return `${notification.authorName}님이 ${formatTimeAgo(notification.createdAt)}에 하이라이트를 등록했습니다`;
}

export function ActivityNotificationSection({
  activityId,
  groupId,
  isLoading: propIsLoading = false,
  onMemoClick,
}: ActivityNotificationSectionProps) {
  const theme = useTheme();
  const navigate = useNavigate();

  // 팝오버 상태 (클릭으로 열기/닫기)
  const [popoverAnchorEl, setPopoverAnchorEl] = useState<HTMLElement | null>(
    null
  );
  const popoverOpen = Boolean(popoverAnchorEl);

  // Popper 상태 (호버로 하이라이트 상세 정보)
  const [popperAnchorEl, setPopperAnchorEl] = useState<HTMLElement | null>(
    null
  );
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [popperOpen, setPopperOpen] = useState(false);

  // 최근 알림 데이터
  const { data: recentNotifications, isLoading: notificationsLoading } =
    useQuery({
      queryKey: ["recentNotifications", activityId],
      queryFn: async () => {
        const response =
          await API_CLIENT.activityController.getRecentHighlights(activityId);
        if (!response.isSuccessful) throw new Error(response.error);
        return response.data as HighlightNotification[];
      },
      initialData: [] as HighlightNotification[],
    });

  // 하이라이트 상세 데이터
  const { data: recentHighlights } = useQuery({
    queryKey: ["recentHighlights", activityId],
    queryFn: async () => {
      const highlightsMapping = await Promise.all(
        recentNotifications.map(async (notification) => {
          const response = await API_CLIENT.highlightController.getHighlight(
            notification.id
          );
          if (!response.isSuccessful) {
            console.warn(
              `하이라이트 로드 실패 (ID: ${notification.id}):`,
              response.error
            );
            return null;
          }
          return response.data as HighlightSummary;
        })
      );
      return highlightsMapping.filter(
        (highlight): highlight is HighlightSummary => highlight !== null
      );
    },
    enabled: !!recentNotifications && recentNotifications.length > 0,
  });

  const isLoading = propIsLoading || notificationsLoading;
  const latestNotification = recentNotifications[0];

  // 호버된 하이라이트 찾기
  const hoveredHighlight = useMemo(
    () => recentHighlights?.find((h) => h.id === hoveredId),
    [recentHighlights, hoveredId]
  );

  // 메인 알림 클릭 핸들러
  const handleMainClick = (event: React.MouseEvent<HTMLElement>) => {
    setPopoverAnchorEl(popoverOpen ? null : event.currentTarget);
  };

  // 팝오버 닫기
  const handlePopoverClose = () => {
    setPopoverAnchorEl(null);
  };

  // 개별 알림 호버 핸들러 (Popper용)
  const handleNotificationHover = (
    event: React.MouseEvent<HTMLElement>,
    notification: HighlightNotification
  ) => {
    setPopperAnchorEl(event.currentTarget);
    setHoveredId(notification.id);
    setPopperOpen(true);
    onMemoClick?.(notification);
  };

  // Popper 마우스 리브 핸들러
  const handlePopperLeave = () => {
    setPopperOpen(false);
    setHoveredId(null);
    setPopperAnchorEl(null);
  };

  // 하이라이트 클릭으로 전자책 이동
  const handleHighlightClick = (highlight: HighlightSummary) => {
    navigate({
      to: "/reader/$bookId",
      params: {
        bookId: highlight.bookId,
      },
      search: {
        groupId: groupId,
        activityId: activityId,
        temporalProgress: true,
        location: highlight.cfi,
      },
    });
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          p: 3,
          textAlign: "center",
          border: `2px dashed ${alpha(theme.palette.divider, 0.5)}`,
          borderRadius: 2,
          bgcolor: alpha(theme.palette.action.hover, 0.3),
        }}
      >
        <Skeleton variant="text" width={300} height={32} sx={{ mx: "auto" }} />
      </Box>
    );
  }

  if (!latestNotification) {
    return (
      <Box
        sx={{
          p: 3,
          textAlign: "center",
          border: `2px dashed ${alpha(theme.palette.divider, 0.5)}`,
          borderRadius: 2,
          bgcolor: alpha(theme.palette.action.hover, 0.3),
        }}
      >
        <Typography variant="h6" color="text.secondary">
          📢 아직 알림이 없습니다
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          활동이 시작되면 여기에 알림이 표시됩니다
        </Typography>
      </Box>
    );
  }

  return (
    <>
      {/* 메인 알림 표시 */}
      <Box
        onClick={handleMainClick}
        sx={{
          p: 3,
          textAlign: "center",
          border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
          borderRadius: 2,
          bgcolor: alpha(theme.palette.primary.main, 0.05),
          cursor: "pointer",
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            borderColor: theme.palette.primary.main,
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            transform: "translateY(-2px)",
            boxShadow: theme.shadows[4],
          },
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="center"
          spacing={1}
        >
          <Avatar
            src={latestNotification.authorProfileImageURL}
            sx={{ width: 40, height: 40 }}
          />
          <Typography variant="h6" color="primary.main">
            {latestNotification.authorName}님이{" "}
            {formatTimeAgo(latestNotification.createdAt)}에 하이라이트를
            등록했습니다
          </Typography>
        </Stack>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mt: 1, display: "block" }}
        >
          클릭하여 최근 활동을 확인하세요
        </Typography>
      </Box>

      {/* 최근 알림 목록 팝오버 (클릭으로 열기) */}
      <Popover
        open={popoverOpen}
        anchorEl={popoverAnchorEl}
        onClose={handlePopoverClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        slotProps={{
          paper: {
            sx: {
              mt: 1,
              minWidth: 400,
              maxWidth: 500,
              border: `1px solid ${theme.palette.divider}`,
            },
          },
        }}
        style={{ zIndex: 1300 }}
        disableRestoreFocus
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
            최근 활동 알림
          </Typography>

          <Stack spacing={1}>
            {recentNotifications.slice(0, 5).map((notification) => {
              const highlight = recentHighlights?.find(
                (h) => h.id === notification.id
              );

              return (
                <Card
                  key={notification.id}
                  variant="outlined"
                  onMouseEnter={(e) => handleNotificationHover(e, notification)}
                  onMouseLeave={handlePopperLeave}
                  onClick={() => highlight && handleHighlightClick(highlight)}
                  sx={{
                    cursor: "pointer",
                    transition: "all 0.2s ease-in-out",
                    "&:hover": {
                      bgcolor: alpha(theme.palette.action.hover, 0.5),
                      borderColor: theme.palette.primary.main,
                      transform: "translateX(4px)",
                    },
                  }}
                >
                  <CardContent sx={{ p: 2 }}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Avatar
                        src={notification.authorProfileImageURL}
                        sx={{ width: 32, height: 32 }}
                      />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" fontWeight={500}>
                          {getNotificationMessage(notification)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatTimeAgo(notification.createdAt)}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              );
            })}
          </Stack>
        </Box>
      </Popover>

      {/* 하이라이트 상세 정보 Popper (호버로 표시) */}
      <Popper
        open={popperOpen && !!hoveredHighlight}
        anchorEl={popperAnchorEl}
        placement="right-start"
        disablePortal={false}
        onMouseEnter={() => setPopperOpen(true)}
        onMouseLeave={handlePopperLeave}
        style={{ zIndex: 9999 }}
      >
        <Box
          sx={{
            bgcolor: "background.paper",
            boxShadow: 3,
            borderRadius: 2,
            maxWidth: 400,
            ml: 1,
          }}
        >
          {hoveredHighlight ? (
            <HighlightSummaryCard highlightSummary={hoveredHighlight} />
          ) : (
            <Box sx={{ p: 2 }}>
              <Typography variant="body2" color="text.secondary">
                불러오는 중...
              </Typography>
            </Box>
          )}
        </Box>
      </Popper>
    </>
  );
}

// 사용 예시
export function ActivityNotificationExample() {
  const handleMemoClick = (notification: HighlightNotification) => {
    console.log("하이라이트 호버:", notification);
  };

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", p: 2 }}>
      <ActivityNotificationSection
        activityId={123}
        groupId={456}
        onMemoClick={handleMemoClick}
      />
    </Box>
  );
}
