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
import GroupEditForm from "../groupCreate/GroupEditForm";
import {
  Group as GroupIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
export default function GroupSettingsCard({ groupId }: { groupId: number }) {
  const [isEditing, setIsEditing] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // 폼 상태 관리
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    groupImageURL: "",
    tags: [] as string[],
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

  // 그룹 데이터가 로드되면 폼 데이터 초기화
  useEffect(() => {
    if (groupData) {
      setFormData({
        name: groupData.name || "",
        description: groupData.description || "",
        groupImageURL: groupData.groupImageURL || "",
        tags: groupData.tags || [],
      });
    }
  }, [groupData]);

  const handleSave = async () => {
    try {
      // updateGroup API는 description과 groupImageURL만 포함
      const updateData = {
        description: formData.description,
        groupImageURL: formData.groupImageURL,
      };

      const response = await API_CLIENT.groupController.updateGroup(
        groupId,
        updateData
      );
      if (!response.isSuccessful) {
        throw new Error(response.errorMessage);
      }
      setIsEditing(false);
      refetch();
      alert("그룹 정보가 성공적으로 수정되었습니다.");
    } catch (error) {
      alert("그룹 정보 수정에 실패했습니다.");
    }
  };

  const handleCancel = () => {
    // 원래 데이터로 되돌리기
    if (groupData) {
      setFormData({
        name: groupData.name || "",
        description: groupData.description || "",
        groupImageURL: groupData.groupImageURL || "",
        tags: groupData.tags || [],
      });
    }
    setPreviewImage(null);
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
    });
  };

  return (
    <Stack spacing={3}>
      {/* 그룹 정보 수정 카드 */}
      <Card>
        <CardHeader
          title="그룹 정보 수정"
          action={
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => setIsEditing(true)}
              disabled={isEditing} // 이미 편집 중이면 버튼 비활성화
            >
              수정
            </Button>
          }
        />
        <Modal
          open={isEditing}
          onClose={handleCancel}
          sx={{
            width: "100vw",
            height: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Container sx={{ height: "60vh", width: "120vh" }}>
            <GroupEditForm
              groupEditData={formData}
              onEditDone={handleSave}
              onCancel={handleCancel}
            />
          </Container>
        </Modal>
        <CardContent>
          <Stack spacing={4}>
            {/* 그룹 이미지 */}
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                그룹 이미지
              </Typography>
              <Stack direction="row" spacing={3} alignItems="center">
                <Avatar
                  src={previewImage || formData.groupImageURL}
                  sx={{ width: 80, height: 80 }}
                >
                  <GroupIcon sx={{ fontSize: 40 }} />
                </Avatar>
              </Stack>
            </Box>

            {/* 그룹명 */}
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                그룹명
              </Typography>
              <Typography
                variant="body2"
                fontStyle="italic"
                color="text.secondary"
                gutterBottom
              >
                *현재 수정 불가
              </Typography>

              <Typography variant="body1">{groupData?.name || "-"}</Typography>
            </Box>

            {/* 그룹 설명 */}
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                그룹 설명
              </Typography>

              <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
                {groupData?.description || "설명이 없습니다."}
              </Typography>
            </Box>

            {/* 태그 */}
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                태그
              </Typography>
              <Typography
                variant="body2"
                fontStyle="italic"
                color="text.secondary"
                gutterBottom
              >
                *현재 수정 불가
              </Typography>
              <Stack spacing={2}>
                {/* 현재 태그들 */}
                <Box>
                  {formData.tags.length > 0 ? (
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {formData.tags.map((tag, index) => (
                        <Chip
                          key={index}
                          label={tag}
                          variant="outlined"
                          size="small"
                        />
                      ))}
                    </Stack>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      등록된 태그가 없습니다.
                    </Typography>
                  )}
                </Box>
              </Stack>
            </Box>

            {/* 그룹 ID (읽기 전용) */}
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                그룹 ID
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {groupData?.groupId}
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* 기타 설정들 */}
      <Card>
        <CardHeader title="그룹 설정" />
        <CardContent>
          <Stack spacing={3}>
            <Alert severity="info">아래 기능들은 개발 중입니다.</Alert>

            <Stack spacing={2}>
              <Typography variant="h6">개발 예정 기능</Typography>
              <Box component="ul" sx={{ pl: 2 }}>
                <Typography
                  component="li"
                  variant="body2"
                  color="text.secondary"
                >
                  공개/비공개 설정
                </Typography>
                <Typography
                  component="li"
                  variant="body2"
                  color="text.secondary"
                >
                  가입 승인 방식 설정 (자동/수동)
                </Typography>
                <Typography
                  component="li"
                  variant="body2"
                  color="text.secondary"
                >
                  멤버 권한 관리
                </Typography>
                <Typography
                  component="li"
                  variant="body2"
                  color="text.secondary"
                >
                  그룹 카테고리 설정
                </Typography>
                <Typography
                  component="li"
                  variant="body2"
                  color="text.secondary"
                >
                  알림 설정
                </Typography>
              </Box>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* 위험한 작업들 */}
      <Card>
        <CardHeader
          title="위험 구역"
          titleTypographyProps={{ color: "error.main" }}
        />
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
