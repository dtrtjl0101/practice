import {
  Modal,
  Box,
  Card,
  Typography,
  Divider,
  CardActions,
  Button,
  Stack,
  OutlinedInput,
} from "@mui/material";
import { useState } from "react";

type Selection = {
  text: string;
  epubcfi: string;
};

export default function HighlightCreationModal({
  open,
  onClose,
  selection,
  addHighlight,
}: {
  open: boolean;
  onClose: () => void;
  selection: Selection | null;
  addHighlight: (props: {
    memo: string;
    cfi: string;
    highlightContent: string;
  }) => void;
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
        <Card variant="outlined" sx={{ p: 2 }}>
          <Stack spacing={2}>
            <Typography variant="h6">하이라이트 만들기</Typography>
            <Typography color="textSecondary" variant="body1">
              {selection.text}
            </Typography>
            <Divider />
            <OutlinedInput
              value={content}
              onChange={(e) => setContent(e.target.value)}
              type="textarea"
              multiline
              fullWidth
              placeholder="메모를 입력하세요"
            />
          </Stack>
          <CardActions sx={{ justifyContent: "flex-end" }}>
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
                  highlightContent: selection.text,
                });
                setContent("");
                onClose();
              }}
            >
              작성
            </Button>
            <Button color="secondary" onClick={onClose}>
              취소
            </Button>
          </CardActions>
        </Card>
      </Box>
    </Modal>
  );
}
