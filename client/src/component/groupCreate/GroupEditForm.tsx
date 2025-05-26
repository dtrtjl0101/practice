import { Add, Delete } from "@mui/icons-material";
import {
  Button,
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
  Box,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";

export type GroupEditData = {
  name: string;
  description: string;
  tags: string[];
  groupImage?: File;
  groupImageURL?: string; // 기존 이미지 URL 추가
  imageAction?: "keep" | "update" | "remove"; // 이미지 액션 구분
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
  const [currentImageURL, setCurrentImageURL] = useState<string>("");
  const [imageAction, setImageAction] = useState<"keep" | "update" | "remove">(
    "keep"
  );

  const handleEditDoneButtonClicked = () => {
    const editData: GroupEditData = {
      name,
      description,
      tags,
      imageAction,
    };

    // 이미지 액션에 따라 데이터 설정
    if (imageAction === "update" && groupImage) {
      editData.groupImage = groupImage;
    } else if (imageAction === "keep" && currentImageURL) {
      editData.groupImageURL = currentImageURL;
    }

    onEditDone(editData);
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

  const handleImageUpload = () => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setGroupImage(file);
        setImageAction("update");
      }
    };
    fileInput.click();
  };

  const handleImageRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setGroupImage(undefined);
    setImageAction("remove");
  };

  // 표시할 이미지 URL 결정
  const displayImageUrl = useMemo(() => {
    if (imageAction === "update" && groupImage) {
      return URL.createObjectURL(groupImage);
    }
    if (imageAction === "keep" && currentImageURL) {
      return currentImageURL;
    }
    return null;
  }, [groupImage, currentImageURL, imageAction]);

  useEffect(() => {
    if (props.groupEditData) {
      const { name, description, tags, groupImage, groupImageURL } =
        props.groupEditData;
      setName(name);
      setDescription(description);
      setTags(tags);
      setGroupImage(groupImage);
      setCurrentImageURL(groupImageURL || "");
      setImageAction("keep");
    }
  }, [props.groupEditData]);

  return (
    <Paper sx={{ width: "100%", height: "100%", padding: 2 }}>
      <Stack spacing={2} sx={{ height: "100%", overflowY: "auto", padding: 2 }}>
        {/* 이미지 업로드 영역 - CardActionArea 제거하고 Box로 변경 */}
        <Box
          onClick={handleImageUpload}
          sx={{
            display: "flex",
            textAlign: "center",
            justifyContent: "center",
            position: "relative",
            cursor: "pointer",
            borderRadius: 2,
            padding: 2,
            "&:hover": {
              borderColor: "#999",
              backgroundColor: "rgba(0,0,0,0.02)",
            },
          }}
        >
          {displayImageUrl ? (
            <>
              <CardMedia
                image={displayImageUrl}
                sx={{
                  width: 256,
                  height: 256,
                  borderRadius: 1,
                }}
              />
              <IconButton
                onClick={handleImageRemove}
                sx={{
                  position: "absolute",
                  top: 16,
                  right: 16,
                  backgroundColor: "rgba(0,0,0,0.5)",
                  color: "white",
                  "&:hover": {
                    backgroundColor: "rgba(0,0,0,0.7)",
                  },
                }}
                size="small"
              >
                <Delete />
              </IconButton>
            </>
          ) : (
            <Box
              sx={{
                width: 256,
                height: 256,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ccc",
              }}
            >
              <Add sx={{ fontSize: 64 }} />
            </Box>
          )}
        </Box>

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
          {tags.map((tag, index) => {
            return (
              <Chip
                key={index}
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
