import { Add, Delete } from "@mui/icons-material";
import {
  Button,
  CardActionArea,
  CardMedia,
  Chip,
  Grid,
  Icon,
  IconButton,
  InputAdornment,
  OutlinedInput,
  Paper,
  Stack,
  TextField,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";

export type GroupEditData = {
  name: string;
  description: string;
  tags: string[];
  groupImage?: File;
};

export default function GroupEditForm(props: {
  groupEditData?: GroupEditData;
  onEditDone: (data: GroupEditData) => void;
  onCancel: () => void;
}) {
  const { onEditDone, onCancel } = props;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [tag, setTag] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [groupImage, setGroupImage] = useState<File | undefined>(undefined);

  const handleEditDoneButtonClicked = () => {
    onEditDone({
      name,
      description,
      tags,
      groupImage,
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

  const groupImagePreviewUrl = useMemo(() => {
    if (!groupImage) {
      return "";
    }
    return URL.createObjectURL(groupImage);
  }, [groupImage]);

  useEffect(() => {
    if (props.groupEditData) {
      const { name, description, tags, groupImage } = props.groupEditData;
      setName(name);
      setDescription(description);
      setTags(tags);
      setGroupImage(groupImage);
    }
  }, [props.groupEditData]);

  return (
    <Paper sx={{ width: "100%", height: "100%", padding: 2 }}>
      <Stack spacing={2} sx={{ height: "100%", overflowY: "auto", padding: 2 }}>
        <CardActionArea
          onClick={() => {
            const fileInput = document.createElement("input");
            fileInput.type = "file";
            fileInput.accept = "image/*";
            fileInput.onchange = (e) => {
              const file = (e.target as HTMLInputElement).files?.[0];
              if (file) {
                setGroupImage(file);
              }
            };
            fileInput.click();
          }}
          sx={{
            display: "flex",
            textAlign: "center",
            justifyContent: "center",
          }}
        >
          {groupImage ? (
            <CardMedia
              image={groupImagePreviewUrl}
              sx={{
                width: 256,
                height: 256,
              }}
            />
          ) : (
            <Icon sx={{ width: 256, height: 256, lineHeight: "256px" }}>
              <Add fontSize="large" />
            </Icon>
          )}
        </CardActionArea>
        <TextField
          placeholder="모임 이름"
          variant="outlined"
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <TextField
          placeholder="모임 설명"
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
        <Grid
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
        </Grid>
        <Stack direction="row" spacing={2} sx={{ justifyContent: "flex-end" }}>
          <Button color="secondary" onClick={onCancel}>
            취소
          </Button>
          <Button variant="contained" onClick={handleEditDoneButtonClicked}>
            완료
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}
