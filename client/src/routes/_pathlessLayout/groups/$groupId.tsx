import { createFileRoute } from "@tanstack/react-router";
import { GroupInfo } from "../../../types/groups";
import {
  Box,
  Chip,
  Container,
  Divider,
  Grid2,
  Icon,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { People } from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import API_CLIENT, { wrapApiResponse } from "../../../api/api";

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
        <Paper sx={{ p: 2 }}>
          <Stack spacing={2}>
            <Typography variant="h4">현재 활동</Typography>
            <Divider />
            <Typography variant="body1" sx={{ mt: 2 }}>
              현재활동
            </Typography>
          </Stack>
        </Paper>
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
