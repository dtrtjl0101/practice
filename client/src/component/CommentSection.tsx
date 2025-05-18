import {
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  Divider,
  Chip,
  OutlinedInput,
  Paper,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel,
} from "@mui/material";
import { useState } from "react";
import { Comment } from "../types/comment";

type CommentSectionProps = {
  comments: Comment[];
  onAddComment: (
    content: string,
    stance?: "agree" | "disagree",
    parentId?: number
  ) => void;
  onDeleteComment: (id: number) => void;
  onEditComment: (id: number, newContent: string) => void;
  isDebate: boolean;
};

export default function CommentSection({
  comments,
  onAddComment,
  onDeleteComment,
  onEditComment,
  isDebate,
}: CommentSectionProps) {
  const [input, setInput] = useState("");
  const [stance, setStance] = useState<"agree" | "disagree">("agree");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editedContent, setEditedContent] = useState("");
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [replyInput, setReplyInput] = useState<{ [key: number]: string }>({});
  const [replyStance, setReplyStance] = useState<{
    [key: number]: "agree" | "disagree";
  }>({});

  // 댓글 작성
  const handleSubmit = () => {
    if (input.trim() === "") return;
    if (isDebate) {
      onAddComment(input.trim(), stance);
    } else {
      onAddComment(input.trim());
    }
    setInput("");
  };

  // 답글 작성
  const handleReplySubmit = (parentId: number) => {
    const content = replyInput[parentId];
    if (!content || content.trim() === "") return;
    if (isDebate) {
      onAddComment(content.trim(), replyStance[parentId] || "agree", parentId);
    } else {
      onAddComment(content.trim(), undefined, parentId);
    }
    setReplyInput((prev) => ({ ...prev, [parentId]: "" }));
    setReplyTo(null);
  };

  // 댓글 수정
  const handleEdit = (comment: Comment) => {
    setEditingId(comment.commentId);
    setEditedContent(comment.content);
  };
  const handleCancel = () => {
    setEditingId(null);
    setEditedContent("");
  };
  const handleSave = () => {
    if (editingId !== null && editedContent.trim()) {
      onEditComment(editingId, editedContent.trim());
      setEditingId(null);
      setEditedContent("");
    }
  };

  // 시간순 정렬 + 계층적 정렬
  const rootComments = comments
    .filter((c) => !c.parentId)
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

  const childComments = (parentId: number) =>
    comments
      .filter((c) => c.parentId === parentId)
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

  return (
    <Box sx={{ mt: 5 }}>
      <Divider sx={{ mb: 2 }} />
      <Typography variant="h6" gutterBottom>
        {isDebate ? "토론 댓글" : "댓글"}
      </Typography>

      {/* 댓글 작성 */}
      <Stack spacing={2} sx={{ mb: 2 }}>
        {isDebate && (
          <FormControl component="fieldset">
            <FormLabel component="legend">의견 선택</FormLabel>
            <RadioGroup
              row
              value={stance}
              onChange={(e) =>
                setStance(e.target.value as "agree" | "disagree")
              }
            >
              <FormControlLabel
                value="agree"
                control={<Radio />}
                label="찬성"
              />
              <FormControlLabel
                value="disagree"
                control={<Radio />}
                label="반대"
              />
            </RadioGroup>
          </FormControl>
        )}
        <Stack direction="row" spacing={2}>
          <TextField
            fullWidth
            multiline
            minRows={2}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={"댓글을 입력하세요"}
          />
          <Button variant="contained" onClick={handleSubmit}>
            작성
          </Button>
        </Stack>
      </Stack>

      {/* 댓글 목록 */}
      <Stack spacing={2}>
        {rootComments.length === 0 ? (
          <Typography color="text.secondary">아직 댓글이 없습니다.</Typography>
        ) : (
          rootComments.map((comment) => (
            <Box key={comment.commentId}>
              <CommentItem
                comment={comment}
                editingId={editingId}
                editedContent={editedContent}
                setEditedContent={setEditedContent}
                onEdit={handleEdit}
                onSave={handleSave}
                onCancel={handleCancel}
                onDelete={onDeleteComment}
                setEditingId={setEditingId}
                replyTo={replyTo}
                setReplyTo={setReplyTo}
                replyInput={replyInput}
                setReplyInput={setReplyInput}
                replyStance={replyStance}
                setReplyStance={setReplyStance}
                handleReplySubmit={handleReplySubmit}
                isDebate={isDebate}
              />
              {/* 답글 목록 */}
              <Stack spacing={1} sx={{ pl: 4 }}>
                {childComments(comment.commentId).map((reply) => (
                  <CommentItem
                    key={reply.commentId}
                    comment={reply}
                    editingId={editingId}
                    editedContent={editedContent}
                    setEditedContent={setEditedContent}
                    onEdit={handleEdit}
                    onSave={handleSave}
                    onCancel={handleCancel}
                    onDelete={onDeleteComment}
                    setEditingId={setEditingId}
                    replyTo={replyTo}
                    setReplyTo={setReplyTo}
                    replyInput={replyInput}
                    setReplyInput={setReplyInput}
                    replyStance={replyStance}
                    setReplyStance={setReplyStance}
                    handleReplySubmit={handleReplySubmit}
                    isDebate={isDebate}
                    isReply
                  />
                ))}
              </Stack>
            </Box>
          ))
        )}
      </Stack>
    </Box>
  );
}

// 댓글 아이템 컴포넌트
type CommentItemProps = {
  comment: Comment;
  editingId: number | null;
  editedContent: string;
  setEditedContent: (c: string) => void;
  onEdit: (comment: Comment) => void;
  onSave: () => void;
  onCancel: () => void;
  onDelete: (id: number) => void;
  setEditingId: (id: number | null) => void;
  replyTo: number | null;
  setReplyTo: (id: number | null) => void;
  replyInput: { [key: number]: string };
  setReplyInput: React.Dispatch<
    React.SetStateAction<{ [key: number]: string }>
  >;
  replyStance: { [key: number]: "agree" | "disagree" };
  setReplyStance: React.Dispatch<
    React.SetStateAction<{ [key: number]: "agree" | "disagree" }>
  >;
  handleReplySubmit: (parentId: number) => void;
  isDebate: boolean;
  isReply?: boolean;
};

function CommentItem({
  comment,
  editingId,
  editedContent,
  setEditedContent,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  replyTo,
  setReplyTo,
  replyInput,
  setReplyInput,
  replyStance,
  setReplyStance,
  handleReplySubmit,
  isDebate,
  isReply = false,
}: CommentItemProps) {
  const isEditing = editingId === comment.commentId;
  const isReplying = replyTo === comment.commentId;

  return (
    <Paper
      sx={{
        p: 2,
        mt: isReply ? 1 : 0,
      }}
      elevation={0}
    >
      <Stack direction="row" alignItems="center" spacing={1}>
        {comment.stance && (
          <Chip
            label={comment.stance === "agree" ? "찬성" : "반대"}
            color={comment.stance === "agree" ? "primary" : "error"}
            size="small"
          />
        )}
        <Typography variant="subtitle2">{comment.authorName}</Typography>
        <Typography variant="caption" color="text.disabled">
          {new Date(
            comment.isEdited && comment.modifiedAt
              ? comment.modifiedAt
              : comment.createdAt
          ).toLocaleString()}
          {comment.isEdited ? " (수정됨)" : ""}
        </Typography>
        <Box sx={{ flex: 1 }} />
        {isEditing ? (
          <>
            <Button onClick={onSave}>저장</Button>
            <Button onClick={onCancel}>취소</Button>
          </>
        ) : (
          <>
            <Button onClick={() => onEdit(comment)}>수정</Button>
            <Button color="error" onClick={() => onDelete(comment.commentId)}>
              삭제
            </Button>
            {!isReply && (
              <Button
                onClick={() =>
                  setReplyTo(
                    replyTo === comment.commentId ? null : comment.commentId
                  )
                }
              >
                답글
              </Button>
            )}
          </>
        )}
      </Stack>
      {isEditing ? (
        <OutlinedInput
          fullWidth
          multiline
          value={editedContent}
          onChange={(e) => setEditedContent(e.target.value)}
          sx={{ mt: 1, mb: 1 }}
        />
      ) : (
        <Typography
          variant="body2"
          sx={{ whiteSpace: "pre-line", mt: 1 }}
          color="text.secondary"
        >
          {comment.content}
        </Typography>
      )}

      {/* 답글 입력창 */}
      {isReplying && (
        <Stack spacing={1} sx={{ mt: 2 }}>
          {isDebate && (
            <RadioGroup
              row
              value={replyStance[comment.commentId] || "agree"}
              onChange={(e) =>
                setReplyStance((prev) => ({
                  ...prev,
                  [comment.commentId]: e.target.value as "agree" | "disagree",
                }))
              }
            >
              <FormControlLabel
                value="agree"
                control={<Radio />}
                label="찬성"
              />
              <FormControlLabel
                value="disagree"
                control={<Radio />}
                label="반대"
              />
            </RadioGroup>
          )}
          <Stack direction="row" spacing={1}>
            <TextField
              fullWidth
              multiline
              minRows={2}
              value={replyInput[comment.commentId] || ""}
              onChange={(e) =>
                setReplyInput((prev) => ({
                  ...prev,
                  [comment.commentId]: e.target.value,
                }))
              }
              placeholder="답글을 입력하세요"
            />
            <Button
              variant="contained"
              onClick={() => handleReplySubmit(comment.commentId)}
            >
              작성
            </Button>
            <Button onClick={() => setReplyTo(null)}>취소</Button>
          </Stack>
        </Stack>
      )}
    </Paper>
  );
}
