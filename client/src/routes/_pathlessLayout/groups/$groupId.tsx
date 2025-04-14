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
  Stack,
  Typography,
} from "@mui/material";
import { People } from "@mui/icons-material";

export const Route = createFileRoute("/_pathlessLayout/groups/$groupId")({
  component: RouteComponent,
});

function RouteComponent() {
  // const { groupId } = Route.useParams();

  // TODO: Fetch group data using groupId
  const group: GroupInfo = {
    name: "Group A",
    description: "Description A",
    tags: ["tag1", "tag2"],
    memberCount: 10,
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Stack spacing={4} sx={{ mb: 2 }}>
        <Paper sx={{ p: 2 }}>
          <Stack spacing={2}>
            <Box sx={{ display: "flex", flexDirection: "column" }}>
              <Typography variant="h3">{group.name}</Typography>
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
                  {group.memberCount}
                </Typography>
              </Box>
            </Box>

            <Divider />
            <Typography variant="body1" sx={{ mt: 2 }}>
              {group.description}
            </Typography>
            <Divider />
            <Grid2 container spacing={1}>
              {group.tags.map((tag) => {
                return (
                  <Chip
                    key={tag}
                    label={tag}
                    onClick={() => {
                      // TODO: move to search page with tag
                    }}
                  />
                );
              })}
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
