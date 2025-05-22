import { ArrowBack, Close, Note, NoteAdd } from "@mui/icons-material";
import {
  Badge,
  Box,
  Drawer,
  Fab,
  IconButton,
  LinearProgress,
  Snackbar,
  Stack,
  useTheme,
} from "@mui/material";
import {
  createFileRoute,
  useCanGoBack,
  useRouter,
} from "@tanstack/react-router";
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
import HighlightCard from "../component/HighlightCard";
import HighlightCreationModal from "../component/HighlightCreationModal";
import loadLocations from "../util/loadLocations";

export const Route = createFileRoute("/reader/$bookId")({
  component: RouteComponent,
  validateSearch: (search) => {
    const activityIdString = search.activityId as string | undefined;
    const activityId = activityIdString ? parseInt(activityIdString) : NaN;

    const groupIdString = search.groupId as string | undefined;
    const groupId = groupIdString ? parseInt(groupIdString) : NaN;

    const temporalProgress = !!search.temporalProgress;

    const initialPage = search.initialPage as string | undefined;

    return {
      activityId: !isNaN(activityId) ? activityId : undefined,
      groupId: !isNaN(groupId) ? groupId : undefined,
      temporalProgress,
      initialPage,
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
  text: string;
  epubcfi: string;
};

function RouteComponent() {
  const { bookId } = Route.useParams();
  const { groupId, activityId, temporalProgress, initialPage } =
    Route.useSearch();
  const theme = useTheme();
  const [location, setLocation] = useState<string | null>(initialPage ?? null);
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
  const canGoBack = useCanGoBack();
  const router = useRouter();
  const navigate = Route.useNavigate();
  const [localReadProgress, setLocalReadProgress] = useState<number>(0);
  const [focusedHighlight, setFocusedHighlight] = useState<Highlight | null>(
    null
  );
  const [readTogetherSnackbarOpen, setReadTogetherSnackbarOpen] =
    useState(!!activityId);
  const [lastMouseUpPosition, setLastMouseUpPosition] = useState<{
    left: number;
    top: number;
  }>({
    left: 0,
    top: 0,
  });
  const readerRef = useRef<ReactReader | null>(null);

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
    if (!location) {
      return undefined;
    }
    try {
      const spinePos = new EpubCFI(location).spinePos;
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

  const { data: readProgressInServer, refetch: refetchReadProgressInServer } =
    useQuery({
      queryKey: ["readProgress", bookId],
      queryFn: async () => {
        if (!rendition || !location) {
          throw new Error("Rendition or location is not available");
        }
        const response =
          await API_CLIENT.readingProgressController.getMyProgress(bookId);
        if (!response.isSuccessful) {
          throw new Error(response.errorMessage);
        }
        return response.data.percentage!;
      },
      placeholderData: keepPreviousData,
      enabled: !!rendition && !!location,
    });

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

  const onHighlightClick = (highlight: Highlight) => {
    if (!openHighlightDrawer) {
      setOpenHighlightDrawer(true);
    }
    setFocusedHighlight(highlight);
  };
  const updateHighlight = (props: {
    removed: Highlight[];
    added: Highlight[];
  }) => {
    const { removed, added } = props;
    if (!rendition) {
      return;
    }
    removed.forEach((highlight) => {
      rendition.annotations.remove(highlight.cfi, "highlight");
    });
    added.forEach((highlight) => {
      const shouldFade =
        focusedHighlight && highlight.id !== focusedHighlight.id;
      rendition.annotations.highlight(
        highlight.cfi,
        {},
        () => {
          onHighlightClick(highlight);
        },
        undefined,
        {
          transition: "all 0.3s ease-out",
          opacity: shouldFade ? 0 : 0.7,
        }
      );
    });
  };

  useEffect(() => {
    if (!rendition) {
      return;
    }
    const { added, removed } = diffMemos(
      previousHighlightsInPage.current,
      highlightsInPage
    );
    updateHighlight({ added, removed });
  }, [rendition, highlightsInPage]);

  useEffect(() => {
    updateHighlight({
      added: highlightsInPage,
      removed: highlightsInPage,
    });
  }, [focusedHighlight]);

  useEffect(() => {
    loadBook(bookId).then((book) => {
      if (!book) {
        console.error("Book not found in IndexedDB");
        return;
      }
      setBook(book);
    });
  }, [bookId]);

  useEffect(() => {
    if (temporalProgress || !rendition || !location) {
      return;
    }
    try {
      const newReadProgress = Math.max(
        Math.min(
          rendition.book.locations.percentageFromCfi(location) * 100,
          100
        ),
        0
      );
      setLocalReadProgress(newReadProgress);
      if (
        typeof readProgressInServer === "number" &&
        newReadProgress > readProgressInServer
      ) {
        API_CLIENT.readingProgressController
          .saveMyProgress(bookId, {
            percentage: newReadProgress,
            cfi: location,
          })
          .then(() => refetchReadProgressInServer());
      }
    } catch (e) {
      console.error("Error parsing location", e);
    }
  }, [rendition, location]);

  useEffect(() => {
    if (initialPage) {
      navigate({
        search: {
          initialPage: undefined,
          activityId,
          groupId,
          temporalProgress,
        },
        replace: true,
      });
    }
  }, [location]);

  useEffect(() => {
    if (!focusedHighlight) {
      return;
    }
    const timeout = setTimeout(() => {
      setFocusedHighlight(null);
    }, 3000);
    return () => clearTimeout(timeout);
  }, [focusedHighlight]);

  useEffect(() => {
    if (!rendition) {
      return;
    }
    rendition.on("mouseup", (e: MouseEvent) => {
      const viewerElement =
        readerRef.current?.readerRef.current?.viewerRef.current;
      if (!viewerElement) {
        return;
      }
      const readerIframeElement = viewerElement.querySelector("iframe");
      if (!readerIframeElement) {
        return;
      }
      const clientRect = readerIframeElement.getBoundingClientRect();
      if (!clientRect) {
        return;
      }
      setLastMouseUpPosition({
        left: e.clientX + clientRect.left,
        top: e.clientY + clientRect.top,
      });
    });
  }, [rendition]);

  const addHighlight = async (props: {
    memo: string;
    cfi: string;
    highlightContent: string;
  }) => {
    const { cfi, memo, highlightContent } = props;
    const response = await API_CLIENT.highlightController.createHighlight({
      memo,
      cfi,
      spine,
      bookId,
      activityId,
      highlightContent,
    });

    if (!response.isSuccessful) {
      throw new Error(response.errorMessage);
    }

    refetchHighlights();
  };

  return (
    <Box
      sx={{
        maxWidth: "none",
        width: "100vw",
        height: "100vh",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          width: "100vw",
          position: "absolute",
          zIndex: theme.zIndex.fab,
        }}
      >
        <LinearProgress value={localReadProgress} variant="determinate" />
        <Stack
          direction="row"
          alignItems="center"
          justifyContent={"space-between"}
          spacing={1}
          sx={{
            position: "absolute",
            top: theme.spacing(2),
            left: theme.spacing(2),
            right: theme.spacing(2),
          }}
        >
          {canGoBack && (
            <Fab
              size="small"
              onClick={() => {
                router.history.back();
              }}
            >
              <ArrowBack />
            </Fab>
          )}
          <Snackbar
            anchorOrigin={{ vertical: "top", horizontal: "center" }}
            open={readTogetherSnackbarOpen}
            onClose={() => {
              setReadTogetherSnackbarOpen(false);
            }}
            action={
              <IconButton
                size="small"
                aria-label="close"
                color="inherit"
                onClick={() => setReadTogetherSnackbarOpen(false)}
              >
                <Close />
              </IconButton>
            }
            message="함께읽기 활성화됨"
            autoHideDuration={3000}
          />
          <Fab
            size="small"
            onClick={() => {
              setOpenHighlightDrawer(true);
            }}
            sx={{}}
          >
            <Badge badgeContent={highlightsInPage.length} color="primary">
              <Note />
            </Badge>
          </Fab>
        </Stack>
        {selection && (
          <Fab
            size="small"
            sx={{
              position: "absolute",
              left: lastMouseUpPosition.left,
              top: lastMouseUpPosition.top,
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
        addHighlight={addHighlight}
      />
      <Drawer
        anchor="right"
        open={openHighlightDrawer}
        onClose={() => setOpenHighlightDrawer(false)}
      >
        <Stack spacing={theme.spacing(2)} p={theme.spacing(2)} width={320}>
          {highlightsInPage.map((highlight) => (
            <HighlightCard
              key={highlight.id}
              highlight={highlight}
              groupId={groupId}
              activityId={activityId}
              focused={focusedHighlight?.id === highlight.id}
              refetchHighlights={refetchHighlights}
              shouldFade={
                !!focusedHighlight && focusedHighlight.id !== highlight.id
              }
              onClick={() => setFocusedHighlight(highlight)}
            />
          ))}
        </Stack>
      </Drawer>
      <ReactReader
        ref={readerRef}
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
                setFocusedHighlight(null);
              }
            },
            { once: true }
          );

          setSelection({
            text: selection.toString(),
            epubcfi: cfiRange,
          });
        }}
        showToc={false}
        getRendition={(newRendition) => {
          newRendition.once("started", async () => {
            await loadLocations(bookId, newRendition);
          });
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
