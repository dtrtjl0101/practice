import { createFileRoute, createLink } from "@tanstack/react-router";
import { GroupInfo } from "../../../../types/groups";
import {
  Box,
  Button,
  CardMedia,
  Chip,
  Container,
  Divider,
  Grid,
  Icon,
  IconButton,
  InputAdornment,
  Modal,
  OutlinedInput,
  Pagination,
  Paper,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  AddTask,
  Cancel,
  Check,
  People,
  Search,
  Settings,
  Timelapse,
} from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import API_CLIENT, { wrapApiResponse } from "../../../../api/api";
import { useState } from "react";
import { Activity } from "../../../../types/activity";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from "dayjs";

export const Route = createFileRoute("/_pathlessLayout/groups/$groupId/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { groupId } = Route.useParams();
  const [joinGroupRequested, setJoinGroupRequested] = useState(false);

  const { data: group } = useQuery({
    queryKey: ["group", groupId],
    queryFn: async () => {
      const groupIdNumber = parseInt(groupId);
      if (isNaN(groupIdNumber)) {
        throw new Error("Invalid group ID");
      }
      const response = await wrapApiResponse(
        API_CLIENT.groupController.getGroup(groupIdNumber)
      );
      if (!response.isSuccessful) {
        throw new Error(response.errorMessage);
      }

      return response.data as GroupInfo;
    },
  });

  const handleJoinGroup = async () => {
    const groupIdNumber = parseInt(groupId);
    if (isNaN(groupIdNumber)) {
      alert("Invalid group ID");
      return;
    }
    const response = await wrapApiResponse(
      API_CLIENT.groupController.requestJoinGroup(groupIdNumber)
    );
    if (!response.isSuccessful) {
      alert(response.errorMessage);
      return;
    }
    setJoinGroupRequested(true);
    alert("모임 가입 요청이 완료되었습니다.");
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Stack spacing={4} sx={{ mb: 2 }}>
        <Paper sx={{ p: 2 }}>
          <Stack spacing={2}>
            <Stack direction={"row"} spacing={2}>
              <Stack flexGrow={1}>
                <Stack direction={"row"} spacing={2} flexGrow={1}>
                  <Stack>
                    {group ? (
                      <CardMedia
                        image={group.groupImageURL}
                        sx={{ width: 256, height: 256 }}
                      />
                    ) : (
                      <Skeleton
                        variant="rectangular"
                        width={256}
                        height={256}
                      />
                    )}
                  </Stack>
                  <Stack sx={{ flexGrow: 1 }}>
                    <Stack direction={"row"} spacing={1}>
                      <Typography variant="h3" flexGrow={1}>
                        {group ? group.name : <Skeleton variant="text" />}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        sx={{
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <Icon>
                          <People />
                        </Icon>
                        {group ? group.memberCount : <Skeleton />}
                      </Typography>
                      <LinkIconButton
                        to={"/groups/$groupId/manage"}
                        params={{ groupId }}
                        size="large"
                        sx={{
                          alignSelf: "center",
                          justifySelf: "flex-end",
                        }}
                      >
                        <Settings />
                      </LinkIconButton>
                    </Stack>
                    <Typography variant="body1" flexGrow={1}>
                      {group ? group.description : <Skeleton />}
                    </Typography>
                    <Button
                      onClick={handleJoinGroup}
                      variant="contained"
                      disabled={joinGroupRequested}
                      sx={{
                        justifySelf: "flex-end",
                        alignSelf: "flex-end",
                        width: "fit-content",
                      }}
                    >
                      {joinGroupRequested ? "가입 대기중" : "가입하기"}
                    </Button>
                  </Stack>
                </Stack>
              </Stack>
            </Stack>
            <Divider />
            <Grid container spacing={1}>
              {group ? (
                group.tags.map((tag) => {
                  return (
                    <Chip
                      key={tag}
                      label={tag}
                      onClick={() => {
                        // TODO: move to search page with tag
                      }}
                    />
                  );
                })
              ) : (
                <Skeleton width={128} />
              )}
            </Grid>
          </Stack>
        </Paper>
        <ActivityCard groupId={groupId} />
        <Paper sx={{ p: 2 }}>
          <Stack spacing={2}>
            <Typography variant="h4">모임 대화방</Typography>
            <Divider />
            <Typography variant="body1" sx={{ mt: 2 }}>
              현재활동
            </Typography>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
}

function ActivityCard(props: { groupId: string }) {
  const { groupId } = props;
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [activityCreateModalOpen, setActivityCreateModalOpen] = useState(false);

  const { data: activity, error } = useQuery({
    queryKey: ["activity", groupId, page],
    queryFn: async () => {
      const groupIdNumber = parseInt(groupId);
      if (isNaN(groupIdNumber)) {
        throw new Error("INVALID_GROUP_ID");
      }
      const response = await wrapApiResponse(
        API_CLIENT.activityController.getAllActivities(groupIdNumber, {
          page,
          size: 1,
        })
      );

      if (!response.isSuccessful) {
        console.error(response.errorMessage);
        throw new Error(response.errorCode);
      }

      setTotalPages(response.data.totalPages!);

      const activity = response.data.content![0] as Activity | undefined;
      if (!activity) {
        throw new Error("NO_ACTIVITY");
      }

      return activity;
    },
  });

  const noActivity = error && error.message === "NO_ACTIVITY";

  return (
    <>
      <ActivityCreateModal
        groupId={groupId}
        open={activityCreateModalOpen}
        onClose={() => setActivityCreateModalOpen(false)}
        onCreate={(activity) => {
          console.log(activity);
        }}
      />
      <Paper sx={{ p: 2 }}>
        <Stack spacing={2}>
          <Box sx={{ display: "flex", flexDirection: "row" }}>
            <Typography variant="h4" sx={{ mr: "auto" }}>
              활동
            </Typography>
            <IconButton onClick={() => setActivityCreateModalOpen(true)}>
              <AddTask />
            </IconButton>
          </Box>
          <Divider />
          {noActivity ? (
            <Typography variant="body1" sx={{ mt: 2 }} color="textSecondary">
              아직 활동이 없어요
            </Typography>
          ) : (
            <Stack spacing={2} direction={"row"}>
              <CardMedia
                // TODO: Use book image
                image="https://picsum.photos/256/256"
                sx={{
                  width: 256,
                  height: 256,
                  borderRadius: 2,
                }}
              />
              <Stack sx={{ flexGrow: 1 }}>
                <Stack>
                  {activity ? (
                    <Typography variant="h5">{activity.bookId}</Typography>
                  ) : (
                    <Skeleton height={48} />
                  )}
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "flex-end",
                      alignItems: "center",
                    }}
                  >
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
                      {activity ? (
                        `${new Date(activity.startTime).toLocaleDateString()} ~
                    ${new Date(activity.endTime).toLocaleDateString()}`
                      ) : (
                        <Skeleton width={256} />
                      )}
                    </Typography>
                  </Box>
                </Stack>
                <Divider />
                {activity ? (
                  <Typography variant="body1" sx={{ mt: 2 }}>
                    {activity.description}
                  </Typography>
                ) : (
                  <Skeleton sx={{ mt: 2 }} />
                )}
              </Stack>
            </Stack>
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

function ActivityCreateModal(props: {
  open: boolean;
  onClose: () => void;
  groupId: string;
  onCreate: (activity: Activity) => void;
}) {
  const { open, onClose, groupId, onCreate } = props;
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState<Dayjs>(dayjs(new Date()));
  const [endDate, setEndDate] = useState<Dayjs>(
    dayjs(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))
  );

  const handleCreateActivity = async () => {
    if (!title || !description) {
      alert("제목과 설명을 입력해주세요");
      return;
    }
    const groupIdNumber = parseInt(groupId);
    if (isNaN(groupIdNumber)) {
      alert("Invalid group ID");
      return;
    }
    const response = await wrapApiResponse(
      API_CLIENT.activityController.createActivity(groupIdNumber, {
        // TODO: 검색후 책 정보 가져오기
        bookId: 0,
        endTime: endDate.toISOString(),
        startTime: startDate.toISOString(),
        description,
      })
    );
    if (!response.isSuccessful) {
      alert(response.errorMessage);
      return;
    }
    onCreate(response.data as Activity);
    onClose();
  };

  const diffInDays = endDate.diff(startDate, "days");

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          width: "100vw",
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Container>
          <Paper sx={{ width: "100%", height: "100%", padding: 2 }}>
            <Stack spacing={2} sx={{ height: "100%", overflowY: "auto" }}>
              <Stack direction={"row"} spacing={2}>
                <CardMedia
                  image="https://picsum.photos/256/256"
                  sx={{ width: 256, height: 256 }}
                />
                <Stack spacing={2} sx={{ flexGrow: 1 }}>
                  <OutlinedInput
                    fullWidth
                    onChange={(e) => {
                      setTitle(e.target.value);
                    }}
                    value={title}
                    placeholder="책 제목"
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton>
                          <Search />
                        </IconButton>
                      </InputAdornment>
                    }
                  />
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    sx={{ flexGrow: 1 }}
                  >
                    책 설명
                  </Typography>
                  <Stack
                    spacing={2}
                    direction={"row"}
                    alignItems={"center"}
                    justifyContent={"space-between"}
                  >
                    <Icon>
                      <Timelapse />
                    </Icon>
                    <Stack spacing={2} direction={"row"} alignItems={"center"}>
                      <Typography variant="body2" color="textSecondary">
                        총 {diffInDays}일
                      </Typography>
                      <DatePicker
                        value={startDate}
                        onChange={(newValue) => {
                          if (!newValue) {
                            return;
                          }
                          if (newValue.isAfter(endDate)) {
                            return;
                          }
                          setStartDate(newValue);
                        }}
                      />
                      <Typography variant="body2" color="textSecondary">
                        ~
                      </Typography>
                      <DatePicker
                        value={endDate}
                        onChange={(newValue) => {
                          if (!newValue) {
                            return;
                          }
                          if (newValue.isBefore(startDate)) {
                            return;
                          }
                          setEndDate(newValue);
                        }}
                      />
                    </Stack>
                  </Stack>
                </Stack>
              </Stack>

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

const LinkIconButton = createLink(IconButton);
