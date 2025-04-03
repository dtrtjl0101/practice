import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  InputLabel,
  TextField,
} from "@mui/material";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import useUploadBook from "../../../api/admin/useUploadBook";

export const Route = createFileRoute("/_pathlessLayout/admin/uploadBook")({
  component: RouteComponent,
});

function RouteComponent() {
  const { uploadBook } = useUploadBook();

  // States for form fields
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");

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
      const response = await uploadBook({ title, file, description, author });
      if (response?.isSuccessful) {
        setTitle("");
        setAuthor("");
        setDescription("");
      }
    };
    inputElement.click();
  };

  return (
    <Card>
      <CardHeader title="Upload Book" />
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
          onChange={(e) => setDescription(e.target.value)}
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
