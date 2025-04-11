import { Add, Delete } from "@mui/icons-material";
import {
  Button,
  Chip,
  Grid2,
  IconButton,
  InputAdornment,
  OutlinedInput,
  Paper,
  Stack,
  TextField,
} from "@mui/material";
import { useState } from "react";

export type GroupEditData = {
  name: string;
  description: string;
  tags: string[];
};

export default function GroupEditForm(props: {
  onEditDone: (data: GroupEditData) => void;
}) {
  const { onEditDone } = props;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [tag, setTag] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  const handleEditDoneButtonClicked = () => {
    onEditDone({
      name,
      description,
      tags,
    });
  };

  const handleTagAddButtonClicked = () => {
    const trimmedTag = tag.trim();
    if (trimmedTag === "") {
      return;
    }
    if (tags.includes(trimmedTag)) {
      return;
    }
    setTags((prev) => [...prev, trimmedTag]);
    setTag("");
  };

  const handleTagDeleteButtonClicked = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  };

  return (
    <Paper sx={{ width: "100%", height: "100%", padding: 2 }}>
      <Stack spacing={2} sx={{ height: "100%", overflowY: "auto" }}>
        <TextField
          variant="outlined"
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <TextField
          variant="outlined"
          multiline
          fullWidth
          minRows={5}
          maxRows={10}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <OutlinedInput
          placeholder="태그를 입력하세요"
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleTagAddButtonClicked();
            }
          }}
          endAdornment={
            <InputAdornment position="end">
              <IconButton onClick={handleTagAddButtonClicked}>
                <Add />
              </IconButton>
            </InputAdornment>
          }
        />
        <Grid2
          container
          direction={"row"}
          spacing={1}
          sx={{ flexGrow: 1, alignContent: "flex-start", flexWrap: "wrap" }}
        >
          {tags.map((tag) => {
            return (
              <Chip
                label={tag}
                onDelete={() => handleTagDeleteButtonClicked(tag)}
                deleteIcon={<Delete />}
              />
            );
          })}
        </Grid2>
        <Stack direction="row" spacing={2} sx={{ justifyContent: "flex-end" }}>
          <Button color="secondary">취소</Button>
          <Button variant="contained" onClick={handleEditDoneButtonClicked}>
            완료
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}
