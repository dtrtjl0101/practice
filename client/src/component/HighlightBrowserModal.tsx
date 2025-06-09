import {
  Avatar,
  Box,
  Button,
  Card,
  CardActions,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  List,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Menu,
  MenuItem,
  Modal,
  Paper,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { Highlight } from "../types/highlight";
import { Fragment, useEffect, useState } from "react";
import {
  Delete,
  Edit,
  Preview,
  Public,
  PublicOff,
  Sort,
} from "@mui/icons-material";
import { useInfiniteQuery } from "@tanstack/react-query";
import API_CLIENT from "../api/api";
import { setResponsiveStyleValueSm } from "../utils/setResponsiveStyleValue";
import ActivitySelectModal from "./ActivitySelectModal";
import { useSnackbar } from "notistack";
import LinkListItemButton from "./LinkListItemButton";
import { LinkIconButton } from "./_pathlessLayout/groups/$groupId/LinkIconButton";

type HighlightFilterKind =
  | {
      kind: "MyHighlights";
    }
  | {
      kind: "ActivityHighlights";
      activityId: number;
    }
  | {
      kind: "OtherActivityHighlights";
      activityId: number;
      activityName: string;
    };

export default function HighlightBrowserModal(props: {
  activityId?: number;
  open: boolean;
  onClose: () => void;
  onSelectHighlight?: (highlight: Highlight) => void;
  onUseHighlight?: (highlight: Highlight) => void;
}) {
  const { activityId, open, onClose, onSelectHighlight, onUseHighlight } =
    props;
  const theme = useTheme();
  const [selectedHighlight, setSelectedHighlight] = useState<Highlight | null>(
    null
  );
  const [filterMenuAnchorElement, setFilterMenuAnchorElement] =
    useState<HTMLElement | null>(null);
  const [highlightFilterKind, setHighlightFilterKind] =
    useState<HighlightFilterKind>({ kind: "MyHighlights" });
  const [activitySelectModalOpen, setActivitySelectModalOpen] = useState(false);

  const {
    data: highlightPages,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ["highlights", highlightFilterKind],
    queryFn: async ({ pageParam }) => {
      const fetchFunction =
        highlightFilterKind.kind === "MyHighlights"
          ? API_CLIENT.userController.getMyHighlights
          : API_CLIENT.highlightController.getHighlights;
      const response = await fetchFunction({
        page: pageParam,
        size: 30,
        ...getHighlightFilter(highlightFilterKind),
      });
      if (!response.isSuccessful) {
        console.error(response.errorCode);
        throw new Error(response.errorCode);
      }
      return response.data;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      if (lastPage.currentPage! < lastPage.totalPages!) {
        return lastPage.currentPage! + 1;
      }
      return undefined;
    },
  });

  const onHighlightClick = (highlight: Highlight) => {
    setSelectedHighlight(highlight);
    if (onSelectHighlight) {
      onSelectHighlight(highlight);
    }
  };

  const onHighlightUseButtonClick = (highlight: Highlight) => {
    if (onUseHighlight) {
      onUseHighlight(highlight);
    }
    setSelectedHighlight(null);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={() => {
        onClose();
      }}
    >
      <>
        <ActivitySelectModal
          open={activitySelectModalOpen}
          onClose={() => setActivitySelectModalOpen(false)}
          onSelect={(activity) => {
            setHighlightFilterKind({
              kind: "OtherActivityHighlights",
              activityId: activity.id,
              activityName: activity.name,
            });
            setActivitySelectModalOpen(false);
            setFilterMenuAnchorElement(null);
          }}
        />
        <Menu
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "center",
          }}
          open={!!filterMenuAnchorElement}
          anchorEl={filterMenuAnchorElement}
          onClose={() => setFilterMenuAnchorElement(null)}
        >
          <MenuItem
            onClick={() => {
              setHighlightFilterKind({ kind: "MyHighlights" });
              setFilterMenuAnchorElement(null);
            }}
          >
            {getHighlightFilterLabel({ kind: "MyHighlights" })}
          </MenuItem>
          {activityId && (
            <MenuItem
              onClick={() => {
                setHighlightFilterKind({
                  kind: "ActivityHighlights",
                  activityId,
                });
                setFilterMenuAnchorElement(null);
              }}
            >
              {getHighlightFilterLabel({
                kind: "ActivityHighlights",
                activityId,
              })}
            </MenuItem>
          )}
          <MenuItem onClick={() => setActivitySelectModalOpen(true)}>
            다른 활동의 하이라이트
          </MenuItem>
        </Menu>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          <Paper
            sx={{
              width: "90vw",
              height: "90vh",
              p: 2,
              maxWidth: theme.breakpoints.values.lg,
              overflowY: "scroll",
            }}
          >
            <Grid
              container
              spacing={1}
              height={setResponsiveStyleValueSm("none", "100%")}
            >
              <Grid
                size={setResponsiveStyleValueSm(12, 4)}
                sx={{ height: "100%" }}
              >
                <Card
                  variant="outlined"
                  sx={{
                    height: setResponsiveStyleValueSm("none", "100%"),
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Stack spacing={1} sx={{ flexGrow: 1, overflow: "hidden" }}>
                    <Button
                      sx={{
                        justifyContent: "space-between",
                        p: 2,
                        whiteSpace: "pretty",
                      }}
                      size="large"
                      color="inherit"
                      onClick={(e) =>
                        setFilterMenuAnchorElement(e.currentTarget)
                      }
                      endIcon={<Sort />}
                    >
                      {getHighlightFilterLabel(highlightFilterKind)}
                    </Button>
                    <Divider />
                    <List sx={{ flexGrow: 1, overflowY: "auto" }}>
                      {highlightPages &&
                        highlightPages.pages.map((highlightPage, index) => (
                          <Fragment key={index}>
                            {highlightPage.content!.map((highlight) => (
                              <HighlightListItem
                                key={highlight.id}
                                highlight={highlight as Highlight}
                                onClick={onHighlightClick}
                              />
                            ))}
                          </Fragment>
                        ))}
                      {hasNextPage && (
                        <ListItemButton
                          onClick={() => fetchNextPage()}
                          disabled={isFetchingNextPage}
                        >
                          <ListItemText
                            sx={{
                              display: "flex",
                              justifyContent: "center",
                            }}
                            primary={
                              isFetchingNextPage ? (
                                <CircularProgress />
                              ) : (
                                <Typography
                                  variant="body2"
                                  color="textSecondary"
                                >
                                  더보기
                                </Typography>
                              )
                            }
                          />
                        </ListItemButton>
                      )}
                    </List>
                  </Stack>
                </Card>
              </Grid>
              {selectedHighlight ? (
                <HighlightViewer
                  highlight={selectedHighlight}
                  onClose={onClose}
                  onHighlightUseButtonClick={
                    onUseHighlight && onHighlightUseButtonClick
                  }
                />
              ) : (
                <HighlightViewerPlaceholder onClose={onClose} />
              )}
            </Grid>
          </Paper>
        </Box>
      </>
    </Modal>
  );
}

function HighlightListItem(props: {
  highlight: Highlight;
  onClick: (highlight: Highlight) => void;
}) {
  const { highlight, onClick } = props;

  // null/undefined 체크 및 기본값 설정
  const highlightContent = highlight.highlightContent || "";
  const memo = highlight.memo || "";

  return (
    <ListItemButton onClick={() => onClick(highlight)}>
      <ListItemText
        primary={
          highlightContent.length > 20
            ? highlightContent.slice(0, 20) + "..."
            : highlightContent
        }
        secondary={
          <>
            <Typography
              variant="body1"
              color="textSecondary"
              component={"span"}
            >
              {memo.length > 20 ? memo.slice(0, 20) + "..." : memo}
            </Typography>
            <Typography
              variant="body2"
              color="textSecondary"
              component="span"
              display="block"
              noWrap
            >
              {highlight.groupName
                ? `${highlight.groupName} - ${highlight.bookTitle}`
                : highlight.bookTitle}
            </Typography>
            <Typography
              variant="body2"
              color="textSecondary"
              component={"span"}
              display={"block"}
              textAlign={"right"}
            >
              {new Date(highlight.createdAt).toLocaleDateString("ko-KR", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
              })}
            </Typography>
          </>
        }
      />
      <IconButton size="small" sx={{ ml: 1 }} disabled>
        {highlight.activityId ? (
          <Public fontSize="small" color="action" />
        ) : (
          <PublicOff fontSize="small" color="disabled" />
        )}
      </IconButton>
    </ListItemButton>
  );
}

function HighlightViewerPlaceholder(props: { onClose: () => void }) {
  const { onClose } = props;
  return (
    <Grid
      size={setResponsiveStyleValueSm(12, 8)}
      sx={{ height: setResponsiveStyleValueSm("none", "100%") }}
    >
      <Card
        variant="outlined"
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
          }}
        >
          <Typography
            variant="body2"
            color="textSecondary"
            textAlign={"center"}
          >
            하이라이트를 선택하세요
          </Typography>
        </Box>

        <CardActions
          sx={{
            // justifyContent: "flex-end",
            alignSelf: "flex-end",
            justifySelf: "flex-end",
          }}
        >
          <Button variant="outlined" color="secondary" onClick={onClose}>
            취소
          </Button>
        </CardActions>
      </Card>
    </Grid>
  );
}

function HighlightViewer(props: {
  highlight: Highlight;
  onClose: () => void;
  onHighlightUseButtonClick?: (highlight: Highlight) => void;
}) {
  const { highlight, onClose, onHighlightUseButtonClick } = props;
  const [activitySelectModalOpen, setActivitySelectModalOpen] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const [visibilityOverwrite, setVisibilityOverwrite] = useState(false);

  // null/undefined 체크 및 기본값 설정
  const highlightContent = highlight.highlightContent || "";
  const memo = highlight.memo || "";

  const handlePublishHighlight = async (activityId: number) => {
    const response = await API_CLIENT.highlightController.updateHighlight(
      highlight.id,
      {
        activityId,
      }
    );

    if (!response.isSuccessful) {
      enqueueSnackbar(response.errorMessage, { variant: "error" });
      setActivitySelectModalOpen(false);
      return;
    }
    enqueueSnackbar("하이라이트가 공개되었습니다.", { variant: "success" });
    setActivitySelectModalOpen(false);
    setVisibilityOverwrite(true);
  };

  useEffect(() => {
    setVisibilityOverwrite(false);
  }, [highlight]);

  return (
    <>
      <ActivitySelectModal
        open={activitySelectModalOpen}
        onClose={() => setActivitySelectModalOpen(false)}
        onSelect={({ id }) => {
          handlePublishHighlight(id);
        }}
        description="하이라이트를 공개할 활동을 선택하세요. 한번 공개한 하이라이트는 활동을 변경할 수 없습니다."
      />
      <Grid
        size={setResponsiveStyleValueSm(12, 8)}
        sx={{ height: setResponsiveStyleValueSm("none", "100%") }}
      >
        <Card
          variant="outlined"
          elevation={2}
          sx={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Stack spacing={1} sx={{ flexGrow: 1, overflow: "hidden" }}>
            <Box
              padding={1}
              sx={{ display: "flex", justifyContent: "flex-end" }}
            >
              <LinkIconButton
                color="secondary"
                to={"/reader/$bookId"}
                params={{
                  bookId: highlight.bookId,
                }}
                search={{
                  activityId: highlight.activityId,
                  groupId: highlight.groupId,
                  location: highlight.cfi,
                  temporalProgress: true,
                }}
              >
                <Preview />
              </LinkIconButton>
              <IconButton
                color="secondary"
                onClick={() => {
                  if (visibilityOverwrite || highlight.activityId) {
                    enqueueSnackbar(
                      "한번 공개한 하이라이트는 활동을 변경할 수 없습니다.",
                      { variant: "warning" }
                    );
                    return;
                  }
                  setActivitySelectModalOpen(true);
                }}
              >
                {visibilityOverwrite || highlight.activityId ? (
                  <Public />
                ) : (
                  <PublicOff />
                )}
              </IconButton>
              <IconButton color="secondary">
                <Edit />
              </IconButton>
              <IconButton color="error">
                <Delete />
              </IconButton>
            </Box>
            <Divider />
            <Stack
              spacing={1}
              sx={{ flexGrow: 1, overflowY: "auto", padding: 2 }}
            >
              <Stack
                justifyContent={"space-between"}
                alignItems={"flex-end"}
                direction="row"
              >
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <Avatar src={highlight.authorProfileImageURL} />
                  <Typography noWrap>{highlight.authorName}</Typography>
                </Stack>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  noWrap
                  component={"span"}
                >
                  {new Date(highlight.createdAt).toLocaleDateString("ko-KR", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                  })}
                </Typography>
              </Stack>
              <Typography variant="body2" color="textSecondary">
                {highlightContent}
              </Typography>
              <Divider />
              <Typography variant="body1">{memo}</Typography>
            </Stack>
            {highlight.groupName && highlight.groupId && (
              <LinkListItemButton
                to={"/groups/$groupId"}
                params={{
                  groupId: highlight.groupId,
                }}
                sx={{ flexGrow: 0 }}
              >
                <ListItemAvatar>
                  <Avatar variant="rounded" src={highlight.groupImageURL} />
                </ListItemAvatar>
                <ListItemText primary={<>{highlight.groupName}</>} />
              </LinkListItemButton>
            )}
            <LinkListItemButton
              to={"/books/$bookId"}
              params={{ bookId: highlight.bookId }}
              sx={{ flexGrow: 0 }}
            >
              <ListItemAvatar>
                <Avatar variant="rounded" src={highlight.bookCoverImageURL} />
              </ListItemAvatar>
              <ListItemText
                primary={highlight.bookTitle}
                secondary={highlight.bookAuthor}
              />
            </LinkListItemButton>
            <CardActions sx={{ justifyContent: "flex-end" }}>
              <Button variant="outlined" color="secondary" onClick={onClose}>
                취소
              </Button>
              {onHighlightUseButtonClick && (
                <Button
                  variant="contained"
                  onClick={() => onHighlightUseButtonClick(highlight)}
                >
                  선택
                </Button>
              )}
            </CardActions>
          </Stack>
        </Card>
      </Grid>
    </>
  );
}

type HighlightFilter = {
  spine?: string;
  bookId?: number;
  activityId?: number;
  me: boolean;
};

function getHighlightFilter(kind: HighlightFilterKind): HighlightFilter {
  switch (kind.kind) {
    case "MyHighlights":
      return { me: true };
    case "ActivityHighlights":
      return {
        me: true,
        activityId: kind.activityId,
      };
    case "OtherActivityHighlights":
      return {
        me: true,
        activityId: kind.activityId,
      };
  }
}

function getHighlightFilterLabel(kind: HighlightFilterKind): string {
  switch (kind.kind) {
    case "MyHighlights":
      return "내 모든 하이라이트";
    case "ActivityHighlights":
      return "현재 활동의 하이라이트";
    case "OtherActivityHighlights":
      return `${kind.activityName}의 하이라이트`;
  }
}
