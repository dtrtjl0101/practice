import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Avatar,
  IconButton,
  Typography,
  Alert,
  CircularProgress,
  Stack,
} from "@mui/material";
import { CameraAlt, Close, Edit } from "@mui/icons-material";
import { useState, useRef, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import API_CLIENT from "../api/api";

interface UserProfileEditModalProps {
  open: boolean;
  onClose: () => void;
  userData:
    | {
        nickname: string;
        email: string;
        profileImageURL?: string;
        role: string;
      }
    | undefined;
  userId: number;
}

export default function UserProfileEditModal({
  open,
  onClose,
  userData,
  userId,
}: UserProfileEditModalProps) {
  const [nickname, setNickname] = useState(userData?.nickname || "");
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(
    userData?.profileImageURL || null,
  );
  console.log("userData", userData);

  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  // 프로필 업데이트 mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: { nickname?: string; profileImage?: File }) => {
      const response = await API_CLIENT.userController.updateUserInfo({
        nickname: data.nickname,
        profileImage: data.profileImage,
      });

      if (!response.isSuccessful) {
        throw new Error(response.error || "프로필 업데이트에 실패했습니다.");
      }

      return response.data;
    },
    onSuccess: () => {
      // 사용자 프로필 쿼리 무효화하여 최신 데이터 다시 가져오기
      queryClient.invalidateQueries({ queryKey: ["userProfile", userId] });
      setError(null);
      onClose();
    },
    onError: (error: Error) => {
      setError(error.message);
    },
  });

  // 모달이 열릴 때마다 초기값 설정
  useEffect(() => {
    if (open) {
      setNickname(userData?.nickname || "");
      setProfileImageFile(null);
      setProfileImagePreview(userData?.profileImageURL || null);
      setError(null);
    }
  }, [open, userData]);

  const handleProfileImageChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      // 파일 크기 체크 (5MB 제한)
      if (file.size > 5 * 1024 * 1024) {
        setError("파일 크기는 5MB 이하로 업로드해주세요.");
        return;
      }

      // 파일 타입 체크
      if (!file.type.startsWith("image/")) {
        setError("이미지 파일만 업로드 가능합니다.");
        return;
      }

      setProfileImageFile(file);

      // 미리보기 생성
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  const handleSubmit = () => {
    if (!nickname.trim()) {
      setError("닉네임을 입력해주세요.");
      return;
    }

    updateProfileMutation.mutate({
      nickname: nickname.trim(),
      profileImage: profileImageFile || undefined,
    });
  };

  const handleClose = () => {
    if (updateProfileMutation.isPending) return;
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6" component="div">
            프로필 수정
          </Typography>
          <IconButton
            onClick={handleClose}
            size="small"
            disabled={updateProfileMutation.isPending}
          >
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3} sx={{ pt: 1 }}>
          {/* 프로필 이미지 섹션 */}
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            gap={2}
          >
            <Typography variant="subtitle2" color="text.secondary">
              프로필 이미지
            </Typography>
            <Box position="relative">
              <Avatar
                src={profileImagePreview || undefined}
                sx={{
                  width: 100,
                  height: 100,
                  border: "3px solid",
                  borderColor: "divider",
                }}
              >
                {nickname.charAt(0)}
              </Avatar>
              <IconButton
                size="small"
                sx={{
                  position: "absolute",
                  bottom: -4,
                  right: -4,
                  bgcolor: "primary.main",
                  color: "white",
                  "&:hover": { bgcolor: "primary.dark" },
                  width: 32,
                  height: 32,
                }}
                onClick={() => fileInputRef.current?.click()}
                disabled={updateProfileMutation.isPending}
              >
                <CameraAlt fontSize="small" />
              </IconButton>
            </Box>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleProfileImageChange}
              style={{ display: "none" }}
            />
            <Typography
              variant="caption"
              color="text.secondary"
              textAlign="center"
            >
              클릭하여 이미지를 변경하세요
              <br />
              (최대 5MB, JPG/PNG 형식)
            </Typography>
          </Box>

          {/* 닉네임 수정 섹션 */}
          <Box>
            <Typography variant="subtitle2" color="text.secondary" mb={1}>
              닉네임
            </Typography>
            <TextField
              fullWidth
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="닉네임을 입력하세요"
              disabled={updateProfileMutation.isPending}
              InputProps={{
                endAdornment: <Edit color="action" fontSize="small" />,
              }}
              helperText="2-20자 사이로 입력해주세요"
            />
          </Box>

          {/* 이메일 (읽기 전용) */}
          <Box>
            <Typography variant="subtitle2" color="text.secondary" mb={1}>
              이메일
            </Typography>
            <TextField
              fullWidth
              value={userData?.email || ""}
              disabled
              helperText="이메일은 변경할 수 없습니다"
            />
          </Box>

          {/* 에러 메시지 */}
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button
          onClick={handleClose}
          disabled={updateProfileMutation.isPending}
        >
          취소
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={updateProfileMutation.isPending}
          startIcon={
            updateProfileMutation.isPending ? (
              <CircularProgress size={16} />
            ) : null
          }
        >
          {updateProfileMutation.isPending ? "저장 중..." : "저장"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
