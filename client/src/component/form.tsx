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
  Checkbox,
  CardActionArea,
  Stack,
  FormControlLabel,
  Box,
} from "@mui/material";
import { initialPosts, PostManager, Post } from "../types/post";

type PostFormProps = {
  onAddPost: (
    id: number,
    title: string,
    content: string,
    author: string
  ) => void;
  post?: Post;
};

export default function Form({ onAddPost, post }: PostFormProps) {
  const router = useRouter();
  const state = useRouterState();
  const pathname = state.location.pathname;
  let postID: string | undefined;
  if (pathname.includes("/posts/") && pathname.includes("/edit")) {
    const params = useParams({ from: "/_pathlessLayout/posts/$postID/edit" });
    postID = params.postID;
  }
  const isEdit = !!postID;
  // const post = initialPosts.find((p) => p.id === Number(postID));

  const [book, setBook] = useState("");
  const handleBook = (event: SelectChangeEvent) => {
    setBook(event.target.value);
  };

  const handleBack = () => {
    router.history.back();
  };

  const handlePost = () => {
    onAddPost;
  };

  const [debate, setDebate] = useState({
    debate: false,
  });
  const handleCheckbox = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDebate({
      ...debate,
      [event.target.name]: event.target.checked,
    });
    if (event.target.checked) {
      alert("토론이 체크되었습니다.");
    }
  };

  const [title, setTitle] = useState(post?.title);
  const [content, setContent] = useState(post?.content);

  // const handlePost = () => {
  //   if (PostManager.editPostId === null) {
  //     alert("수정할 게시글을 선택해주세요.");
  //     return;
  //   }

  //   if (title?.trim() === "" || content?.trim() === "") {
  //     alert("제목과 내용을 입력해주세요.");
  //     return;
  //   }

  //   PostManager(editPostId, title, content);
  //   setTitle(""); // 입력 필드 초기화
  //   setContent("");
  //   setIsEdit(false); // 수정 모드 종료
  //   setEditPostId(null); // 수정 중인 게시글 ID 초기화
  //   alert("게시글이 수정되었습니다!");
  // };

  const theme = useTheme();
  return (
    <Container
      maxWidth="md"
      sx={{ mt: theme.spacing(4), justifyContent: "space-between" }}
    >
      <Card sx={{ padding: 3 }}>
        <CardHeader title={isEdit ? "게시글 수정" : "게시글 작성"} />
        <CardContent
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: theme.spacing(2),
          }}
        />
        {/*제목 title */}
        <OutlinedInput
          placeholder="제목을 입력하세요"
          value={title}
          fullWidth
          multiline
          onChange={(e) => setTitle(e.target.value)}
        />
        <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
          <InputLabel id="demo-simple-select-standard-label">
            대상 도서
          </InputLabel>
          <Select
            labelId="demo-simple-select-standard-label"
            id="demo-simple-select-standard"
            value={book}
            onChange={handleBook}
            label="대상 도서"
          >
            <MenuItem value={10}>책1</MenuItem>
            <MenuItem value={20}>책2</MenuItem>
            <MenuItem value={30}>책3</MenuItem>
          </Select>
        </FormControl>

        {/* 본문 content */}
        <OutlinedInput
          placeholder="내용을 입력하세요"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          fullWidth
          multiline
          sx={{ alignItems: "flex-start", minHeight: "300px" }}
        />
        <Stack direction="row" justifyContent="space-between" sx={{ m: 1 }}>
          <Box sx={{ justifySelf: "flex-start" }}>
            <Button onClick={handlePost}>{isEdit ? "수정" : "작성"}</Button>
            <Button onClick={handleBack}>취소</Button>
          </Box>
          <FormControlLabel
            sx={{ justifySelf: "flex-end" }}
            label="토론"
            control={<Checkbox onChange={handleCheckbox} />}
          />
        </Stack>
      </Card>
    </Container>
  );
}
