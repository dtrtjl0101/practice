import {
  Comment,
  CommentOutlined,
  EmojiEmotions,
  MoreVert,
  Note,
  NoteAdd,
  Send,
} from "@mui/icons-material";
import {
  Badge,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Divider,
  Drawer,
  Fab,
  IconButton,
  Input,
  InputAdornment,
  Modal,
  Popover,
  Stack,
  Typography,
  useTheme,
  MenuItem,
  Menu,
  Avatar,
} from "@mui/material";
import { createFileRoute } from "@tanstack/react-router";
import { EpubCFI, Rendition } from "epubjs";
import { useEffect, useMemo, useRef, useState } from "react";
import { ReactReader } from "react-reader";
import API_CLIENT from "../api/api";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Highlight } from "../types/highlight";
import useAutoLogin from "../api/login/useAutoLogin";
import useAutoTokenRefresh from "../api/login/useAutoTokenRefresh";
import loadBook from "../util/loadBook";
import useInvalidateQueriesOnAuthChange from "../api/login/useInvalidateQueriesOnAuthChange";
import State from "../states";
import { useAtomValue } from "jotai";
import type { HighlightReactionType } from "../types/highlight";

export const Route = createFileRoute("/reader/$bookId")({
  component: RouteComponent,
  validateSearch: (search) => {
    const activityIdString = search.activityId as string | undefined;
    const activityId = activityIdString ? parseInt(activityIdString) : NaN;
    return {
      activityId: !isNaN(activityId) ? activityId : undefined,
    };
  },
  params: {
    parse: (params) => {
      const bookId = parseInt(params.bookId);
      if (isNaN(bookId)) {
        throw new Error("Invalid bookId");
      }
      return {
        bookId,
      };
    },
  },
});

type HighlightDiff = {
  added: Highlight[];
  removed: Highlight[];
};
type Selection = {
  left: number;
  top: number;
  text: string;
  epubcfi: string;
};

function RouteComponent() {
  const { bookId } = Route.useParams();
  const { activityId } = Route.useSearch();
  const theme = useTheme();
  const [location, setLocation] = useState<string | number>(10);
  const [highlightsInPage, setHighlightsInPage] = useState<Highlight[]>([]);
  const [rendition, setRendition] = useState<Rendition | undefined>(undefined);
  const [openHighlightDrawer, setOpenHighlightDrawer] = useState(false);
  const [selection, setSelection] = useState<Selection | null>(null);
  const [openHighlightCreationModal, setOpenHighlightCreationModal] =
    useState<boolean>(false);
  useAutoLogin();
  useAutoTokenRefresh();
  useInvalidateQueriesOnAuthChange();
  const [book, setBook] = useState<ArrayBuffer>(new ArrayBuffer(0));

  const queryParam = activityId
    ? {
        me: false,
        bookId,
        activityId,
      }
    : {
        me: true,
        bookId,
      };

  const spine = useMemo(() => {
    try {
      const spinePos = new EpubCFI(location.toString()).spinePos;
      return spinePos.toString();
    } catch (e) {
      console.error("Error parsing spine position", e);
      return undefined;
    }
  }, [location]);

  const { data: highlights, refetch: refetchHighlights } = useQuery({
    queryKey: ["highlights", spine, queryParam],
    queryFn: async () => {
      const response = await API_CLIENT.highlightController.getHighlights({
        page: 0,
        size: 100,
        spine,
        ...queryParam,
      });
      if (!response.isSuccessful) {
        throw new Error(response.errorMessage);
      }

      return response.data.content!.map((highlight) => highlight as Highlight);
    },
    placeholderData: keepPreviousData,
    initialData: [],
  });

  const previousHighlightsInPage = useRef<Highlight[]>([]);

  useEffect(() => {
    previousHighlightsInPage.current = highlightsInPage;
    if (!rendition || !rendition.location) {
      setHighlightsInPage([]);
      return;
    }

    const cfi = new EpubCFI();
    const startCfi = rendition.location.start.cfi;
    const endCfi = rendition.location.end.cfi;
    if (!highlights) {
      setHighlightsInPage([]);
      return;
    }
    const newMemosInPage = highlights.filter((highlight) => {
      if (cfi.compare(startCfi, highlight.cfi) >= 0) {
        return false;
      }
      if (cfi.compare(highlight.cfi, endCfi) >= 0) {
        return false;
      }
      return true;
    });

    setHighlightsInPage(newMemosInPage);
    return;
  }, [highlights, rendition, location, setHighlightsInPage]);

  useEffect(() => {
    if (!rendition) {
      return;
    }

    const { added, removed } = diffMemos(
      previousHighlightsInPage.current,
      highlightsInPage
    );
    added.forEach((highlight) => {
      rendition.annotations.highlight(highlight.cfi, {}, () => {});
    });
    removed.forEach((highlight) => {
      rendition.annotations.remove(highlight.cfi, "highlight");
    });
  }, [rendition, highlightsInPage]);

  useEffect(() => {
    loadBook(bookId).then((book) => {
      if (!book) {
        console.error("Book not found in IndexedDB");
        return;
      }
      setBook(book);
    });
  }, [bookId]);

  return (
    <Box
      sx={{
        maxWidth: "none",
        width: "100vw",
        height: "100vh",
        position: "relative",
      }}
    >
      <Box
        sx={{
          width: "100vw",
          position: "absolute",
          zIndex: theme.zIndex.fab,
        }}
      >
        <Fab
          size="small"
          sx={{
            position: "absolute",
            right: theme.spacing(2),
            top: theme.spacing(2),
          }}
          onClick={() => {
            setOpenHighlightDrawer(true);
          }}
        >
          <Badge badgeContent={highlightsInPage.length} color="primary">
            <Note />
          </Badge>
        </Fab>
        {selection && (
          <Fab
            size="small"
            sx={{
              position: "absolute",
              left: selection.left,
              top: selection.top,
              translate: "50% 50%",
            }}
            onClick={() => {
              setOpenHighlightCreationModal(true);
            }}
          >
            <NoteAdd />
          </Fab>
        )}
      </Box>
      <HighlightCreationModal
        open={openHighlightCreationModal}
        onClose={() => setOpenHighlightCreationModal(false)}
        selection={selection}
        addHighlight={async ({ cfi, memo }) => {
          const response = await API_CLIENT.highlightController.createHighlight(
            {
              memo,
              cfi,
              spine,
              bookId,
              activityId,
            }
          );

          if (!response.isSuccessful) {
            throw new Error(response.errorMessage);
          }

          refetchHighlights();
        }}
      />
      <Drawer
        anchor="right"
        open={openHighlightDrawer}
        onClose={() => setOpenHighlightDrawer(false)}
      >
        <Stack spacing={theme.spacing(2)} p={theme.spacing(2)} width={256}>
          {highlightsInPage.map((highlight) => (
            <HighlightCard
              key={highlight.id}
              highlight={highlight}
              activityId={activityId}
              refetchHighlights={refetchHighlights}
            />
          ))}
        </Stack>
      </Drawer>
      <ReactReader
        url={book}
        epubOptions={{
          spread: "none",
        }}
        location={location}
        locationChanged={(epubcfi: string) => {
          setLocation(epubcfi);
        }}
        handleTextSelected={(cfiRange, contents) => {
          const window = contents.window;
          const selection = window.getSelection();
          if (!selection) {
            setSelection(null);
            return;
          }

          contents.document.addEventListener(
            "selectionchange",
            () => {
              const selection = window.getSelection();
              if (!selection || selection.isCollapsed) {
                setSelection(null);
              }
            },
            { once: true }
          );

          const boundingClientRect = selection
            .getRangeAt(0)
            .getBoundingClientRect();
          setSelection({
            left: boundingClientRect.left,
            top: boundingClientRect.top,
            text: selection.toString(),
            epubcfi: cfiRange,
          });
        }}
        showToc={false}
        getRendition={(newRendition) => {
          setRendition(newRendition);
        }}
      />
    </Box>
  );
}

function diffMemos(prev: Highlight[], next: Highlight[]): HighlightDiff {
  const added = next.filter(
    (highlight) =>
      !prev.some((prevHighlight) => prevHighlight.id === highlight.id)
  );
  const removed = prev.filter(
    (highlight) =>
      !next.some((nextHighlight) => nextHighlight.id === highlight.id)
  );

  return {
    added,
    removed,
  };
}

function HighlightCard({
  highlight,
  refetchHighlights,
  activityId,
}: {
  highlight: Highlight;
  activityId?: number;
  refetchHighlights: () => void;
}) {
  const user = useAtomValue(State.Auth.user);
  const [openComments, setOpenComments] = useState(false);
  const [commentContent, setCommentContent] = useState("");
  const isAuthor = highlight.authorId === user?.memberId;
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [emojiAnchorEl, setEmojiAnchorEl] = useState<null | HTMLElement>(null);
  const emojiList: { type: HighlightReactionType; emoji: string }[] = [
    { type: "GREAT", emoji: "👍" },
    { type: "HEART", emoji: "❤️" },
    { type: "SMILE", emoji: "😊" },
    { type: "CLAP", emoji: "👏" },
    { type: "SAD", emoji: "😢" },
    { type: "ANGRY", emoji: "😡" },
    { type: "SURPRISED", emoji: "😲" },
  ];

  const { data: reactions, refetch: refetchReactions } = useQuery({
    queryKey: ["highlightComments", highlight.id],
    queryFn: async () => {
      const response =
        await API_CLIENT.highlightController.getHighlightReactions(
          highlight.id
        );
      if (!response.isSuccessful) {
        throw new Error(response.errorMessage);
      }
      const reactions: Map<
        HighlightReactionType,
        (typeof response.data)[number][]
      > = new Map([
        ["GREAT", []],
        ["HEART", []],
        ["SMILE", []],
        ["CLAP", []],
        ["SAD", []],
        ["ANGRY", []],
        ["SURPRISED", []],
      ]);
      response.data.forEach((reaction) => {
        reactions.get(reaction.reactionType!)!.push(reaction);
      });
      console.log(reactions);
      return reactions;
    },
    placeholderData: keepPreviousData,
  });

  const onReactionClicked = async (reaction: HighlightReactionType) => {
    const response = await API_CLIENT.reactionController.addReaction(
      highlight.id,
      {
        reactionType: reaction,
      }
    );
    if (!response.isSuccessful) {
      alert(response.errorMessage);
    }
    setEmojiAnchorEl(null);
    refetchReactions();
  };

  const onShareToGroupClicked = async () => {
    const response = await API_CLIENT.highlightController.updateHighlight(
      highlight.id,
      {
        activityId,
      }
    );
    if (!response.isSuccessful) {
      alert(response.errorMessage);
    }
    setAnchorEl(null);
    refetchHighlights();
  };

  return (
    <Card>
      <Menu
        anchorEl={anchorEl}
        open={!!anchorEl}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem
          disabled={!!highlight.activityId}
          onClick={onShareToGroupClicked}
          value="group"
        >
          그룹 공개
        </MenuItem>
      </Menu>
      <CardContent sx={{ pt: 1 }}>
        <Stack spacing={1}>
          <Stack spacing={1} direction={"row"} alignItems={"center"}>
            <Avatar src={highlight.authorProfileImageURL} />
            <Typography variant="body1">{highlight.authorName}</Typography>
            {isAuthor && (
              <IconButton
                onClick={(e) => {
                  setAnchorEl(e.currentTarget);
                }}
              >
                <MoreVert />
              </IconButton>
            )}
          </Stack>
          <Typography variant="body1">{highlight.memo}</Typography>
          {reactions && (
            <Stack direction="row" spacing={1} alignItems="center">
              {emojiList.map((e) => {
                const count = reactions.get(e.type)?.length || 0;
                if (count === 0) return null;
                return (
                  <Box
                    key={e.type}
                    sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                  >
                    <span style={{ fontSize: 20 }}>{e.emoji}</span>
                    <Typography variant="body2" color="text.secondary">
                      {count}
                    </Typography>
                  </Box>
                );
              })}
            </Stack>
          )}
        </Stack>
      </CardContent>
      <CardActions sx={{ justifyContent: "flex-end" }}>
        <IconButton size="small" onClick={() => setOpenComments(!openComments)}>
          <Badge badgeContent={2} color="primary">
            {openComments ? <Comment /> : <CommentOutlined />}
          </Badge>
        </IconButton>
        <IconButton
          size="small"
          onClick={(e) => setEmojiAnchorEl(e.currentTarget)}
        >
          <EmojiEmotions />
        </IconButton>
        <Popover
          open={Boolean(emojiAnchorEl)}
          anchorEl={emojiAnchorEl}
          onClose={() => setEmojiAnchorEl(null)}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          transformOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Stack direction="row" spacing={1}>
            {emojiList.map((e) => (
              <IconButton
                key={e.type}
                onClick={() => {
                  onReactionClicked(e.type);
                }}
                size="medium"
              >
                {e.emoji}
              </IconButton>
            ))}
          </Stack>
        </Popover>
      </CardActions>
      {openComments && (
        <>
          {new Array(2).fill(0).map(() => {
            return (
              <>
                <Divider />
                <CardHeader title="Nickname2" avatar="2" sx={{ pb: 0 }} />
                <CardContent sx={{ pt: 1 }}>
                  <Typography variant="body1">Comment</Typography>
                </CardContent>
              </>
            );
          })}
          <Divider />
          <CardActions>
            <Input
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              fullWidth
              multiline
              size="small"
              endAdornment={
                <InputAdornment position="end">
                  <IconButton edge="end">
                    <Send />
                  </IconButton>
                </InputAdornment>
              }
            />
          </CardActions>
        </>
      )}
    </Card>
  );
}

function HighlightCreationModal({
  open,
  onClose,
  selection,
  addHighlight,
}: {
  open: boolean;
  onClose: () => void;
  selection: Selection | null;
  addHighlight: (props: { memo: string; cfi: string }) => void;
}) {
  const [content, setContent] = useState("");

  if (!selection) {
    return null;
  }

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
        }}
      >
        <Card>
          <CardHeader title="Create Memo" />
          <CardContent>
            <Typography color="textSecondary" variant="body1">
              {selection.text}
            </Typography>
            <Divider />
            <Input
              value={content}
              onChange={(e) => setContent(e.target.value)}
              type="textarea"
              multiline
              fullWidth
            />
          </CardContent>
          <CardActions>
            <Button color="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                if (!selection) {
                  return;
                }
                addHighlight({
                  memo: content,
                  cfi: selection.epubcfi,
                });
                setContent("");
                onClose();
              }}
            >
              Create
            </Button>
          </CardActions>
        </Card>
      </Box>
    </Modal>
  );
}
