import { Container, Modal } from "@mui/material";
import GroupEditForm, { GroupEditData } from "./GroupEditForm";
import API_CLIENT from "../../api/api";
import { useNavigate } from "@tanstack/react-router";
import { useSnackbar } from "notistack";

export default function GroupCreateModal(props: {
  open: boolean;
  onClose: () => void;
  onCreateGroup?: () => void;
}) {
  const { open, onClose, onCreateGroup } = props;
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const handleEditDone = async (data: GroupEditData) => {
    const { name, description, tags, groupImage } = data;
    const response = await API_CLIENT.groupController.createGroup({
      name,
      description,
      tags,
      groupImage,
    });

    if (!response.isSuccessful) {
      console.error(response.errorMessage);
      enqueueSnackbar("Failed to create group", { variant: "error" });
      return;
    }

    navigate({
      to: "/groups/$groupId",
      params: { groupId: response.data.groupId! },
    });

    if (onCreateGroup) {
      onCreateGroup();
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
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
    </Modal>
  );
}
