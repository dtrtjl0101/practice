import { useQuery } from "@tanstack/react-query";
import { Activity } from "../../../../types/activity";
import API_CLIENT from "../../../../api/api";
import { useEffect, useState } from "react";
import {
  Autocomplete,
  Box,
  Button,
  CardActionArea,
  CardMedia,
  Container,
  Divider,
  Icon,
  IconButton,
  Modal,
  Pagination,
  Paper,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Add, Cancel, Check, Timelapse } from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from "dayjs";
import { BookMetadata } from "../../../../types/book";
import LinkButton from "../../../LinkButton";

export function ActivityCard(props: { groupId: string }) {
  const { groupId } = props;
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [activityCreateModalOpen, setActivityCreateModalOpen] = useState(false);

  const {
    data: activity,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["activity", groupId, page],
    queryFn: async () => {
      const groupIdNumber = parseInt(groupId);
      if (isNaN(groupIdNumber)) {
        throw new Error("INVALID_GROUP_ID");
      }
      const response = await API_CLIENT.activityController.getAllActivities(
        groupIdNumber,
        {
          page,
          size: 1,
          sort: ["startTime,desc"],
        }
      );

      if (!response.isSuccessful) {
        console.error(response.errorMessage);
        throw new Error(response.errorCode);
      }

      setTotalPages(response.data.totalPages!);

      const activity = response.data.content![0] as Activity | undefined;

      return activity;
    },
  });

  const onJoinActivityButtonClicked = async () => {
    if (!activity) {
      return;
    }
    const response = await API_CLIENT.activityController.joinActivity(
      activity.activityId
    );
    if (!response.isSuccessful) {
      alert(response.errorMessage);
      return;
    }
    refetch();
    alert("활동에 가입되었습니다.");
  };

  return (
    <>
      <ActivityCreateModal
        groupId={groupId}
        open={activityCreateModalOpen}
        onClose={() => setActivityCreateModalOpen(false)}
        onCreate={(_activity) => {
          alert("활동이 생성되었습니다.");
          refetch();
        }}
      />
      <Paper sx={{ p: 2 }}>
        <Stack spacing={2}>
          <Box sx={{ display: "flex", flexDirection: "row" }}>
            <Typography variant="h4" sx={{ mr: "auto" }}>
              활동
            </Typography>
            <IconButton onClick={() => setActivityCreateModalOpen(true)}>
              <Add />
            </IconButton>
          </Box>
          <Divider />
          {isFetching ? (
            <ActivityPlaceHolder />
          ) : activity ? (
            <Stack spacing={2} direction={"row"}>
              <BookInfo activity={activity} />
              <Stack spacing={1} sx={{ flexGrow: 1 }}>
                <Stack spacing={1}>
                  <Typography variant="h5">{activity.bookTitle}</Typography>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    sx={{
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <Icon>
                      <Timelapse />
                    </Icon>
                    {new Date(activity.startTime).toLocaleDateString()} ~{" "}
                    {new Date(activity.endTime).toLocaleDateString()}
                  </Typography>
                </Stack>
                <Divider />
                <Typography variant="body1" flexGrow={1}>
                  {activity.description}
                </Typography>
                <Stack
                  direction={"row"}
                  spacing={2}
                  justifyContent={"flex-end"}
                  alignItems={"center"}
                >
                  <Button
                    variant="contained"
                    onClick={onJoinActivityButtonClicked}
                  >
                    {/* TODO: 가입되었으면 리더로 가는 버튼 표시 */}
                    활동 참여하기
                  </Button>
                  <LinkButton
                    variant="contained"
                    to={"/reader/$bookId"}
                    params={{ bookId: activity.bookId.toString() }}
                  >
                    책 읽으러 가기
                  </LinkButton>
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
            onChange={(_, page) => {
              setPage(page - 1);
            }}
            sx={{ width: "100%", justifyItems: "center" }}
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
    );
  }

  return (
    <Stack spacing={2} width={256} alignItems={"center"}>
      <CardActionArea
        sx={{
          display: "flex",
          width: 256,
          alignItems: "center",
          borderRadius: 2,
        }}
      >
        <CardMedia
          image={activity.coverImageKey}
          sx={{
            height: 256,
            width: 192,
            borderRadius: 2,
          }}
        />
      </CardActionArea>
      <Stack spacing={1}>
        <CardActionArea
          sx={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            borderRadius: 2,
          }}
        >
          <Typography variant="body2" color="textPrimary">
            {activity.bookTitle}
          </Typography>
        </CardActionArea>
        <CardActionArea
          sx={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            borderRadius: 2,
          }}
        >
          <Typography variant="body2" color="textSecondary">
            {activity.bookAuthor}
          </Typography>
        </CardActionArea>
      </Stack>
    </Stack>
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
  groupId: string;
  onCreate: (activity: Activity) => void;
}) {
  const { open, onClose, groupId, onCreate } = props;
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState<Dayjs>(dayjs(new Date()));
  const [endDate, setEndDate] = useState<Dayjs>(
    dayjs(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))
  );
  const [book, setBook] = useState<BookMetadata | null>(null);

  const handleCreateActivity = async () => {
    if (!book) {
      alert("책을 선택해주세요");
      return;
    }
    if (!description) {
      alert("설명을 입력해주세요");
      return;
    }
    const groupIdNumber = parseInt(groupId);
    if (isNaN(groupIdNumber)) {
      alert("Invalid group ID");
      return;
    }
    const response = await API_CLIENT.activityController.createActivity(
      groupIdNumber,
      {
        bookId: book.id,
        endTime: endDate.toISOString(),
        startTime: startDate.toISOString(),
        description,
      }
    );
    if (!response.isSuccessful) {
      alert(response.errorMessage);
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
          <Paper sx={{ width: "100%", height: "100%", padding: 4 }}>
            <Stack spacing={2} sx={{ height: "100%", overflowY: "auto" }}>
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

  const [title, setTitle] = useState("");
  const [titleToSearch, setTitleToSearch] = useState("");
  const [book, setBook] = useState<BookMetadata | null>(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      setTitleToSearch(title);
    }, 400);
    return () => clearTimeout(handler);
  }, [title]);

  const { data: books } = useQuery({
    queryKey: ["books", titleToSearch],
    queryFn: async () => {
      const response = await API_CLIENT.ebookController.getBooks({
        title: titleToSearch,
        page: 0,
        size: 10,
      });
      if (!response.isSuccessful) {
        throw new Error(response.errorMessage);
      }
      return response.data.content! as BookMetadata[];
    },
  });

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
        <Autocomplete
          autoComplete
          disablePortal
          options={
            books?.map((book) => ({
              label: book.title,
              id: book.id,
            })) || []
          }
          fullWidth
          isOptionEqualToValue={(option, value) => {
            return option.id === value.id;
          }}
          onChange={(_, value) => {
            if (!value) {
              setBook(null);
              return;
            }
            const selectedBook = books?.find((book) => book.id === value.id);
            if (!selectedBook) {
              setBook(null);
              return;
            }
            setBook(selectedBook);
          }}
          onInputChange={(_, value) => {
            setTitle(value);
          }}
          renderInput={(params) => (
            <TextField {...params} placeholder="책 제목" />
          )}
        />

        <Typography variant="body2" color="textSecondary" sx={{ flexGrow: 1 }}>
          {book ? book.description : "책을 선택해주세요"}
        </Typography>
      </Stack>
    </Stack>
  );
}
