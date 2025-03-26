import { Box, Button, useTheme } from "@mui/material";
import { createFileRoute } from "@tanstack/react-router";
import { EpubCFI, Rendition } from "epubjs";
import { nanoid } from "nanoid";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ReactReader } from "react-reader";

export const Route = createFileRoute("/reader")({
  component: RouteComponent,
});

type Memo = {
  id: string;
  cfiRange: string;
};

function RouteComponent() {
  const theme = useTheme();
  const [location, setLocation] = useState<string | number>(10);
  const [memos, setMemos] = useState<Memo[]>([]);
  const [epubUrl, setEpubUrl] = useState<ArrayBuffer>(new ArrayBuffer());
  const [rendition, setRendition] = useState<Rendition | undefined>(undefined);

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

  const memosInPage = useMemo(() => {
    if (!rendition) {
      return [];
    }
    const cfi = new EpubCFI();
    const 
  }, [memos, rendition, location]);

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
          const qwe = new EpubCFI(epubcfi);
          setLocation(epubcfi);
          if (rendition) {
            console.log(
              rendition.location.start.cfi,
              rendition.location.end.cfi,
            );
          }
        }}
        handleTextSelected={(cfiRange, _contents) => {
          // setMemos((prev) => [...prev, { id: nanoid(), cfiRange }]);
          console.log(cfiRange);
        }}
        showToc={false}
        getRendition={(rendition) => setRendition(rendition)}
      />
    </Box>
  );
}
