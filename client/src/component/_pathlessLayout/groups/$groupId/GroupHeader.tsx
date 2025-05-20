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
import { GroupInfo, GroupMembershipStatus } from "../../../../types/groups";
import API_CLIENT from "../../../../api/api";
import { useState } from "react";

interface GroupHeaderProps {
  group: GroupInfo | undefined;
  groupId: number;
}

export function GroupHeader({ group, groupId }: GroupHeaderProps) {
  const [joinGroupRequested, setJoinGroupRequested] = useState(false);

  const onJoinButtonClicked = async () => {
    const response = await API_CLIENT.groupController.requestJoinGroup(groupId);
    if (!response.isSuccessful) {
      alert(response.errorMessage);
      return;
    }
    setJoinGroupRequested(true);
    alert("모임 가입 요청이 완료되었습니다.");
  };

  const onLeaveButtonClicked = () => {
    return async () => {
      const response = await API_CLIENT.groupController.leaveGroup(groupId);
      if (!response.isSuccessful) {
        alert(response.errorMessage);
        return;
      }
      alert("모임에서 탈퇴하였습니다.");
      window.location.reload();
    };
  };

  if (!group) {
    return <GroupHeaderSkeleton />;
  }

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
                  {group.myMemberShipStatus === GroupMembershipStatus.OWNED && (
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
                  )}
                </Stack>
                <Typography variant="body1" flexGrow={1}>
                  {group ? group.description : <Skeleton />}
                </Typography>
                {(group.myMemberShipStatus === GroupMembershipStatus.NONE ||
                  group.myMemberShipStatus ===
                    GroupMembershipStatus.PENDING) && (
                  <Button
                    onClick={onJoinButtonClicked}
                    variant="contained"
                    disabled={joinGroupRequested}
                    sx={{
                      justifySelf: "flex-end",
                      alignSelf: "flex-end",
                      width: "fit-content",
                    }}
                  >
                    {group.myMemberShipStatus === GroupMembershipStatus.PENDING
                      ? "가입 대기중"
                      : "가입하기"}
                  </Button>
                )}
                {group.myMemberShipStatus === GroupMembershipStatus.JOINED && (
                  <Button
                    variant="contained"
                    color="error"
                    onClick={onLeaveButtonClicked()}
                    sx={{
                      justifySelf: "flex-end",
                      alignSelf: "flex-end",
                      width: "fit-content",
                    }}
                  >
                    모임 탈퇴하기
                  </Button>
                )}
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
function GroupHeaderSkeleton() {
  return (
    <Paper sx={{ p: 2 }}>
      <Stack spacing={2}>
        <Stack direction={"row"} spacing={2}>
          <Stack flexGrow={1}>
            <Stack direction={"row"} spacing={2} flexGrow={1}>
              <Stack>
                <Skeleton variant="rectangular" width={256} height={256} />
              </Stack>
              <Stack sx={{ flexGrow: 1 }}>
                <Stack direction={"row"} spacing={1}>
                  <Typography variant="h3" flexGrow={1}>
                    <Skeleton variant="text" width={180} />
                  </Typography>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    sx={{
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <Skeleton
                      variant="circular"
                      width={24}
                      height={24}
                      sx={{ mr: 1 }}
                    />
                    <Skeleton variant="text" width={40} />
                  </Typography>
                  <Skeleton
                    variant="circular"
                    width={40}
                    height={40}
                    sx={{ ml: 1 }}
                  />
                </Stack>
                <Typography variant="body1" flexGrow={1}>
                  <Skeleton variant="text" width={240} />
                  <Skeleton variant="text" width={180} />
                </Typography>
                <Skeleton
                  variant="rectangular"
                  width={120}
                  height={36}
                  sx={{ mt: 2, alignSelf: "flex-end" }}
                />
              </Stack>
            </Stack>
          </Stack>
        </Stack>
        <Divider />
        <Grid container spacing={1}>
          <Skeleton width={128} />
          <Skeleton width={64} />
          <Skeleton width={96} />
        </Grid>
      </Stack>
    </Paper>
  );
}
