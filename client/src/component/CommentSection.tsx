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
  Avatar,
} from "@mui/material";
import { useSnackbar } from "notistack";
import { useMemo, useState, Fragment } from "react";
import { Comment, StanceOptions } from "../types/comment";
import API_CLIENT from "../api/api";
import { useAtomValue } from "jotai";
import { AuthState } from "../states/auth";

interface CommentSectionProps {
  discussionId: number;
  comments: Comment[];
  isDebate: boolean;
  onRefresh: () => void;
}

export default function CommentSection({
  discussionId,
  comments,
  isDebate,
  onRefresh,
}: CommentSectionProps) {
  const { enqueueSnackbar } = useSnackbar();
  const [content, setContent] = useState("");
  const [replyContent, setReplyContent] = useState<Record<number, string>>({});
  const [stance, setStance] = useState<StanceOptions>("AGREE");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editedContent, setEditedContent] = useState("");
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [replyStance, setReplyStance] = useState<Record<number, StanceOptions>>(
    {}
  );

  const sortedComments = useMemo(() => {
    return [...comments]
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      )
      .map((comment) => ({
        ...comment,
        replies:
          comment.replies?.sort(
            (a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          ) || [],
      }));
  }, [comments]);

  const handleAddComment = async (parentId?: number) => {
    const isReply = !!parentId;
    const currentContent = isReply ? replyContent[parentId!] : content;
    const currentStance = isReply ? replyStance[parentId!] : stance;

    if (!currentContent?.trim()) {
      enqueueSnackbar(
        isReply ? "답글을 입력해주세요." : "댓글을 입력해주세요",
        { variant: "warning" }
      );
      return;
    }

    if (isDebate && !currentStance) {
      enqueueSnackbar("의견을 선택해주세요.", { variant: "warning" });
      return;
    }

    try {
      const response = await API_CLIENT.discussionController.addComment(
        discussionId,
        {
          parentId,
          content: currentContent,
          stance: isDebate ? currentStance : "AGREE",
        }
      );

      if (response.isSuccessful) {
        if (isReply) {
          setReplyContent((prev) => ({ ...prev, [parentId!]: "" }));
          setReplyTo(null);
        } else {
          setContent("");
        }
        onRefresh();
      } else {
        enqueueSnackbar(response.errorMessage, { variant: "error" });
      }
    } catch (error) {
      enqueueSnackbar("댓글 작성 중 오류가 발생했습니다.", {
        variant: "error",
      });
    }
  };

  const handleEditComment = async (commentId: number) => {
    if (!editedContent.trim()) {
      enqueueSnackbar("수정할 내용을 입력해주세요.", { variant: "warning" });
      return;
    }

    try {
      const response = await API_CLIENT.discussionController.updateComment1(
        commentId,
        {
          content: editedContent,
        }
      );

      if (response.isSuccessful) {
        enqueueSnackbar("댓글이 수정되었습니다.", { variant: "success" });
        setEditingId(null);
        setEditedContent("");
        onRefresh();
      } else {
        enqueueSnackbar(response.errorMessage, { variant: "error" });
      }
    } catch (error) {
      enqueueSnackbar("댓글 수정 중 오류가 발생했습니다.", {
        variant: "error",
      });
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (window.confirm("댓글을 삭제하시겠습니까?")) {
      try {
        const response =
          await API_CLIENT.discussionController.deleteComment1(commentId);

        if (response.isSuccessful) {
          enqueueSnackbar("댓글이 삭제되었습니다.", { variant: "success" });
          onRefresh();
        } else {
          enqueueSnackbar(response.errorMessage, { variant: "error" });
        }
      } catch (error) {
        enqueueSnackbar("댓글 삭제 중 오류가 발생했습니다.", {
          variant: "error",
        });
      }
    }
  };

  const handleEditStart = (comment: Comment) => {
    setEditingId(comment.commentId);
    setEditedContent(comment.content);
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditedContent("");
  };

  const handleEditSave = () => {
    if (editingId !== null && editedContent.trim()) {
      handleEditComment(editingId);
    }
  };

  const handleReplyToggle = (commentId: number) => {
    setReplyTo(replyTo === commentId ? null : commentId);
  };

  return (
    <Box sx={{ mt: 5 }}>
      <Divider sx={{ mb: 3 }} />

      {/* 댓글 섹션 헤더 */}
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        {isDebate ? "토론 댓글" : "댓글"}
        {sortedComments.length > 0 && (
          <Typography
            component="span"
            variant="body2"
            color="text.secondary"
            sx={{ ml: 1 }}
          >
            ({sortedComments.length})
          </Typography>
        )}
      </Typography>

      {/* 댓글 작성 영역 */}
      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Stack spacing={2}>
          {isDebate && (
            <StanceSelector stance={stance} onStanceChange={setStance} />
          )}

          <Stack direction="row" spacing={2} alignItems="flex-start">
            <TextField
              fullWidth
              multiline
              minRows={3}
              maxRows={8}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="댓글을 입력하세요"
              variant="outlined"
            />
            <Button
              variant="contained"
              onClick={() => handleAddComment()}
              disabled={!content.trim()}
              sx={{ minWidth: 80, alignSelf: "flex-start" }}
            >
              작성
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {/* 댓글 목록 */}
      <Stack spacing={2}>
        {sortedComments.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography color="text.secondary">
              아직 댓글이 없습니다.
            </Typography>
          </Box>
        ) : (
          sortedComments.map((comment) => (
            <Fragment key={comment.commentId}>
              <CommentItem
                comment={comment}
                editingId={editingId}
                editedContent={editedContent}
                onEditedContentChange={setEditedContent}
                onEditStart={handleEditStart}
                onEditSave={handleEditSave}
                onEditCancel={handleEditCancel}
                onDelete={handleDeleteComment}
                replyTo={replyTo}
                onReplyToggle={handleReplyToggle}
                replyContent={replyContent}
                onReplyContentChange={setReplyContent}
                replyStance={replyStance}
                onReplyStanceChange={setReplyStance}
                onReplySubmit={handleAddComment}
                isDebate={isDebate}
              />

              {/* 답글 목록 */}
              {comment.replies && comment.replies.length > 0 && (
                <Stack
                  spacing={1}
                  sx={{ pl: 6, borderLeft: 2, borderColor: "grey.100" }}
                >
                  {comment.replies.map((reply) => (
                    <CommentItem
                      key={reply.commentId}
                      comment={reply}
                      editingId={editingId}
                      editedContent={editedContent}
                      onEditedContentChange={setEditedContent}
                      onEditStart={handleEditStart}
                      onEditSave={handleEditSave}
                      onEditCancel={handleEditCancel}
                      onDelete={handleDeleteComment}
                      replyTo={replyTo}
                      onReplyToggle={handleReplyToggle}
                      replyContent={replyContent}
                      onReplyContentChange={setReplyContent}
                      replyStance={replyStance}
                      onReplyStanceChange={setReplyStance}
                      onReplySubmit={handleAddComment}
                      isDebate={isDebate}
                      isReply
                    />
                  ))}
                </Stack>
              )}
            </Fragment>
          ))
        )}
      </Stack>

      <Divider sx={{ mt: 4 }} />
    </Box>
  );
}

interface CommentItemProps {
  comment: Comment;
  editingId: number | null;
  editedContent: string;
  onEditedContentChange: (content: string) => void;
  onEditStart: (comment: Comment) => void;
  onEditSave: () => void;
  onEditCancel: () => void;
  onDelete: (id: number) => void;
  replyTo: number | null;
  onReplyToggle: (id: number) => void;
  replyContent: Record<number, string>;
  onReplyContentChange: React.Dispatch<
    React.SetStateAction<Record<number, string>>
  >;
  replyStance: Record<number, StanceOptions>;
  onReplyStanceChange: React.Dispatch<
    React.SetStateAction<Record<number, StanceOptions>>
  >;
  onReplySubmit: (parentId: number) => void;
  isDebate: boolean;
  isReply?: boolean;
}

function CommentItem({
  comment,
  editingId,
  editedContent,
  onEditedContentChange,
  onEditStart,
  onEditSave,
  onEditCancel,
  onDelete,
  replyTo,
  onReplyToggle,
  replyContent,
  onReplyContentChange,
  replyStance,
  onReplyStanceChange,
  onReplySubmit,
  isDebate,
  isReply = false,
}: CommentItemProps) {
  const isEditing = editingId === comment.commentId;
  const isReplying = replyTo === comment.commentId;
  const user = useAtomValue(AuthState.user);

  const getStanceColor = (stance: StanceOptions) => {
    switch (stance) {
      case "AGREE":
        return "primary";
      case "DISAGREE":
        return "error";
      default:
        return "default";
    }
  };

  const getStanceLabel = (stance: StanceOptions) => {
    switch (stance) {
      case "AGREE":
        return "찬성";
      case "DISAGREE":
        return "반대";
      default:
        return "중립";
    }
  };

  return (
    <Paper variant="outlined" sx={{ p: 3 }}>
      {/* 댓글 헤더 */}
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", sm: "center" },
            width: "100%",
            gap: 2,
            mt: 1,
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar
              src={comment.authorProfileImageURL}
              alt={comment.authorName}
              sx={{ width: 32, height: 32 }}
            />
            <Stack spacing={0.5}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Typography variant="subtitle2" fontWeight="medium">
                  {comment.authorName}
                </Typography>
                {isDebate && (
                  <Chip
                    label={getStanceLabel(comment.stance!)}
                    color={getStanceColor(comment.stance!)}
                    size="small"
                    variant="outlined"
                  />
                )}
              </Stack>
              <Typography variant="caption" color="text.secondary">
                {new Date(
                  comment.isEdited && comment.modifiedAt
                    ? comment.modifiedAt
                    : comment.createdAt
                ).toLocaleString()}
                {comment.isEdited && " (수정됨)"}
              </Typography>
            </Stack>
          </Stack>
        </Box>
        {/* 액션 버튼들 */}
        <Stack direction="row" spacing={1}>
          {isEditing ? (
            <>
              <Button
                size="small"
                onClick={onEditSave}
                disabled={!editedContent.trim()}
              >
                저장
              </Button>
              <Button size="small" onClick={onEditCancel}>
                취소
              </Button>
            </>
          ) : (
            <>
              {user?.memberId === comment.authorId && (
                <>
                  <Button size="small" onClick={() => onEditStart(comment)}>
                    수정
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    onClick={() => onDelete(comment.commentId)}
                  >
                    삭제
                  </Button>
                </>
              )}
              {!isReply && (
                <Button
                  size="small"
                  onClick={() => onReplyToggle(comment.commentId)}
                >
                  답글
                </Button>
              )}
            </>
          )}
        </Stack>
      </Stack>

      {/* 댓글 내용 */}
      {isEditing ? (
        <OutlinedInput
          fullWidth
          multiline
          minRows={3}
          value={editedContent}
          onChange={(e) => onEditedContentChange(e.target.value)}
          sx={{ mb: 1 }}
        />
      ) : (
        <Typography
          variant="body2"
          sx={{
            whiteSpace: "pre-line",
            color: "text.primary",
            lineHeight: 1.6,
            marginLeft: 6,
          }}
        >
          {comment.content}
        </Typography>
      )}

      {/* 답글 작성 영역 */}
      {isReplying && (
        <Box sx={{ mt: 3, pt: 3, borderTop: 1, borderColor: "grey.200" }}>
          <Stack spacing={2}>
            {isDebate && (
              <StanceSelector
                stance={replyStance[comment.commentId] || "AGREE"}
                onStanceChange={(value) =>
                  onReplyStanceChange((prev) => ({
                    ...prev,
                    [comment.commentId]: value,
                  }))
                }
              />
            )}

            <Stack direction="row" spacing={2} alignItems="flex-start">
              <TextField
                fullWidth
                multiline
                minRows={2}
                maxRows={6}
                value={replyContent[comment.commentId] || ""}
                onChange={(e) =>
                  onReplyContentChange((prev) => ({
                    ...prev,
                    [comment.commentId]: e.target.value,
                  }))
                }
                placeholder="답글을 입력하세요"
                variant="outlined"
                size="small"
              />

              <Stack spacing={1}>
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => onReplySubmit(comment.commentId)}
                  disabled={!replyContent[comment.commentId]?.trim()}
                  sx={{ minWidth: 60 }}
                >
                  작성
                </Button>
                <Button
                  size="small"
                  onClick={() => onReplyToggle(comment.commentId)}
                  sx={{ minWidth: 60 }}
                >
                  취소
                </Button>
              </Stack>
            </Stack>
          </Stack>
        </Box>
      )}
    </Paper>
  );
}

interface StanceSelectorProps {
  stance: StanceOptions;
  onStanceChange: (stance: StanceOptions) => void;
}

function StanceSelector({ stance, onStanceChange }: StanceSelectorProps) {
  return (
    <FormControl component="fieldset">
      <FormLabel
        component="legend"
        sx={{ fontSize: "0.875rem", fontWeight: "medium" }}
      >
        의견 선택
      </FormLabel>
      <RadioGroup
        row
        value={stance}
        onChange={(e) => onStanceChange(e.target.value as StanceOptions)}
        sx={{ mt: 1 }}
      >
        <FormControlLabel
          value="AGREE"
          control={<Radio size="small" />}
          label="찬성"
          sx={{ mr: 3 }}
        />
        <FormControlLabel
          value="DISAGREE"
          control={<Radio size="small" />}
          label="반대"
          sx={{ mr: 3 }}
        />
        <FormControlLabel
          value="NEUTRAL"
          control={<Radio size="small" />}
          label="중립"
        />
      </RadioGroup>
    </FormControl>
  );
}
