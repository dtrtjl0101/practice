import { createFileRoute } from "@tanstack/react-router";
import { GroupInfo } from "../../../types/groups";
import {
  Box,
  CardMedia,
  Chip,
  Container,
  Divider,
  Grid2,
  Icon,
  Pagination,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { People, Timelapse } from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import API_CLIENT, { wrapApiResponse } from "../../../api/api";
import { useState } from "react";
import { Activity } from "../../../types/activity";

export const Route = createFileRoute("/_pathlessLayout/groups/$groupId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { groupId } = Route.useParams();

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

  return (
    <Container sx={{ mt: 4 }}>
      <Stack spacing={4} sx={{ mb: 2 }}>
        <Paper sx={{ p: 2 }}>
          <Stack spacing={2}>
            <Box sx={{ display: "flex", flexDirection: "column" }}>
              <Typography variant="h3">
                {group ? group.name : <Skeleton variant="text" />}
              </Typography>
              <Box
                sx={{
                  justifySelf: "flex-end",
                  alignSelf: "flex-end",
                  display: "flex",
                  flexDirection: "row",
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
                    <People />
                  </Icon>
                  {group ? group.memberCount : <Skeleton />}
                </Typography>
              </Box>
            </Box>

            <Divider />
            <Typography variant="body1" sx={{ mt: 2 }}>
              {group ? group.description : <Skeleton />}
            </Typography>
            <Divider />
            <Grid2 container spacing={1}>
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
            </Grid2>
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
    <Paper sx={{ p: 2 }}>
      <Stack spacing={2}>
        <Typography variant="h4">활동</Typography>
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
  );
}
