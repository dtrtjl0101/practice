import { Box, Container, Modal } from "@mui/material";
import GroupEditForm, { GroupEditData } from "./GroupEditForm";
import API_CLIENT, { wrapApiResponse } from "../../api/api";
import { useNavigate } from "@tanstack/react-router";

export default function GroupCreateModal(props: {
  open: boolean;
  onClose: () => void;
  onCreateGroup?: () => void;
}) {
  const { open, onClose, onCreateGroup } = props;
  const navigate = useNavigate();

  const handleEditDone = async (data: GroupEditData) => {
    const { name, description, tags } = data;
    const response = await wrapApiResponse(
      API_CLIENT.groupController.createGroup({
        name,
        description,
        tags,
      })
    );

    if (!response.isSuccessful) {
      console.error(response.errorMessage);
      alert("Failed to create group");
      return;
    }

    navigate({
      to: "/groups/$groupId",
      params: { groupId: response.data.group!.groupId!.toString() },
    });

    if (onCreateGroup) {
      onCreateGroup();
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          width: "100vw",
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Container sx={{ height: "65vh" }}>
          <GroupEditForm onEditDone={handleEditDone} onCancel={onClose} />
        </Container>
      </Box>
    </Modal>
  );
}
