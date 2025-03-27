import { Box, Button, useTheme } from "@mui/material";
import { createFileRoute } from "@tanstack/react-router";
import { EpubCFI, Rendition } from "epubjs";
import { nanoid } from "nanoid";
import { useCallback, useEffect, useRef, useState } from "react";
import { ReactReader } from "react-reader";

export const Route = createFileRoute("/reader")({
  component: RouteComponent,
});

type Memo = {
  id: string;
  cfiRange: string;
};
type MemoDiff = {
  added: Memo[];
  removed: Memo[];
};

function RouteComponent() {
  const theme = useTheme();
  const [location, setLocation] = useState<string | number>(10);
  const [memos, setMemos] = useState<Memo[]>([]);
  const [memosInPage, setMemosInPage] = useState<Memo[]>([]);
  const [epubUrl, setEpubUrl] = useState<ArrayBuffer>(new ArrayBuffer());
  const [rendition, setRendition] = useState<Rendition | undefined>(undefined);
  const previousMemosInPage = useRef<Memo[]>([]);

  const uploadEpub = useCallback(() => {
    let inputElement = document.createElement("input");
    inputElement.type = "file";
    inputElement.onchange = async (event) => {
      const target = event.target as HTMLInputElement;
      const file = target.files?.[0];
      if (!file) {
        return;
      }

      setEpubUrl(await file.arrayBuffer());
    };

    inputElement.click();
  }, [setEpubUrl]);

  useEffect(() => {
    previousMemosInPage.current = memosInPage;
    if (!rendition || !rendition.location) {
      setMemosInPage([]);
      return;
    }

    const cfi = new EpubCFI();
    const startCfi = rendition.location.start.cfi;
    const endCfi = rendition.location.end.cfi;
    const newMemosInPage = memos.filter((memo) => {
      if (cfi.compare(startCfi, memo.cfiRange) >= 0) {
        return false;
      }
      if (cfi.compare(memo.cfiRange, endCfi) >= 0) {
        return false;
      }
      return true;
    });

    setMemosInPage(newMemosInPage);
    return;
  }, [memos, rendition, location, setMemosInPage]);

  useEffect(() => {
    if (!rendition) {
      return;
    }

    const { added, removed } = diffMemos(
      previousMemosInPage.current,
      memosInPage
    );
    added.forEach((memo) => {
      rendition.annotations.highlight(memo.cfiRange, {}, () => {});
    });
    removed.forEach((memo) => {
      rendition.annotations.remove(memo.cfiRange, "highlight");
    });
  }, [rendition, memosInPage]);

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
        <Button onClick={uploadEpub}>Upload EPUB</Button>
      </Box>
      <ReactReader
        url={epubUrl}
        epubOptions={{
          spread: "none",
        }}
        location={location}
        locationChanged={(epubcfi: string) => {
          setLocation(epubcfi);
        }}
        handleTextSelected={(cfiRange, _contents) => {
          // TODO: Add memo with button
          setMemos((prev) => [...prev, { id: nanoid(), cfiRange }]);
        }}
        showToc={false}
        getRendition={(newRendition) => {
          setRendition(newRendition);
        }}
      />
    </Box>
  );
}

function diffMemos(prev: Memo[], next: Memo[]): MemoDiff {
  const added = next.filter(
    (memo) => !prev.some((prevMemo) => prevMemo.id === memo.id)
  );
  const removed = prev.filter(
    (memo) => !next.some((nextMemo) => nextMemo.id === memo.id)
  );

  return {
    added,
    removed,
  };
}
