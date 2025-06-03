import {
  Box,
  Button,
  Card,
  CardActions,
  CircularProgress,
  Dialog,
  Divider,
  Grid,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Modal,
  Paper,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { Highlight } from "../types/highlight";
import { Fragment, useState } from "react";
import { Delete, Edit, Sort } from "@mui/icons-material";
import { useInfiniteQuery } from "@tanstack/react-query";
import API_CLIENT from "../api/api";
import { setResponsiveStyleValueSm } from "../utils/setResponsiveStyleValue";

type HighlightFilterKind =
  | {
      kind: "MyHighlights";
    }
  | {
      kind: "ActivityHighlights";
      activityId: number;
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
  const [openFilterDialog, setOpenFilterDialog] = useState(false);
  const [highlightFilterKind, setHighlightFilterKind] =
    useState<HighlightFilterKind>({ kind: "MyHighlights" });

  const {
    data: highlightPages,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ["highlights", highlightFilterKind],
    queryFn: async ({ pageParam }) => {
      const response = await API_CLIENT.highlightController.getHighlights({
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
        <Dialog
          open={openFilterDialog}
          onClose={() => setOpenFilterDialog(false)}
        >
          <Box sx={{ padding: 2 }}>
            <Typography variant="h6" gutterBottom>
              필터 선택
            </Typography>
            <List>
              <ListItemButton
                onClick={() => {
                  setHighlightFilterKind({ kind: "MyHighlights" });
                  setOpenFilterDialog(false);
                }}
              >
                <ListItemText primary="내 모든 하이라이트" />
              </ListItemButton>
              <ListItemButton
                onClick={() => {
                  setHighlightFilterKind({
                    kind: "ActivityHighlights",
                    activityId: activityId!,
                  });
                  setOpenFilterDialog(false);
                }}
              >
                <ListItemText primary="현재 활동의 하이라이트" />
              </ListItemButton>

              {/*<ListItemButton
                onClick={() => {
                  console.log("특정 활동에서 공개된 내 하이라이트 목록");
                  setOpenFilterDialog(false);
                }}
              >
                <ListItemText primary="특정 활동에서 공개된 내 하이라이트 목록" />
              </ListItemButton>
              <ListItemButton
                onClick={() => {
                  console.log("특정 활동에서 공개된 모든 하이라이트 조회");
                  setOpenFilterDialog(false);
                }}
              >
                <ListItemText primary="특정 활동에서 공개된 모든 하이라이트 조회" />
              </ListItemButton> */}
            </List>
            <Box
              sx={{ display: "flex", justifyContent: "flex-end", marginTop: 2 }}
            >
              <Button variant="text" onClick={() => setOpenFilterDialog(false)}>
                닫기
              </Button>
            </Box>
          </Box>
        </Dialog>
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
              <Grid size={12} sx={{ height: 2 }}>
                asd
              </Grid>
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
                    <Box
                      padding={1}
                      sx={{ display: "flex", justifyContent: "flex-end" }}
                    >
                      <IconButton onClick={() => setOpenFilterDialog(true)}>
                        <Sort />
                      </IconButton>
                    </Box>
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

  return (
    <ListItemButton onClick={() => onClick(highlight)}>
      <ListItemText
        primary={
          highlight.highlightContent.length > 20
            ? highlight.highlightContent.slice(0, 20) + "..."
            : highlight.highlightContent
        }
        secondary={
          <>
            <Typography
              variant="body2"
              color="textSecondary"
              component={"span"}
            >
              {`${
                highlight.memo.length > 20
                  ? highlight.memo.slice(0, 20) + "..."
                  : highlight.memo
              }`}
            </Typography>
            <Typography
              variant="body2"
              color="textSecondary"
              component={"span"}
              display={"block"}
            >
              2025.04.06
            </Typography>
          </>
        }
      />
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

  return (
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
          <Box padding={1} sx={{ display: "flex", justifyContent: "flex-end" }}>
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
            <Typography
              variant="body2"
              color="textSecondary"
              textAlign={"right"}
            >
              2025.04.06
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {`${highlight.highlightContent}`}
            </Typography>
            <Divider />
            <Typography variant="body1">{`${highlight.memo}`}</Typography>
          </Stack>
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
  }
}
