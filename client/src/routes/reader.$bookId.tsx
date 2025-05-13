import {
  Comment,
  CommentOutlined,
  MoreVert,
  Note,
  NoteAdd,
  Send,
  ThumbUp,
  ThumbUpOutlined,
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
  Stack,
  Typography,
  useTheme,
  MenuItem,
  Menu,
} from "@mui/material";
import { createFileRoute } from "@tanstack/react-router";
import { EpubCFI, Rendition } from "epubjs";
import { useEffect, useMemo, useRef, useState } from "react";
import { ReactReader } from "react-reader";
import API_CLIENT, { wrapApiResponse } from "../api/api";
import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Highlight } from "../types/highlight";
import useAutoLogin from "../api/login/useAutoLogin";
import useAutoTokenRefresh from "../api/login/useAutoTokenRefresh";
import loadBook from "../util/loadBook";
import useInvalidateQueriesOnAuthChange from "../api/login/useInvalidateQueriesOnAuthChange";

export const Route = createFileRoute("/reader/$bookId")({
  component: RouteComponent,
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
  const theme = useTheme();
  const [location, setLocation] = useState<string | number>(10);
  const [highlightsInPage, setHighlightsInPage] = useState<Highlight[]>([]);
  const [rendition, setRendition] = useState<Rendition | undefined>(undefined);
  const [openHighlightDrawer, setOpenHighlightDrawer] = useState(false);
  const [selection, setSelection] = useState<Selection | null>(null);
  const [openHighlightCreationModal, setOpenHighlightCreationModal] =
    useState<boolean>(false);
  const queryClient = useQueryClient();
  useAutoLogin();
  useAutoTokenRefresh();
  useInvalidateQueriesOnAuthChange();
  const [book, setBook] = useState<ArrayBuffer>(new ArrayBuffer(0));

  const spine = useMemo(() => {
    try {
      const spinePos = new EpubCFI(location.toString()).spinePos;
      return spinePos.toString();
    } catch (e) {
      console.error("Error parsing spine position", e);
      return undefined;
    }
  }, [location]);

  const { data: highlights } = useQuery({
    queryKey: ["memos", spine],
    queryFn: async () => {
      const response = await wrapApiResponse(
        API_CLIENT.highlightController.getHighlights({
          page: 0,
          size: 100,
          spine,
        })
      );
      if (!response.isSuccessful) {
        throw new Error(response.errorMessage);
      }

      return response.data.content!.map((highlight) => highlight as Highlight);
    },
    placeholderData: keepPreviousData,
    initialData: [
      {
        id: 0,
        bookId: 0,
        cfi: "epubcfi(/6/22!/4/2/2/18,/1:4,/1:20)",
        memo: "셋!",
        spine: "10",
        activityId: 0,
      },
    ],
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
    const bookIdNumber = parseInt(bookId, 10);
    if (isNaN(bookIdNumber)) {
      console.error("Invalid bookId:", bookId);
      return;
    }
    loadBook(bookIdNumber).then((book) => {
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
          const response = await wrapApiResponse(
            API_CLIENT.highlightController.createHighlight({
              memo,
              cfi,
              spine,
              // TODO: use BookId and ActivityId
              bookId: 1,
              activityId: 1,
            })
          );

          if (!response.isSuccessful) {
            throw new Error(response.errorMessage);
          }

          queryClient.resetQueries({
            queryKey: ["memos", spine],
          });
        }}
      />
      <Drawer
        anchor="right"
        open={openHighlightDrawer}
        onClose={() => setOpenHighlightDrawer(false)}
      >
        <Stack spacing={theme.spacing(2)} p={theme.spacing(2)} width={256}>
          {highlightsInPage.map((highlight) => (
            <HighlightCard key={highlight.id} highlight={highlight} />
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

function HighlightCard({ highlight }: { highlight: Highlight }) {
  const [openComments, setOpenComments] = useState(false);
  const [commentContent, setCommentContent] = useState("");
  const liked = false; // TODO
  const isAuthor = true; // TODO
  // const user = useAtomValue(State.Auth.user);
  // const isAuthor =
  //   highlight.memberId && user && highlight.memberId === user.memberId;
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  return (
    <Card>
      <CardHeader
        title="NicknameNickname"
        avatar="N"
        sx={{ pb: 0 }}
        action={
          isAuthor && (
            <IconButton
              onClick={(e) => {
                setAnchorEl(e.currentTarget);
              }}
            >
              <MoreVert />
            </IconButton>
          )
        }
      />
      <Menu anchorEl={anchorEl} open={!!anchorEl}>
        {/* TODO: handle click */}
        <MenuItem value="public">전체 공개</MenuItem>
        <MenuItem value="private">나만 보기</MenuItem>
        <MenuItem value="group">그룹 공개</MenuItem>
      </Menu>
      <CardContent sx={{ pt: 1 }}>
        <Typography variant="body1">{highlight.memo}</Typography>
      </CardContent>
      <CardActions sx={{ justifyContent: "flex-end" }}>
        <IconButton size="small" onClick={() => setOpenComments(!openComments)}>
          <Badge badgeContent={2} color="primary">
            {openComments ? <Comment /> : <CommentOutlined />}
          </Badge>
        </IconButton>
        <IconButton size="small">
          {liked ? <ThumbUp /> : <ThumbUpOutlined />}
        </IconButton>
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
