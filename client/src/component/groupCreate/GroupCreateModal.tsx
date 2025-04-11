import { Box, Container, Modal } from "@mui/material";
import GroupEditForm, { GroupEditData } from "./GroupEditForm";

export default function GroupCreateModal(props: {
  open: boolean;
  onClose: () => void;
  onCreateGroup?: () => void;
}) {
  const { open, onClose, onCreateGroup } = props;

  const handleEditDone = (data: GroupEditData) => {
    // TODO: create group with data
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
          <GroupEditForm onEditDone={handleEditDone} />
        </Container>
      </Box>
    </Modal>
  );
}
