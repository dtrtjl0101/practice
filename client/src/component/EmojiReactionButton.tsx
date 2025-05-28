import { EmojiEmotions } from "@mui/icons-material";
import { IconButton, Popover, Stack } from "@mui/material";
import { useState } from "react";
import {
  getEmojiFromReactionType,
  HighlightReactionType,
  highlightReactionTypes,
} from "../types/highlight";

export default function EmojiReactionButton({
  onReactionClicked,
}: {
  onReactionClicked: (type: HighlightReactionType) => Promise<void>;
}) {
  const [emojiAnchorEl, setEmojiAnchorEl] = useState<null | HTMLElement>(null);

  return (
    <>
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
          {highlightReactionTypes.map((type) => (
            <IconButton
              key={type}
              onClick={() => {
                onReactionClicked(type);
                setEmojiAnchorEl(null);
              }}
              size="medium"
            >
              {getEmojiFromReactionType(type)}
            </IconButton>
          ))}
        </Stack>
      </Popover>
    </>
  );
}
