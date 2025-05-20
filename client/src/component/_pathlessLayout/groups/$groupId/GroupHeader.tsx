import {
  Paper,
  Stack,
  CardMedia,
  Skeleton,
  Typography,
  Icon,
  Button,
  Divider,
  Grid,
  Chip,
} from "@mui/material";
import { People, Settings } from "@mui/icons-material";
import { LinkIconButton } from "../../../../component/_pathlessLayout/groups/$groupId/LinkIconButton";
import { GroupInfo } from "../../../../types/groups";

interface GroupHeaderProps {
  group: GroupInfo | undefined;
  groupId: number;
  joinGroupRequested: boolean;
  handleJoinGroup: () => void;
}

export function GroupHeader({
  group,
  groupId,
  joinGroupRequested,
  handleJoinGroup,
}: GroupHeaderProps) {
  return (
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
                  <Skeleton variant="rectangular" width={256} height={256} />
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
                    params={{ groupId: groupId.toString() }}
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
  );
}
