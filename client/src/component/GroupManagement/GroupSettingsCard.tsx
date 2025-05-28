import {
  Stack,
  Card,
  CardHeader,
  Button,
  Modal,
  Container,
  CardContent,
  Box,
  Typography,
  Avatar,
  Chip,
  Alert,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import API_CLIENT from "../../api/api";
import GroupEditForm, { GroupEditData } from "../groupCreate/GroupEditForm";
import {
  Group as GroupIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
export default function GroupSettingsCard({
  groupId,
  onDeleteRoute,
}: {
  groupId: number;
  onDeleteRoute: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // 폼 상태 관리
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    tags: string[];
    groupImage?: File;
    groupImageURL?: string;
  }>({
    name: "",
    description: "",
    tags: [],
    groupImage: undefined,
    groupImageURL: "",
  });

  // 그룹 데이터 가져오기
  const { data: groupData, refetch } = useQuery({
    queryKey: ["getGroup", groupId],
    queryFn: async () => {
      const response = await API_CLIENT.groupController.getGroup(groupId);
      if (!response.isSuccessful) {
        throw new Error(response.errorMessage);
      }
      return response.data;
    },
  });

  // GroupSettingsCard.tsx - handleSave 함수 수정된 버전
  const handleSave = async (editedData: GroupEditData) => {
    try {
      // GroupPatchRequest 인터페이스에 맞춰 데이터 구성
      const updateData: {
        name?: string;
        tags?: string[];
        description?: string;
        groupImage?: File;
      } = {};

      // 변경된 필드만 포함
      if (editedData.name !== groupData?.name) {
        updateData.name = editedData.name;
      }
      if (JSON.stringify(editedData.tags) !== JSON.stringify(groupData?.tags)) {
        updateData.tags = editedData.tags;
      }
      if (editedData.description !== groupData?.description) {
        updateData.description = editedData.description;
      }

      // 이미지 처리: 새로운 파일이 업로드된 경우만 포함
      if (
        editedData.imageAction === "update" &&
        editedData.groupImage instanceof File
      ) {
        updateData.groupImage = editedData.groupImage;
      }

      const response = await API_CLIENT.groupController.updateGroup(
        groupId,
        updateData
      );

      if (!response.isSuccessful) {
        throw new Error(response.errorMessage);
      }

      setIsEditing(false);
      await refetch(); // refetch가 완료될 때까지 대기
      alert("그룹 정보가 성공적으로 수정되었습니다.");
    } catch (error) {
      console.error("그룹 수정 오류:", error);
      alert("그룹 정보 수정에 실패했습니다.");
    }
  };

  const handleCancel = () => {
    if (groupData) {
      setFormData({
        name: groupData.name || "",
        description: groupData.description || "",
        tags: groupData.tags || [],
        groupImage: undefined, // 새로 업로드된 파일은 초기화
        groupImageURL: groupData.groupImageURL || "", // 기존 이미지 URL은 유지
      });
      setPreviewImage(groupData.groupImageURL || null);
    }
    setIsEditing(false);
  };

  const handleDeleteGroup = () => {
    const confirmDelete = window.confirm(
      "정말로 이 그룹을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
    );
    if (!confirmDelete) return;

    API_CLIENT.groupController.deleteGroup(groupId).then((response) => {
      if (!response.isSuccessful) {
        throw new Error(response.errorMessage);
      }
      alert("그룹이 성공적으로 삭제되었습니다.");
      onDeleteRoute();
    });
  };

  // 그룹 데이터가 로드되면 폼 데이터 초기화
  useEffect(() => {
    if (groupData) {
      setFormData({
        name: groupData.name || "",
        description: groupData.description || "",
        tags: groupData.tags || [],
        groupImage: undefined, // 편집 전에는 업로드된 파일이 없으므로 undefined
        groupImageURL: groupData.groupImageURL || "",
      });
      setPreviewImage(groupData.groupImageURL || null); // 이미지 미리보기 URL 따로 저장
    }
  }, [groupData]);

  return (
    <Stack spacing={3}>
      {/* 그룹 정보 수정 카드 */}
      <Card variant="outlined" elevation={2}>
        <CardHeader
          title={
            <Typography variant="h6" fontWeight="600">
              그룹 정보 수정
            </Typography>
          }
          action={
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => setIsEditing(true)}
              disabled={isEditing}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 500,
              }}
            >
              수정
            </Button>
          }
          sx={{ pb: 1 }}
        />

        <Modal
          open={isEditing}
          onClose={handleCancel}
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            p: 2,
          }}
        >
          <Container
            maxWidth="md"
            sx={{
              height: "80vh",
              maxHeight: 600,
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            <GroupEditForm
              groupEditData={{
                name: formData.name,
                description: formData.description,
                tags: formData.tags,
                groupImage: formData.groupImage,
                groupImageURL: formData.groupImageURL,
              }}
              onEditDone={handleSave}
              onCancel={handleCancel}
            />
          </Container>
        </Modal>

        <CardContent sx={{ pt: 0 }}>
          <Stack spacing={3}>
            {/* 그룹 이미지 */}
            <Box>
              <Typography
                variant="subtitle1"
                fontWeight="600"
                color="text.primary"
                gutterBottom
              >
                그룹 이미지
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                <Avatar
                  src={previewImage || ""}
                  sx={{
                    width: 80,
                    height: 80,
                    border: "2px solid",
                    borderColor: "divider",
                  }}
                >
                  <GroupIcon sx={{ fontSize: 40, color: "text.secondary" }} />
                </Avatar>
              </Box>
            </Box>

            {/* 그룹명 */}
            <Box>
              <Typography
                variant="subtitle1"
                fontWeight="600"
                color="text.primary"
                gutterBottom
              >
                그룹명
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  mt: 1,
                  p: 1.5,
                  borderRadius: 1,
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                {groupData?.name || "-"}
              </Typography>
            </Box>

            {/* 그룹 설명 */}
            <Box>
              <Typography
                variant="subtitle1"
                fontWeight="600"
                color="text.primary"
                gutterBottom
              >
                그룹 설명
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  whiteSpace: "pre-wrap",
                  mt: 1,
                  p: 1.5,
                  borderRadius: 1,
                  border: "1px solid",
                  borderColor: "divider",
                  minHeight: 60,
                }}
              >
                {groupData?.description || "설명이 없습니다."}
              </Typography>
            </Box>

            {/* 태그 */}
            <Box>
              <Typography
                variant="subtitle1"
                fontWeight="600"
                color="text.primary"
                gutterBottom
              >
                태그
              </Typography>
              <Box sx={{ mt: 1 }}>
                {formData.tags.length > 0 ? (
                  <Stack
                    direction="row"
                    spacing={1}
                    flexWrap="wrap"
                    useFlexGap
                    sx={{ gap: 1 }}
                  >
                    {formData.tags.map((tag, index) => (
                      <Chip
                        key={index}
                        label={tag}
                        variant="outlined"
                        size="small"
                        sx={{
                          borderRadius: 2,
                          fontWeight: 500,
                        }}
                      />
                    ))}
                  </Stack>
                ) : (
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 1,
                      border: "1px dashed",
                      borderColor: "divider",
                      textAlign: "center",
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      등록된 태그가 없습니다.
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>

            {/* 그룹 ID (읽기 전용) */}
            <Box>
              <Typography
                variant="subtitle1"
                fontWeight="600"
                color="text.primary"
                gutterBottom
              >
                그룹 ID
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mt: 1,
                  p: 1.5,
                  borderRadius: 1,
                  fontFamily: "monospace",
                  fontSize: "0.875rem",
                }}
              >
                {groupData?.groupId}
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* 위험한 작업들 */}
      <Card>
        <CardHeader title="위험 구역" sx={{ color: "error.main" }} />
        <CardContent>
          <Stack spacing={2}>
            <Alert severity="warning">
              아래 작업들은 신중하게 수행해주세요. 되돌릴 수 없습니다.
            </Alert>

            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={handleDeleteGroup}
              >
                그룹 삭제
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}
