import API_CLIENT from "../api/api";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Container,
  Card,
  CardContent,
  OutlinedInput,
  Button,
  useTheme,
  CardHeader,
  FormControl,
  MenuItem,
  Select,
  SelectChangeEvent,
  InputLabel,
  Checkbox,
  Stack,
  FormControlLabel,
  Box,
} from "@mui/material";
import { Discussion } from "../types/discussion";

export default function DiscussionForm({
  activityId,
  discussionId,
  handleBack,
}: {
  activityId: number;
  discussionId?: number;
  handleBack: (discussionId?: number) => void;
}) {
  const theme = useTheme();
  const isEdit = !!discussionId;
  const { data: discussion } = useQuery({
    queryKey: ["discussion", discussionId],
    enabled: isEdit,
    queryFn: async () => {
      const response = await API_CLIENT.discussionController.getDiscussion(
        discussionId!!
      );
      if (!response.isSuccessful) {
        throw new Error(response.errorMessage);
      }
      return response.data as Discussion;
    },
  });

  const [book, setBook] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isDebate, setDebate] = useState(false);

  const handleBook = (event: SelectChangeEvent) => {
    setBook(event.target.value);
  };

  const handlePostDiscussion = () => {
    if (!title.trim() || !content.trim()) {
      alert("제목과 내용을 입력해주세요.");
      return;
    }

    if (isEdit) {
      // 수정 모드: 기존 게시글 수정
      API_CLIENT.discussionController
        .updateDiscussion(discussionId!!, {
          title,
          content,
        })
        .then((response) => {
          if (response.isSuccessful) {
            alert("게시글이 수정되었습니다.");
            handleBack();
          } else {
            alert(response.errorMessage);
          }
        });
    } else {
      // 작성 모드: 새 게시글 추가
      API_CLIENT.discussionController
        .createDiscussion(activityId, {
          title,
          content,
          isDebate,
        })
        .then((response) => {
          if (response.isSuccessful) {
            alert("게시글이 작성되었습니다.");
            handleBack(response.data.discussionId);
          } else {
            alert(response.errorMessage);
          }
        });
    }
  };

  const handleCheckbox = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDebate(event.target.checked);
    if (event.target.checked) {
      alert("토론이 체크되었습니다.");
    }
  };

  useEffect(() => {
    if (!discussion) return;
    setTitle(discussion.title ?? "");
    setContent(discussion.content ?? "");
    setDebate(discussion.isDebate);
  }, [discussion]);

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
            <Button onClick={handlePostDiscussion}>
              {isEdit ? "수정" : "작성"}
            </Button>
            <Button onClick={() => handleBack && handleBack(discussionId!)}>
              취소
            </Button>
          </Box>
          <FormControlLabel
            sx={{ justifySelf: "flex-end" }}
            label="토론"
            control={
              <Checkbox
                name="isDebate"
                checked={isDebate}
                onChange={handleCheckbox}
              />
            }
          />
        </Stack>
      </Card>
    </Container>
  );
}
