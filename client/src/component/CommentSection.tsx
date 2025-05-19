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
import { useMemo, useState } from "react";
import { Comment, StanceOptions } from "../types/comment";
import API_CLIENT from "../api/api";

export default function CommentSection({
  discussionId,
  comments,
  isDebate,
  onRefresh,
}: {
  discussionId: number;
  comments: Comment[];
  isDebate: boolean;
  onRefresh: () => void;
}) {
  const [content, setContent] = useState("");
  const [replyContent, setReplyContent] = useState<{
    [parentId: number]: string;
  }>({});
  const [stance, setStance] = useState<StanceOptions>("AGREE");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editedContent, setEditedContent] = useState("");
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [replyStance, setReplyStance] = useState<{
    [parentId: number]: StanceOptions;
  }>({});

  const sortedComments = useMemo(() => {
    return [...comments]
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      )
      .map((comment) => {
        comment.replies = comment.replies?.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        return comment;
      });
  }, [comments]);

  const handleAddComment = (parentId?: number) => {
    const isReply = !!parentId;
    const currentContent = isReply ? replyContent[parentId!] : content;
    const currentStance = isReply ? replyStance[parentId!] : stance;

    if (!currentContent?.trim()) {
      alert(isReply ? "답글을 입력해주세요." : "댓글을 입력해주세요");
      return;
    }
    if (isDebate && !currentStance) {
      alert("의견을 선택해주세요.");
      return;
    }

    API_CLIENT.discussionController
      .addComment(discussionId, {
        parentId: parentId,
        content: currentContent,
        stance: isDebate ? currentStance : "AGREE",
      })
      .then((response) => {
        if (response.isSuccessful) {
          if (isReply) {
            setReplyContent((prev) => ({ ...prev, [parentId!]: "" }));
            setReplyTo(null);
          } else {
            setContent("");
          }
          onRefresh();
        } else {
          alert(response.errorMessage);
        }
      });
  };

  const handleEditComment = (commentId: number) => {
    API_CLIENT.discussionController
      .updateComment1(commentId, {
        content: editedContent,
      })
      .then((response) => {
        if (response.isSuccessful) {
          alert("댓글이 수정되었습니다.");
          onRefresh();
        } else {
          alert(response.errorMessage);
        }
      });
  };

  const handleDeleteComment = (commentId: number) => {
    const confirmDelete = window.confirm("댓글을 삭제하시겠습니까?");
    if (!confirmDelete) return;
    API_CLIENT.discussionController
      .deleteComment1(commentId)
      .then((response) => {
        if (response.isSuccessful) {
          alert("댓글이 삭제되었습니다.");
          onRefresh();
        } else {
          alert(response.errorMessage);
        }
      });
  };

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
      handleEditComment(editingId);
      setEditingId(null);
      setEditedContent("");
    }
  };

  return (
    <Box sx={{ mt: 5 }}>
      <Divider sx={{ mb: 2 }} />
      <Typography variant="h6" gutterBottom>
        {isDebate ? "토론 댓글" : "댓글"}
      </Typography>

      <Stack spacing={2} sx={{ mb: 2 }}>
        {isDebate && (
          <StanceSelector
            stance={stance}
            setStance={(value) => setStance(value)}
          />
        )}
        <Stack direction="row" spacing={2}>
          <TextField
            fullWidth
            multiline
            minRows={2}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={"댓글을 입력하세요"}
          />
          <Button variant="contained" onClick={() => handleAddComment()}>
            작성
          </Button>
        </Stack>
      </Stack>

      <Stack spacing={2}>
        {sortedComments.length === 0 ? (
          <Typography color="text.secondary">아직 댓글이 없습니다.</Typography>
        ) : (
          sortedComments.map((comment) => (
            <Box key={comment.commentId}>
              <CommentItem
                comment={comment}
                editingId={editingId}
                editedContent={editedContent}
                setEditedContent={setEditedContent}
                onEdit={handleEdit}
                onSave={handleSave}
                onCancel={handleCancel}
                onDelete={handleDeleteComment}
                setEditingId={setEditingId}
                replyTo={replyTo}
                setReplyTo={setReplyTo}
                replyInput={replyContent}
                setReplyInput={setReplyContent}
                replyStance={replyStance}
                setReplyStance={setReplyStance}
                handleReplySubmit={handleAddComment}
                isDebate={isDebate}
              />
              <Stack spacing={1} sx={{ pl: 4 }}>
                {comment.replies.map((reply) => (
                  <CommentItem
                    key={reply.commentId}
                    comment={reply}
                    editingId={editingId}
                    editedContent={editedContent}
                    setEditedContent={setEditedContent}
                    onEdit={handleEdit}
                    onSave={handleSave}
                    onCancel={handleCancel}
                    onDelete={handleDeleteComment}
                    setEditingId={setEditingId}
                    replyTo={replyTo}
                    setReplyTo={setReplyTo}
                    replyInput={replyContent}
                    setReplyInput={setReplyContent}
                    replyStance={replyStance}
                    setReplyStance={setReplyStance}
                    handleReplySubmit={handleAddComment}
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
  replyStance: { [key: number]: StanceOptions };
  setReplyStance: React.Dispatch<
    React.SetStateAction<{ [key: number]: StanceOptions }>
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
        {isDebate && (
          <Chip
            label={
              comment.stance === "AGREE"
                ? "찬성"
                : comment.stance === "DISAGREE"
                  ? "반대"
                  : "중립"
            }
            color={
              comment.stance === "AGREE"
                ? "primary"
                : comment.stance === "DISAGREE"
                  ? "error"
                  : "default"
            }
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
            <StanceSelector
              stance={replyStance[comment.commentId] || "AGREE"}
              setStance={(value) =>
                setReplyStance((prev) => ({
                  ...prev,
                  [comment.commentId]: value as StanceOptions,
                }))
              }
            />
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

function StanceSelector({
  stance,
  setStance,
}: {
  stance: StanceOptions;
  setStance: (stance: StanceOptions) => void;
}) {
  return (
    <FormControl component="fieldset">
      <FormLabel component="legend">의견 선택</FormLabel>
      <RadioGroup
        row
        value={stance}
        onChange={(e) => setStance(e.target.value as StanceOptions)}
      >
        <FormControlLabel value="AGREE" control={<Radio />} label="찬성" />
        <FormControlLabel value="DISAGREE" control={<Radio />} label="반대" />
        <FormControlLabel value="NEUTRAL" control={<Radio />} label="중립" />
      </RadioGroup>
    </FormControl>
  );
}
