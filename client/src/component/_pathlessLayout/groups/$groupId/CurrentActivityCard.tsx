import { useQuery } from "@tanstack/react-query";
import { Activity } from "../../../../types/activity";
import API_CLIENT from "../../../../api/api";
import { useEffect, useMemo, useState } from "react";
import {
  alpha,
  Avatar,
  Box,
  Button,
  Card,
  CardActionArea,
  CardMedia,
  Chip,
  Container,
  Divider,
  Icon,
  IconButton,
  LinearProgress,
  Modal,
  Paper,
  Skeleton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  Add,
  Cancel,
  Check,
  Timelapse,
  Group,
  StickyNote2,
  CoPresent,
} from "@mui/icons-material";
import Popover from "@mui/material/Popover";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from "dayjs";
import { BookMetadata } from "../../../../types/book";
import LinkButton from "../../../LinkButton";
import { useNavigate } from "@tanstack/react-router";
import BookSearchInput from "../../../BookSearchInput";
import { useSnackbar } from "notistack";
import { ActivityNotificationSection } from "./ActivityNotification";

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

export function CurrentActivityCard(props: {
  groupId: number;
  canCreate?: boolean;
}) {
  const { groupId, canCreate } = props;
  const [activityCreateModalOpen, setActivityCreateModalOpen] = useState(false);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const {
    data: activity,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["currentActivity", groupId],
    queryFn: async () => {
      const response = await API_CLIENT.activityController.getAllActivities(
        groupId,
        {
          page: 0,
          size: 1,
          sort: ["startTime,desc"],
        }
      );

      if (!response.isSuccessful) {
        console.error(response.errorMessage);
        throw new Error(response.errorCode);
      }
      const activity = response.data.content![0] as Activity | undefined;
      if (activity?.endTime && new Date(activity?.endTime) < new Date()) {
        return undefined;
      }
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
      <ActivityCreateModal
        groupId={groupId}
        open={activityCreateModalOpen}
        onClose={() => setActivityCreateModalOpen(false)}
        onCreate={(_activity) => {
          enqueueSnackbar("활동이 생성되었습니다.", { variant: "success" });
          refetch();
        }}
      />
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
          <Box sx={{ display: "flex", flexDirection: "row" }}>
            <Typography variant="h4" sx={{ mr: "auto" }}>
              함께 읽기
            </Typography>
            {canCreate && (
              <IconButton onClick={() => setActivityCreateModalOpen(true)}>
                <Add />
              </IconButton>
            )}
          </Box>
          <Divider />
          {isFetching ? (
            <ActivityPlaceHolder />
          ) : activity ? (
            <Stack spacing={2}>
              <Stack spacing={2} direction={{ xs: "column", sm: "row" }}>
                <BookInfo activity={activity} />
                <Stack spacing={2} sx={{ flexGrow: 1 }}>
                  {/* Header Section with Book Info and Stats */}

                  {/* Title and Status Section */}
                  <Stack
                    direction={{ xs: "column", lg: "row" }}
                    justifyContent="space-between"
                    alignItems={{ xs: "flex-start", lg: "flex-start" }}
                    spacing={2}
                  >
                    {/* Left: Title and Author */}
                    <Stack spacing={1} sx={{ flex: 1 }}>
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
                      <Typography variant="subtitle1" color="text.secondary">
                        {activity.bookAuthor}
                      </Typography>
                    </Stack>

                    {/* Right: Stats Section */}
                    <Stack
                      direction="row"
                      spacing={0.5}
                      sx={{
                        alignSelf: { xs: "stretch", lg: "flex-start" },
                        justifyContent: { xs: "flex-end", lg: "flex-end" },
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
                          {activity.highlightCount ?? 0}
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
                        <Tooltip
                          children={(e) => {
                            e;
                          }}
                          title={"asd"}
                        />
                        <CoPresent fontSize="small" />
                        <Typography variant="body2" fontWeight={500}>
                          {activity.discussionCount ?? 0}
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
                    }}
                  >
                    {activity.description}
                  </Typography>

                  {/* Action Buttons */}
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={1}
                    justifyContent="flex-end"
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
              <Divider />
              <ActivityNotificationSection
                activityId={activity.activityId}
                groupId={groupId}
              />
            </Stack>
          ) : (
            <Typography variant="body1" sx={{ mt: 2 }} color="textSecondary">
              현재 진행 중인 활동이 없어요
            </Typography>
          )}
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
      <Stack width={180} alignItems={"center"} alignSelf={"center"}>
        <Skeleton
          variant="rectangular"
          height={200}
          width={150}
          sx={{ borderRadius: 2 }}
        />
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

export function DateRangePicker({
  startDate,
  endDate,
  setStartDate,
  setEndDate,
}: {
  startDate: Dayjs;
  endDate: Dayjs;
  setStartDate: (date: Dayjs) => void;
  setEndDate: (date: Dayjs) => void;
}) {
  const diffInDays = endDate.diff(startDate, "days");
  return (
    <Stack spacing={2} direction={"row"} alignItems={"center"}>
      <Icon>
        <Timelapse />
      </Icon>
      <Stack spacing={1} direction={"row"} alignItems={"center"}>
        <Typography variant="body2" color="textSecondary" whiteSpace={"nowrap"}>
          총 {diffInDays}일
        </Typography>
        <DatePicker
          value={startDate}
          onChange={(newValue) => {
            if (!newValue) return;
            if (newValue.isAfter(endDate)) return;
            setStartDate(newValue);
          }}
        />
        <Typography variant="body2" color="textSecondary">
          ~
        </Typography>
        <DatePicker
          value={endDate}
          onChange={(newValue) => {
            if (!newValue) return;
            if (newValue.isBefore(startDate)) return;
            setEndDate(newValue);
          }}
        />
      </Stack>
    </Stack>
  );
}

export function ActivityCreateModal(props: {
  open: boolean;
  onClose: () => void;
  groupId: number;
  onCreate: (activity: Activity) => void;
}) {
  const { open, onClose, groupId, onCreate } = props;
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState<Dayjs>(dayjs(new Date()));
  const [endDate, setEndDate] = useState<Dayjs>(
    dayjs(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))
  );
  const [book, setBook] = useState<BookMetadata | null>(null);
  const { enqueueSnackbar } = useSnackbar();

  const handleCreateActivity = async () => {
    if (!book) {
      enqueueSnackbar("책을 선택해주세요", { variant: "warning" });
      return;
    }
    if (!description) {
      enqueueSnackbar("설명을 입력해주세요", { variant: "warning" });
      return;
    }
    const response = await API_CLIENT.activityController.createActivity(
      groupId,
      {
        bookId: book.id,
        endTime: endDate.toISOString(),
        startTime: startDate.toISOString(),
        description,
      }
    );
    if (!response.isSuccessful) {
      enqueueSnackbar(response.errorMessage, { variant: "error" });
      return;
    }
    onCreate(response.data as Activity);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      >
        <Container maxWidth="md">
          <Paper
            sx={{
              width: "100%",
              height: "100%",
              padding: 4,
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <Stack spacing={2} sx={{ height: "100%" }}>
              <BookPicker
                onBookPicked={(book) => {
                  setBook(book);
                }}
              />
              <DateRangePicker
                startDate={startDate}
                endDate={endDate}
                setStartDate={setStartDate}
                setEndDate={setEndDate}
              />
              <TextField
                variant="outlined"
                multiline
                fullWidth
                label="활동 설명"
                onChange={(e) => {
                  setDescription(e.target.value);
                }}
                value={description}
                minRows={4}
                maxRows={4}
              />
              <Divider />
              <Stack direction={"row"} spacing={2} justifyContent={"flex-end"}>
                <IconButton onClick={handleCreateActivity} color="primary">
                  <Check />
                </IconButton>
                <IconButton onClick={onClose} color="secondary">
                  <Cancel />
                </IconButton>
              </Stack>
            </Stack>
          </Paper>
        </Container>
      </Box>
    </Modal>
  );
}

export function BookPicker(props: {
  onBookPicked: (book: BookMetadata) => void;
}) {
  const { onBookPicked } = props;
  const [book, setBook] = useState<BookMetadata | null>(null);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    if (!book) {
      return;
    }
    onBookPicked(book);
  }, [onBookPicked, book]);

  return (
    <Stack direction={"row"} spacing={2}>
      <Box sx={{ width: 192 }}>
        {book ? (
          <CardMedia
            image={book?.bookCoverImageURL}
            sx={{ width: 192, height: 256, borderRadius: 2 }}
          />
        ) : (
          <Skeleton
            variant="rectangular"
            width={192}
            height={256}
            sx={{ borderRadius: 2 }}
          />
        )}
      </Box>
      <Stack spacing={2} sx={{ flexGrow: 1 }}>
        <BookSearchInput
          onBookChange={(book) => {
            setBook(book);
          }}
          inputValue={inputValue}
          setInputValue={setInputValue}
        />
        <Typography variant="body2" color="textSecondary" sx={{ flexGrow: 1 }}>
          {book ? book.description : "책을 선택해주세요"}
        </Typography>
      </Stack>
    </Stack>
  );
}
