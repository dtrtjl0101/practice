import { useQuery } from "@tanstack/react-query";
import { Activity } from "../../../../types/activity";
import API_CLIENT from "../../../../api/api";
import { useMemo, useState } from "react";
import {
  alpha,
  Avatar,
  Box,
  Button,
  Card,
  CardActionArea,
  CardMedia,
  Chip,
  Divider,
  LinearProgress,
  Pagination,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { Timelapse, Group, StickyNote2, CoPresent } from "@mui/icons-material";
import Popover from "@mui/material/Popover";
import LinkButton from "../../../LinkButton";
import { useNavigate } from "@tanstack/react-router";
import { useSnackbar } from "notistack";

export function DayStatusChip(props: { startTime: string; endTime: string }) {
  const { startTime, endTime } = props;

  const { label, color }: { label: string; color: "info" | "secondary" } =
    useMemo(() => {
      const now = new Date();
      const start = new Date(startTime);
      const end = new Date(endTime);

      if (now < start) {
        return { label: `시작전`, color: "secondary" };
      } else if (now <= end) {
        const daysToEnd = Math.ceil(
          (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );
        return {
          label: `D-${daysToEnd === 0 ? "day" : daysToEnd}`,
          color: "info",
        };
      } else {
        return { label: "종료됨", color: "secondary" };
      }
    }, [startTime, endTime]);

  return <Chip label={label} color={color} icon={<Timelapse />} size="small" />;
}

export function PastActivityCard(props: {
  groupId: number;
  canCreate?: boolean;
}) {
  const { groupId } = props;
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const {
    data: activity,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["pastActivity", groupId, page], // 키 이름 변경으로 구분
    queryFn: async () => {
      const response = await API_CLIENT.activityController.getAllActivities(
        groupId,
        {
          page,
          size: 10, // 더 많이 가져와서 필터링
          sort: ["startTime,desc"],
        }
      );

      if (!response.isSuccessful) {
        console.error(response.errorMessage);
        throw new Error(response.errorCode);
      }

      const allActivities = response.data.content! as Activity[];
      const now = new Date();

      // 종료된 활동만 필터링
      const pastActivities = allActivities.filter((activity) => {
        const endDate = new Date(activity.endTime);
        return endDate < now;
      });

      // 페이지네이션을 위해 총 과거 활동 수 계산
      const totalPastActivities = pastActivities.length;
      const totalPastPages = Math.ceil(totalPastActivities / 1); // 1개씩 보여주므로
      setTotalPages(totalPastPages);

      // 현재 페이지에 해당하는 활동 반환
      const activity = pastActivities[page] as Activity | undefined;

      return activity;
    },
  });

  const { data: activityReadProgresses } = useQuery({
    queryKey: ["activityReadProgresses", activity?.activityId],
    queryFn: async () => {
      if (!activity) {
        return [];
      }
      const response =
        await API_CLIENT.readingProgressController.getProgressFromActivity(
          activity.activityId,
          {
            pageable: {
              page: 0,
              size: 100,
            },
          }
        );
      if (!response.isSuccessful) throw new Error(response.errorMessage);
      return response.data!.content!;
    },
    initialData: [],
  });

  const bookId = activity?.bookId;
  const { data: myReadProgress } = useQuery({
    queryKey: ["readProgress", bookId],
    queryFn: async () => {
      if (!bookId) {
        throw new Error("Book ID is not defined");
      }
      const response =
        await API_CLIENT.readingProgressController.getMyProgress(bookId);

      if (!response.isSuccessful) throw new Error(response.errorMessage);
      return response.data!;
    },
    enabled: !!bookId,
  });

  const [progressPopoverAnchor, setProgressPopoverAnchor] =
    useState<null | HTMLElement>(null);
  const handleProgressPopoverOpen = (event: React.MouseEvent<HTMLElement>) => {
    setProgressPopoverAnchor(event.currentTarget);
  };
  const handleProgressPopoverClose = () => {
    setProgressPopoverAnchor(null);
  };
  const progressPopoverOpen = Boolean(progressPopoverAnchor);

  const onJoinActivityButtonClicked = async () => {
    if (!activity) {
      return;
    }
    const response = await API_CLIENT.activityController.joinActivity(
      activity.activityId
    );
    if (!response.isSuccessful) {
      switch (response.errorCode) {
        case "EBOOK_NOT_PURCHASED": {
          const shouldMoveToPurchasePage = confirm(
            "활동에 참여하기 위해서는 책을 구매해야 합니다. 구매 페이지로 이동하시겠습니까?"
          );
          if (shouldMoveToPurchasePage) {
            navigate({
              to: "/books/$bookId",
              params: { bookId: activity.bookId },
            });
          }
          break;
        }
        default: {
          enqueueSnackbar(response.errorMessage, { variant: "error" });
        }
      }
      return;
    }
    refetch();
    enqueueSnackbar("활동에 가입되었습니다.", { variant: "success" });
  };

  return (
    <>
      <Popover
        open={progressPopoverOpen}
        anchorEl={progressPopoverAnchor}
        onClose={handleProgressPopoverClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        disableRestoreFocus
        slotProps={{
          paper: {
            sx: { p: 2, minWidth: 320 },
          },
        }}
      >
        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          활동 참여자 목록
        </Typography>
        <Divider />
        {activityReadProgresses.length === 0 ? (
          <Typography variant="body2">아직 참여자가 없습니다.</Typography>
        ) : (
          <Stack spacing={1}>
            {activityReadProgresses.map((progress) => (
              <Card key={progress.userId} variant="outlined">
                <Stack>
                  <LinearProgress
                    value={progress.percentage}
                    variant="determinate"
                  />
                  <Stack
                    direction={"row"}
                    spacing={1}
                    alignItems={"center"}
                    sx={{ p: 2 }}
                  >
                    <Avatar src={progress.userProfileImageURL} />
                    <Typography variant="body2">
                      {progress.userNickname!}
                    </Typography>
                  </Stack>
                </Stack>
              </Card>
            ))}
          </Stack>
        )}
      </Popover>
      <Paper sx={{ p: 2 }} variant="outlined">
        <Stack spacing={2}>
          <Typography variant="h4" sx={{ mr: "auto" }}>
            지난 활동
          </Typography>
          <Divider />
          {isFetching ? (
            <ActivityPlaceHolder />
          ) : activity ? (
            <Stack spacing={2}>
              <Stack
                spacing={2}
                direction={{
                  xs: "column",
                  sm: "row",
                  md: "row",
                  lg: "column",
                }} // md에서 column, lg에서 다시 row
                alignItems={"center"}
              >
                <BookInfo activity={activity} />
                <Stack spacing={2} sx={{ flexGrow: 1, width: "100%" }}>
                  {/* Header Section with Book Info and Stats */}
                  {/* Title and Status Section */}
                  <Stack
                    direction={{ xs: "column", md: "column" }} // md에서도 column 유지
                    justifyContent="space-between"
                    alignItems={{ xs: "flex-start", lg: "flex-start" }}
                    spacing={2}
                  >
                    {/* Left: Title and Author */}
                    <Stack spacing={1} sx={{ flex: 1, width: "100%" }}>
                      <Stack
                        direction={{ xs: "column", sm: "row" }}
                        alignItems={{ xs: "flex-start", sm: "center" }}
                        spacing={1}
                      >
                        <Typography variant="h5" fontWeight={600}>
                          {activity.bookTitle}
                        </Typography>
                        <DayStatusChip
                          startTime={activity.startTime}
                          endTime={activity.endTime}
                        />
                      </Stack>
                      <Stack
                        direction={"row"}
                        alignItems={"center"}
                        justifyContent={"space-between"}
                      >
                        <Typography variant="subtitle1" color="text.secondary">
                          {activity.bookAuthor}
                        </Typography>
                        <Typography
                          variant="subtitle2"
                          color="text.secondary"
                          sx={{ ml: "auto" }}
                        >
                          {new Date(activity.startTime).toLocaleDateString()} ~{" "}
                          {new Date(activity.endTime).toLocaleDateString()}
                        </Typography>
                      </Stack>
                    </Stack>

                    {/* Right: Stats Section */}
                    <Stack
                      direction="row"
                      spacing={0.5}
                      sx={{
                        alignSelf: {
                          xs: "stretch",
                          md: "center",
                          lg: "flex-start",
                        }, // md에서 center
                        justifyContent: {
                          xs: "flex-end",
                          md: "center",
                          lg: "flex-end",
                        }, // md에서 center
                        width: { md: "100%" }, // md에서 전체 너비
                      }}
                    >
                      {/* Participants */}
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                          p: 1,
                          borderRadius: 1,
                          color: "primary.main",
                          cursor: "pointer",
                          transition: "all 0.2s ease-in-out",
                          "&:hover": {
                            bgcolor: (theme) =>
                              alpha(theme.palette.primary.main, 0.08),
                            transform: "translateY(-1px)",
                          },
                        }}
                        onClick={(e) => handleProgressPopoverOpen(e)}
                      >
                        <Group fontSize="small" />
                        <Typography variant="body2" fontWeight={500}>
                          {activityReadProgresses.length}
                        </Typography>
                      </Box>

                      {/* Notes */}
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                          p: 1,
                          borderRadius: 1,
                          color: "primary.main",
                          cursor: "pointer",
                          transition: "all 0.2s ease-in-out",
                          "&:hover": {
                            bgcolor: (theme) =>
                              alpha(theme.palette.primary.main, 0.08),
                            transform: "translateY(-1px)",
                          },
                        }}
                        onClick={(e) => e}
                      >
                        <StickyNote2 fontSize="small" />
                        <Typography variant="body2" fontWeight={500}>
                          {0}
                        </Typography>
                      </Box>

                      {/* Presentations */}
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                          p: 1,
                          borderRadius: 1,
                          color: "primary.main",
                          cursor: "pointer",
                          transition: "all 0.2s ease-in-out",
                          "&:hover": {
                            bgcolor: (theme) =>
                              alpha(theme.palette.primary.main, 0.08),
                            transform: "translateY(-1px)",
                          },
                        }}
                        onClick={(e) => e}
                      >
                        <CoPresent fontSize="small" />
                        <Typography variant="body2" fontWeight={500}>
                          {0}
                        </Typography>
                      </Box>
                    </Stack>
                  </Stack>

                  <Divider />

                  {/* Description */}
                  <Typography
                    variant="body1"
                    sx={{
                      flex: 1,
                      lineHeight: 1.6,
                      color: "text.secondary",
                      textAlign: { md: "center", lg: "left" }, // md에서 가운데 정렬
                    }}
                  >
                    {activity.description}
                  </Typography>

                  {/* Action Buttons */}
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={1}
                    justifyContent={{
                      xs: "flex-end",
                      md: "center",
                      lg: "flex-end",
                    }} // md에서 center
                    alignItems={{ xs: "stretch", sm: "center" }}
                    sx={{ mt: "auto" }}
                  >
                    {!activity.isParticipant && (
                      <Button
                        variant="contained"
                        onClick={onJoinActivityButtonClicked}
                        sx={{
                          fontWeight: 600,
                          boxShadow: 1,
                          "&:hover": {
                            boxShadow: 2,
                            transform: "translateY(-1px)",
                          },
                          transition: "all 0.2s ease-in-out",
                        }}
                      >
                        활동 참여하기
                      </Button>
                    )}

                    {activity.isParticipant && (
                      <>
                        <LinkButton
                          variant="contained"
                          to={"/reader/$bookId"}
                          params={{ bookId: activity.bookId }}
                          search={{
                            groupId: groupId,
                            activityId: activity.activityId,
                            temporalProgress: false,
                            location: myReadProgress?.cfi || null,
                          }}
                          sx={{
                            fontWeight: 600,
                            boxShadow: 1,
                            "&:hover": {
                              boxShadow: 2,
                              transform: "translateY(-1px)",
                            },
                            transition: "all 0.2s ease-in-out",
                          }}
                        >
                          {`책 읽으러 가기${myReadProgress?.percentage ? ` (${Math.round(myReadProgress.percentage)}%)` : ""}`}
                        </LinkButton>

                        <LinkButton
                          variant="outlined"
                          to={
                            "/groups/$groupId/activities/$activityId/discussions"
                          }
                          params={{
                            groupId: groupId,
                            activityId: activity.activityId,
                          }}
                          sx={{
                            fontWeight: 600,
                            borderWidth: 1.5,
                            "&:hover": {
                              borderWidth: 1.5,
                              transform: "translateY(-1px)",
                              boxShadow: 1,
                            },
                            transition: "all 0.2s ease-in-out",
                          }}
                        >
                          토론게시판
                        </LinkButton>
                      </>
                    )}
                  </Stack>
                </Stack>
              </Stack>
            </Stack>
          ) : (
            <Typography variant="body1" sx={{ mt: 2 }} color="textSecondary">
              아직 활동이 없어요
            </Typography>
          )}
          <Divider />
          <Pagination
            page={page + 1}
            count={totalPages}
            onChange={(_, newPage) => {
              setPage(newPage - 1);
            }}
            sx={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
            }}
            disabled={totalPages <= 1}
          />
        </Stack>
      </Paper>
    </>
  );
}

export function ActivityPlaceHolder() {
  return (
    <Stack spacing={2} direction={"row"}>
      <Stack width={256} alignItems={"center"}>
        <Skeleton
          variant="rectangular"
          width={192}
          height={256}
          sx={{ borderRadius: 2 }}
        />
        <Skeleton variant="text" width={180} />
        <Skeleton variant="text" width={120} />
      </Stack>
      <Stack spacing={1} sx={{ flexGrow: 1 }}>
        <Skeleton variant="text" width={120} height={40} />
        <Skeleton variant="text" width={200} />
        <Divider />
        <Skeleton variant="rectangular" height={60} />
        <Skeleton
          variant="rectangular"
          width={120}
          height={36}
          sx={{ alignSelf: "flex-end" }}
        />
      </Stack>
    </Stack>
  );
}

export function BookInfo(props: { activity: Activity }) {
  const { activity } = props;

  if (!activity) {
    return (
      <Stack width={256} alignItems={"center"} alignSelf={"center"}>
        <Skeleton
          variant="rectangular"
          width={192}
          height={256}
          sx={{ borderRadius: 2 }}
        />
        <Skeleton variant="text" width={180} />
        <Skeleton variant="text" width={120} />
      </Stack>
    );
  }

  return (
    <CardActionArea
      sx={{
        display: "flex",
        width: 180,
        alignItems: "center",
        borderRadius: 2,
      }}
    >
      <CardMedia
        image={activity.coverImageURL}
        sx={{
          height: 200,
          width: 150,
          borderRadius: 2,
          flexShrink: 0,
          bgcolor: alpha("#000", 0.05),
        }}
      />
    </CardActionArea>
  );
}
