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
  Popover,
  Card,
  Avatar,
  Box,
} from "@mui/material";
import { Group, Settings } from "@mui/icons-material";
import { LinkIconButton } from "../../../../component/_pathlessLayout/groups/$groupId/LinkIconButton";
import { GroupInfo, GroupMembershipStatus } from "../../../../types/groups";
import API_CLIENT from "../../../../api/api";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

const MEMBERS_SIZE = 2;
interface GroupHeaderProps {
  group: GroupInfo | undefined;
  groupId: number;
}

export function GroupHeader({ group, groupId }: GroupHeaderProps) {
  const [joinGroupRequested, setJoinGroupRequested] = useState(false);
  const [membersPopoverAnchorElement, setMembersPopoverAnchorElement] =
    useState<HTMLButtonElement | null>(null);
  const [hasMoreMembers, setHasMoreMembers] = useState(false);

  const { data: members } = useQuery({
    queryKey: ["groupMembers", groupId],
    queryFn: async () => {
      const response = await API_CLIENT.groupController.getGroupMembers(
        groupId,
        {
          page: 0,
          size: MEMBERS_SIZE,
        }
      );
      if (!response.isSuccessful) {
        throw new Error(response.errorMessage);
      }
      setHasMoreMembers((response.data.totalItems || 0) > MEMBERS_SIZE);
      return response.data.content;
    },
    initialData: [],
  });

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

  const onMembersButtonClicked = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    setMembersPopoverAnchorElement(event.currentTarget);
  };
  const handleProgressPopoverClose = () => {
    setMembersPopoverAnchorElement(null);
  };

  if (!group) {
    return <GroupHeaderSkeleton />;
  }

  return (
    <>
      <Popover
        open={!!membersPopoverAnchorElement}
        anchorEl={membersPopoverAnchorElement}
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
          모임 멤버
        </Typography>
        <Divider />
        {members && members.length === 0 ? (
          <Typography variant="body2">아직 멤버가 없습니다.</Typography>
        ) : (
          <Stack spacing={1} textAlign={"center"}>
            {members &&
              members.map((member) => (
                <Card key={member.userId}>
                  <Stack
                    direction={"row"}
                    spacing={1}
                    alignItems={"center"}
                    sx={{ p: 2 }}
                  >
                    <Avatar src={member.profileImageURL} />
                    <Typography variant="body2">{member.nickname!}</Typography>
                  </Stack>
                </Card>
              ))}
            {hasMoreMembers && (
              <Box>
                <Typography variant="body2" color="textSecondary">
                  {`+ ${group.memberCount - (members?.length || 0)}`}
                </Typography>
              </Box>
            )}
          </Stack>
        )}
      </Popover>
      <Paper sx={{ p: 2 }}>
        <Stack spacing={2}>
          <Stack direction={"row"} spacing={2}>
            <Stack flexGrow={1}>
              <Stack direction={"row"} spacing={2} flexGrow={1}>
                <Stack>
                  <CardMedia
                    image={group.groupImageURL}
                    sx={{ width: 256, height: 256 }}
                  />
                </Stack>
                <Stack spacing={2} sx={{ flexGrow: 1 }}>
                  <Stack direction={"row"} spacing={1}>
                    <Typography variant="h3" flexGrow={1}>
                      {group.name}
                    </Typography>
                    <Button
                      sx={{ ml: "auto", gap: 0.5 }}
                      onClick={onMembersButtonClicked}
                    >
                      <Icon>
                        <Group />
                      </Icon>
                      {group.memberCount}
                    </Button>
                    {group.myMemberShipStatus ===
                      GroupMembershipStatus.OWNED && (
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
                  <Stack direction={"row"} spacing={1} alignItems={"center"}>
                    <Avatar src={group.leaderProfileImageURL} />
                    <Typography variant="body2">
                      {group.leaderNickname}
                    </Typography>
                  </Stack>
                  <Typography variant="body1" flexGrow={1}>
                    {group.description}
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
                      {group.myMemberShipStatus ===
                      GroupMembershipStatus.PENDING
                        ? "가입 대기중"
                        : "가입하기"}
                    </Button>
                  )}
                  {group.myMemberShipStatus ===
                    GroupMembershipStatus.JOINED && (
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
    </>
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
