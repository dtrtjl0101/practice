import {
  Modal,
  Box,
  Card,
  CardHeader,
  CardContent,
  Typography,
  Divider,
  Input,
  CardActions,
  Button,
} from "@mui/material";
import { useState } from "react";

type Selection = {
  left: number;
  top: number;
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
