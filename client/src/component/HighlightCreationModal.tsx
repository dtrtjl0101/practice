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
  Menu,
  MenuItem,
} from "@mui/material";
import { useEffect, useState } from "react";
import ActivitySelectModal from "./ActivitySelectModal";
import { Public, PublicOff } from "@mui/icons-material";

type Selection = {
  text: string;
  epubcfi: string;
};

export default function HighlightCreationModal({
  open,
  onClose,
  selection,
  currentActivityId,
  addHighlight,
  bookId,
}: {
  open: boolean;
  onClose: () => void;
  selection: Selection | null;
  currentActivityId?: number;
  addHighlight: (props: {
    memo: string;
    cfi: string;
    highlightContent: string;
    activityId?: number;
  }) => void;
  bookId: number;
}) {
  const [content, setContent] = useState("");
  const [targetActivity, setTargetActivity] = useState<TargetActivity>({
    type: "private",
  });
  const [activitySelectModalOpen, setActivitySelectModalOpen] = useState(false);
  const [targetActivityMenuAnchorElement, setTargetActivityMenuAnchorElement] =
    useState<null | HTMLElement>(null);

  useEffect(() => {
    if (currentActivityId) {
      setTargetActivity({
        type: "current",
        activityId: currentActivityId,
      });
      return;
    }
    setTargetActivity({
      type: "private",
    });
  }, [currentActivityId]);

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
        <ActivitySelectModal
          open={activitySelectModalOpen}
          onClose={() => setActivitySelectModalOpen(false)}
          onSelect={(activity) => {
            setTargetActivity({
              type: "other",
              activityId: activity.id,
              activityName: activity.name,
            });
            setActivitySelectModalOpen(false);
            setTargetActivityMenuAnchorElement(null);
          }}
          bookId={bookId}
        />
        <Card variant="outlined" sx={{ p: 2 }}>
          <Stack spacing={2}>
            <Typography variant="h6">하이라이트 만들기</Typography>
            <Typography color="textSecondary" variant="body1">
              {selection.text}
            </Typography>
            <Divider />
            <Menu
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "center",
              }}
              open={!!targetActivityMenuAnchorElement}
              anchorEl={targetActivityMenuAnchorElement}
              onClose={() => setTargetActivityMenuAnchorElement(null)}
            >
              <MenuItem
                onClick={() => {
                  setTargetActivity({
                    type: "private",
                  });
                  setTargetActivityMenuAnchorElement(null);
                }}
              >
                비공개
              </MenuItem>
              <MenuItem
                disabled={!currentActivityId}
                onClick={() => {
                  setTargetActivity({
                    type: "current",
                    activityId: currentActivityId!,
                  });
                  setTargetActivityMenuAnchorElement(null);
                }}
              >
                현재 활동에 공개
              </MenuItem>
              <MenuItem onClick={() => setActivitySelectModalOpen(true)}>
                다른 활동에 공개
              </MenuItem>
            </Menu>
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
              startIcon={
                targetActivity.type === "private" ? <PublicOff /> : <Public />
              }
              onClick={(e) =>
                setTargetActivityMenuAnchorElement(e.currentTarget)
              }
            >
              {getTargetActivityName(targetActivity)}
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
                  highlightContent: selection.text,
                  activityId:
                    targetActivity.type === "current"
                      ? targetActivity.activityId
                      : targetActivity.type === "other"
                        ? targetActivity.activityId
                        : undefined,
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

type TargetActivity =
  | {
      type: "private";
    }
  | {
      type: "current";
      activityId: number;
    }
  | {
      type: "other";
      activityId: number;
      activityName: string;
    };

function getTargetActivityName(targetActivity: TargetActivity): string {
  switch (targetActivity.type) {
    case "private":
      return "비공개";
    case "current":
      return "현재 활동에 공개";
    case "other":
      return targetActivity.activityName;
    default:
      return "";
  }
}
