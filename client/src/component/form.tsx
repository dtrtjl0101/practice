import { useState } from "react";
import { useParams, useRouterState, useRouter } from "@tanstack/react-router";
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

export default function Form() {
  const router = useRouter();
  const state = useRouterState();
  const pathname = state.location.pathname;
  let postID: string | undefined;
  if (pathname.includes("/posts/") && pathname.includes("/edit")) {
    const params = useParams({ from: "/_pathlessLayout/posts/$postID/edit" });
    postID = params.postID;
  }
  const isEdit = !!postID;

  const [age, setAge] = useState("");
  const handleChange = (event: SelectChangeEvent) => {
    setAge(event.target.value);
  };

  const handleBack = () => {
    router.history.back();
  };

  const theme = useTheme();
  return (
    <div>
      <Container maxWidth="lg" sx={{ mt: theme.spacing(4) }}>
        <Card>
          <CardHeader title={isEdit ? "게시글 수정" : "게시글 작성"} />
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
        <Button>{isEdit ? "수정" : "작성"}</Button>
        <Button onClick={handleBack}>취소</Button>
      </Container>
    </div>
  );
}
