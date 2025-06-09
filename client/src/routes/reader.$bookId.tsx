import { Close, Note, NoteAdd, Timelapse } from "@mui/icons-material";
import {
  Avatar,
  Badge,
  Box,
  Drawer,
  Fab,
  FormControlLabel,
  IconButton,
  Slider,
  Stack,
  styled,
  Switch,
  Typography,
  useTheme,
} from "@mui/material";
import {
  createFileRoute,
  useCanGoBack,
  useRouter,
} from "@tanstack/react-router";
import { EpubCFI, Rendition } from "epubjs";
import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import { ReactReader } from "react-reader";

import API_CLIENT from "../api/api";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Highlight } from "../types/highlight";
import loadBook from "../utils/loadBook";
import HighlightCard from "../component/HighlightCard";
import HighlightCreationModal from "../component/HighlightCreationModal";
import loadLocations from "../utils/loadLocations";
import Coachmark, { useCoachmark } from "../component/Coachmark";
import useThrottle from "../utils/useThrottle";
import { useAtomValue } from "jotai";
import State from "../states";
import { Role } from "../types/role";
import { enqueueSnackbar } from "notistack";

export const Route = createFileRoute("/reader/$bookId")({
  component: RouteComponent,
  validateSearch: (search) => {
    const activityIdString = search.activityId as string | undefined;
    const activityId = activityIdString ? parseInt(activityIdString) : NaN;

    const groupIdString = search.groupId as string | undefined;
    const groupId = groupIdString ? parseInt(groupIdString) : NaN;

    const temporalProgress = !!search.temporalProgress;

    const location = (search.location as string | undefined) || null;

    return {
      activityId: !isNaN(activityId) ? activityId : undefined,
      groupId: !isNaN(groupId) ? groupId : undefined,
      temporalProgress,
      location,
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
  const { groupId, activityId, temporalProgress, location } = Route.useSearch();

  const user = useAtomValue(State.Auth.user);
  const theme = useTheme();
  const [highlightsInPage, setHighlightsInPage] = useState<Highlight[]>([]);
  const [rendition, setRendition] = useState<Rendition | undefined>(undefined);
  const [openHighlightDrawer, setOpenHighlightDrawer] = useState(false);
  const [selection, setSelection] = useState<Selection | null>(null);
  const [openHighlightCreationModal, setOpenHighlightCreationModal] =
    useState<boolean>(false);
  const [book, setBook] = useState<ArrayBuffer>(new ArrayBuffer(0));
  const canGoBack = useCanGoBack();
  const router = useRouter();
  const navigate = Route.useNavigate();
  const [localReadProgress, setLocalReadProgress] = useState<number>(0);
  const [focusedHighlight, setFocusedHighlight] = useState<Highlight | null>(
    null
  );
  const [selectionRightBottomPosition, setSelectionRightBottomPosition] =
    useState({
      left: 0,
      top: 0,
    });
  const readerRef = useRef<ReactReader | null>(null);
  const [showHighlightsOnOnlyCurrentPage, setShowAllHighlights] =
    useState(true);
  const [, forceUpdate] = useReducer((x) => x + 1, 0);
  const { isOpen, completeCoachmark } = useCoachmark("reader");
  const [isDragging, setIsDragging] = useState(false);
  const [dragProgress, setDragProgress] = useState<number>(0);

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

  const queryParam = {
    bookId,
    activityId,
  };

  const { data: highlights, refetch: refetchHighlights } = useQuery({
    queryKey: ["highlights", queryParam],
    queryFn: async () => {
      // NOTE: 하이라이트가 100개 이상 없다고 가정

      const highlights = queryParam.activityId
        ? await (async () => {
            const [responsePrivate, responsePublic] = await Promise.all([
              API_CLIENT.highlightController.getHighlights({
                page: 0,
                size: 100,
                me: false,
                bookId: queryParam.bookId,
                activityId: queryParam.activityId,
              }),
              API_CLIENT.highlightController.getHighlights({
                page: 0,
                size: 100,
                me: true,
                bookId: queryParam.bookId,
              }),
            ]);
            if (!responsePrivate.isSuccessful) {
              throw new Error(responsePrivate.errorMessage);
            }
            if (!responsePublic.isSuccessful) {
              throw new Error(responsePublic.errorMessage);
            }

            const highlights = [
              ...(responsePrivate.data.content || []),
              ...(responsePublic.data.content || []),
            ];
            return highlights as Highlight[];
          })()
        : await (async () => {
            const response = await API_CLIENT.userController.getMyHighlights({
              page: 0,
              size: 100,
              bookId: queryParam.bookId,
            });
            if (!response.isSuccessful) {
              throw new Error(response.errorMessage);
            }
            return response.data.content || [];
          })();

      return highlights.sort((a, b) => {
        const aCreatedAtt = new Date(a.createdAt || "");
        const bCreatedAt = new Date(b.createdAt || "");
        return bCreatedAt.getTime() - aCreatedAtt.getTime();
      }) as Highlight[];
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
    if (!rendition || !location || !rendition?.book.locations.length()) {
      return;
    }
    const newReadProgress = Math.max(
      Math.min(rendition.book.locations.percentageFromCfi(location) * 100, 100),
      0
    );
    setLocalReadProgress(newReadProgress);
    if (temporalProgress) {
      return;
    }
    try {
      API_CLIENT.readingProgressController.saveMyProgress(bookId, {
        percentage: newReadProgress,
        cfi: location,
      });
    } catch (e) {
      console.error("Error parsing location", e);
    }
  }, [rendition, location, rendition?.book.locations.length()]);

  useEffect(() => {
    if (!focusedHighlight) {
      return;
    }
    const timeout = setTimeout(() => {
      setFocusedHighlight(null);
    }, 3000);
    return () => clearTimeout(timeout);
  }, [focusedHighlight]);

  const addHighlight = async (props: {
    memo: string;
    cfi: string;
    highlightContent: string;
    activityId?: number;
  }) => {
    const { cfi, memo, highlightContent, activityId } = props;
    const response = await API_CLIENT.highlightController.createHighlight({
      memo,
      cfi,
      spine,
      bookId,
      activityId,
      highlightContent,
    });

    if (!response.isSuccessful) {
      enqueueSnackbar(response.errorMessage, {
        variant: "error",
      });
    }

    enqueueSnackbar("하이라이트가 저장되었습니다.", {
      variant: "success",
    });
    refetchHighlights();
  };

  const setLocation = (cfi: string) =>
    navigate({
      to: ".",
      search: {
        activityId,
        groupId,
        temporalProgress,
        location: cfi,
      },
      replace: true,
    });

  const throttledSetLocation = useThrottle(setLocation, 500);

  const { data: members } = useQuery({
    queryKey: ["activityReadProgresses", activityId],
    queryFn: async () => {
      const response =
        await API_CLIENT.readingProgressController.getProgressFromActivity(
          activityId!,
          {
            pageable: {
              page: 0,
              size: 100,
            },
          }
        );
      if (!response.isSuccessful) {
        throw new Error(response.errorMessage);
      }
      return response.data.content || [];
    },
    initialData: [],
    enabled: !!activityId,
    refetchInterval: 1000 * 10,
  });

  const readProgressSliderMarks = useMemo(() => {
    if (!rendition) {
      return [];
    }
    const marks: ReaderProgressSliderMark[] = [
      ...highlights.map((highlight) => {
        return {
          type: "memo",
          value:
            rendition.book.locations.percentageFromCfi(highlight.cfi) * 100,
        } as ReaderProgressSliderMark;
      }),
      ...members
        .filter((member) =>
          user?.role === Role.ROLE_USER ? member.userId !== user.userId : true
        )
        .map((member) => {
          return {
            type: "member",
            value: member.percentage || 0,
            memberName: member.userNickname,
            profileImageUrl: member.userProfileImageURL || "",
          } as ReaderProgressSliderMark;
        }),
    ];
    return marks;
  }, [rendition, highlights, members]);

  return (
    <>
      <Coachmark
        steps={[
          {
            target: "",
            title: "책 읽기",
            content:
              "여기에서 책을 읽을 수 있습니다. 텍스트를 선택하면 하이라이트를 만들 수 있어요.",
            placement: "left",
          },
          {
            target: ".coachmark-highlight-button",
            title: "하이라이트",
            content: "이 버튼을 클릭하면 저장된 하이라이트들을 볼 수 있습니다.",
            placement: "left",
          },
          {
            target: ".coachmark-reading-progress-button",
            title: "읽기 진행도",
            content:
              "읽기 진행도를 자동으로 저장합니다. 마지막으로 읽은 곳부터 다시 읽을 수 있습니다",
            placement: "left",
          },
        ]}
        isOpen={isOpen}
        onComplete={completeCoachmark}
      />
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
          }}
        >
          <ReadProgressSlider
            min={0}
            max={100}
            value={isDragging ? dragProgress : localReadProgress}
            onChange={(_, value) => {
              const percent = typeof value === "number" ? value : value[0];
              setDragProgress(percent);
              setIsDragging(true);
              const cfi = rendition?.book.locations.cfiFromPercentage(
                percent / 100
              );
              if (!cfi) {
                return;
              }
              throttledSetLocation(cfi);
            }}
            onChangeCommitted={(_, value) => {
              const percent = typeof value === "number" ? value : value[0];
              setIsDragging(false);
              const cfi = rendition?.book.locations.cfiFromPercentage(
                percent / 100
              );
              if (!cfi) {
                return;
              }
              setLocation(cfi);
            }}
            slots={{
              mark: ReadProgressSliderMark,
            }}
            marks={readProgressSliderMarks}
          />
          <Stack
            direction="column"
            alignItems="flex-end"
            justifyContent={"flex-end"}
            spacing={2}
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
                <Close />
              </Fab>
            )}
            <Fab
              className="coachmark-highlight-button"
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
            <Fab
              className="coachmark-reading-progress-button"
              size="small"
              onClick={() => {
                navigate({
                  to: ".",
                  search: {
                    activityId,
                    groupId,
                    temporalProgress: !temporalProgress,
                    location,
                  },
                  replace: true,
                });
              }}
            >
              <Timelapse sx={{ opacity: temporalProgress ? 0.5 : 1 }} />
            </Fab>
          </Stack>
          {selection && (
            <Fab
              size="small"
              sx={{
                position: "absolute",
                left: selectionRightBottomPosition.left,
                top: selectionRightBottomPosition.top,
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
          currentActivityId={activityId}
        />
        <Drawer
          anchor="right"
          open={openHighlightDrawer}
          onClose={() => setOpenHighlightDrawer(false)}
        >
          <Stack width={320} height={"100%"}>
            <Stack direction={"row"} p={2} pb={0}>
              <Typography variant="h6" align="left" flexGrow={1} noWrap>
                하이라이트
              </Typography>

              <IconButton
                onClick={() => {
                  setOpenHighlightDrawer(false);
                }}
              >
                <Close />
              </IconButton>
            </Stack>
            <Box p={2} pt={0} alignSelf={"end"}>
              <FormControlLabel
                control={
                  <Switch
                    checked={showHighlightsOnOnlyCurrentPage}
                    onChange={() => setShowAllHighlights((v) => !v)}
                    size="small"
                  />
                }
                label="현재 페이지만"
              />
            </Box>
            <Box height={"100%"} overflow="auto">
              <Stack spacing={1} p={2}>
                {(showHighlightsOnOnlyCurrentPage
                  ? highlightsInPage
                  : highlights
                ).map((highlight) => (
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
                    onClick={() => {
                      onHighlightClick(highlight);
                      setLocation(highlight.cfi);
                    }}
                  />
                ))}
              </Stack>
            </Box>
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

            const selectionClientRect = selection
              .getRangeAt(0)
              .getBoundingClientRect();
            const viewerElement =
              readerRef.current?.readerRef.current?.viewerRef.current;
            if (!viewerElement) {
              return;
            }
            const readerIframeElement = viewerElement.querySelector("iframe");
            if (!readerIframeElement) {
              return;
            }
            const viewerClientRect =
              readerIframeElement.getBoundingClientRect();
            if (!viewerClientRect) {
              return;
            }

            setSelectionRightBottomPosition({
              left:
                selectionClientRect.left +
                selectionClientRect.width +
                viewerClientRect.left,
              top:
                selectionClientRect.top +
                selectionClientRect.height * 0.5 +
                viewerClientRect.top,
            });
            setSelection({
              text: selection.toString(),
              epubcfi: cfiRange,
            });
          }}
          showToc={false}
          getRendition={(newRendition) => {
            newRendition.once("started", async () => {
              await loadLocations(bookId, newRendition).then(forceUpdate);
            });
            setRendition(newRendition);
          }}
        />
      </Box>
    </>
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

const ReadProgressSlider = styled(Slider)(({ theme }) => ({
  height: 5,
  zIndex: theme.zIndex.fab,
  "& .MuiSlider-thumb": {
    top: 0,
    transition: "all 0.3s",
  },
  "& .MuiSlider-track": {
    top: 0,
    height: 10,
  },
  "& .MuiSlider-rail": {
    top: 0,
    height: 10,
    transition: "all 0.3s",
  },
}));

function ReadProgressSliderMark(props: {
  "data-index": number;
  style: { left: string };
  ownerState: {
    marks: ReaderProgressSliderMark[];
  };
}) {
  const theme = useTheme();
  const left = props.style.left;
  const mark = props.ownerState.marks[props["data-index"]];
  const [showTooltip, setShowTooltip] = useState(false);

  if (mark.type === "member") {
    return (
      <Box
        sx={{
          position: "absolute",
          left,
          top: 20,
          transform: "translate(-50%, -50%)",
        }}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <Avatar
          src={mark.profileImageUrl}
          sx={{
            width: 24,
            height: 24,
            borderRadius: "50% 0 50% 50%",
            transform: "rotate(-45deg)",
            transition: "all 0.3s",
          }}
        />
        {showTooltip && (
          <Box
            sx={{
              position: "absolute",
              bottom: -40,
              left: "50%",
              transform: "translateX(-50%)",
              backgroundColor: "rgba(0, 0, 0, 0.8)",
              color: "white",
              padding: "4px 8px",
              borderRadius: "4px",
              fontSize: "12px",
              whiteSpace: "nowrap",
              zIndex: theme.zIndex.tooltip,
              "&::before": {
                content: '""',
                position: "absolute",
                top: -4,
                left: "50%",
                transform: "translateX(-50%)",
                borderLeft: "4px solid transparent",
                borderRight: "4px solid transparent",
                borderBottom: "4px solid rgba(0, 0, 0, 0.8)",
              },
            }}
          >
            {mark.memberName}
          </Box>
        )}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: 10,
        height: 10,
        borderRadius: "50%",
        position: "absolute",
        transform: "translate(-50%, -50%)",
        top: 2.5,
        left,
        backgroundColor: theme.palette.primary.light,
      }}
    />
  );
}

type ReaderProgressSliderMark = { value: number } & (
  | {
      type: "memo";
    }
  | {
      type: "member";
      profileImageUrl: string;
      memberName: string;
    }
);
