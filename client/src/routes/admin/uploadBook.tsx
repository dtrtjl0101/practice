import {
  Button,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  CardHeader,
  CardMedia,
  Container,
  Icon,
  InputLabel,
  TextField,
} from "@mui/material";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import API_CLIENT from "../../api/api";
import { Add } from "@mui/icons-material";

const MAX_DESCRIPTION_LENGTH = 10000;

export const Route = createFileRoute("/admin/uploadBook")({
  component: RouteComponent,
});

function RouteComponent() {
  // States for form fields
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [price, setPrice] = useState<number>(0);

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
        price,
      });
      if (response.isSuccessful) {
        setTitle("");
        setAuthor("");
        setDescription("");
        setCoverImageFile(null);
        setPrice(0);
      }
    };
    inputElement.click();
  };

  const coverImageFilePreviewUrl = useMemo(() => {
    if (!coverImageFile) return "";
    return URL.createObjectURL(coverImageFile);
  }, [coverImageFile]);

  return (
    <Container sx={{ my: 8 }}>
      <Card sx={{ p: 2 }}>
        <CardHeader title="전자책 업로드" />
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
          <InputLabel>제목</InputLabel>
          <TextField
            fullWidth
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </CardContent>
        <CardContent>
          <InputLabel>저자</InputLabel>
          <TextField
            fullWidth
            placeholder="Author"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
          />
        </CardContent>
        <CardContent>
          <InputLabel>설명</InputLabel>
          <TextField
            fullWidth
            placeholder="Description"
            multiline
            value={description}
            slotProps={{
              htmlInput: { maxLength: MAX_DESCRIPTION_LENGTH },
            }}
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
        <CardContent>
          <InputLabel>가격</InputLabel>
          <TextField
            fullWidth
            placeholder="10000"
            value={price.toLocaleString()}
            onChange={(e) => {
              const value = e.target.value.replace(/,/g, "");
              const parsedValue = parseInt(value);
              if (isNaN(parsedValue)) {
                return;
              }
              if (parsedValue < 0) {
                setPrice(0);
                return;
              }
              setPrice(parsedValue);
            }}
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
    </Container>
  );
}
