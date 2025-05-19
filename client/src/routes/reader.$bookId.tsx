import { ArrowBack, Note, NoteAdd } from "@mui/icons-material";
import { Badge, Box, Drawer, Fab, Stack, useTheme } from "@mui/material";
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
  const canGoBack = useCanGoBack();
  const router = useRouter();

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
        {canGoBack && (
          <Fab
            size="small"
            sx={{
              position: "absolute",
              left: theme.spacing(2),
              top: theme.spacing(2),
            }}
            onClick={() => {
              router.history.back();
            }}
          >
            <ArrowBack />
          </Fab>
        )}
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
        <Stack spacing={theme.spacing(2)} p={theme.spacing(2)} width={320}>
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
