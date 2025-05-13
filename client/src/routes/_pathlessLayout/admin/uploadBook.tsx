import {
  Button,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  CardHeader,
  CardMedia,
  Icon,
  InputLabel,
  TextField,
} from "@mui/material";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import API_CLIENT from "../../../api/api";
import { Add } from "@mui/icons-material";

const MAX_DESCRIPTION_LENGTH = 255;

export const Route = createFileRoute("/_pathlessLayout/admin/uploadBook")({
  component: RouteComponent,
});

function RouteComponent() {
  // States for form fields
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);

  const handleUploadBookButtonClicked = async () => {
    const inputElement = document.createElement("input");
    inputElement.type = "file";
    inputElement.accept = ".epub";
    inputElement.onchange = async (event) => {
      const target = event.target as HTMLInputElement;
      const file = target.files?.[0];
      if (!file) {
        alert("Please select a file to upload.");
        return;
      }
      const response = await API_CLIENT.ebookController.uploadFile({
        title,
        file,
        description,
        author,
        coverImageFile: coverImageFile ?? undefined,
      });
      if (response.isSuccessful) {
        setTitle("");
        setAuthor("");
        setDescription("");
        setCoverImageFile(null);
      }
    };
    inputElement.click();
  };

  const coverImageFilePreviewUrl = useMemo(() => {
    if (!coverImageFile) return "";
    return URL.createObjectURL(coverImageFile);
  }, [coverImageFile]);

  return (
    <Card>
      <CardHeader title="Upload Book" />
      <CardActionArea
        onClick={() => {
          const fileInput = document.createElement("input");
          fileInput.type = "file";
          fileInput.accept = "image/*";
          fileInput.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
              setCoverImageFile(file);
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
        {coverImageFile ? (
          <CardMedia
            image={coverImageFilePreviewUrl}
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
      <CardContent>
        <InputLabel>Title</InputLabel>
        <TextField
          fullWidth
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </CardContent>
      <CardContent>
        <InputLabel>Author</InputLabel>
        <TextField
          fullWidth
          placeholder="Author"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
        />
      </CardContent>
      <CardContent>
        <InputLabel>Description</InputLabel>
        <TextField
          fullWidth
          placeholder="Description"
          multiline
          value={description}
          inputProps={{ maxLength: MAX_DESCRIPTION_LENGTH }}
          onChange={(e) => {
            const value = e.target.value;
            if (value.length >= MAX_DESCRIPTION_LENGTH) {
              setDescription(value.slice(0, MAX_DESCRIPTION_LENGTH));
              return;
            }
            setDescription(value);
          }}
          helperText={`${description.length} / ${MAX_DESCRIPTION_LENGTH}`}
        />
      </CardContent>
      <CardActions>
        <Button
          variant="contained"
          sx={{ ml: "auto" }}
          onClick={handleUploadBookButtonClicked}
        >
          Upload
        </Button>
      </CardActions>
    </Card>
  );
}
