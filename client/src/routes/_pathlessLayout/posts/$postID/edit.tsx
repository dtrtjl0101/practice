import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Container,
  Card,
  CardContent,
  OutlinedInput,
  Divider,
  Button,
  useTheme,
  CardHeader,
  FormControl,
  MenuItem,
  Select,
  SelectChangeEvent,
  InputLabel,
  Typography,
} from "@mui/material";

export const Route = createFileRoute("/_pathlessLayout/posts/$postID/edit")({
  component: Edit,
});

// onClick={() =>
//     setPosts((prev) => [
//       ...prev,
//       {
//         id: prev.length + 1,
//         title: `새 글 ${prev.length + 1}`,
//         content: "새로 추가된 게시글입니다.",
//       },
//     ])
//   }

function Edit() {
  const [age, setAge] = useState("");

  const handleChange = (event: SelectChangeEvent) => {
    setAge(event.target.value);
  };

  const theme = useTheme();
  return (
    <div>
      <Container maxWidth="lg" sx={{ mt: theme.spacing(4) }}>
        <Card>
          <CardHeader title="게시물 작성" />
          <CardContent
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: theme.spacing(2),
            }}
          />
          <OutlinedInput placeholder="제목" />
          <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
            <InputLabel id="demo-simple-select-standard-label">Age</InputLabel>
            <Select
              labelId="demo-simple-select-standard-label"
              id="demo-simple-select-standard"
              value={age}
              onChange={handleChange}
              label="Age"
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              <MenuItem value={10}>Ten</MenuItem>
              <MenuItem value={20}>Twenty</MenuItem>
              <MenuItem value={30}>Thirty</MenuItem>
            </Select>
          </FormControl>
          <OutlinedInput
            placeholder="내용을 입력하세요"
            fullWidth
            sx={{ minHeight: 300 }}
          />
        </Card>
        <Button>게시</Button>
        <Button>취소</Button>
      </Container>
    </div>
  );
}
