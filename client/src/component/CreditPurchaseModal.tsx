import { Box, Container, Modal, Paper, Stack, Typography } from "@mui/material";

export default function CreditPurchaseModal(props: {
  open: boolean;
  onClose: () => void;
  onPurchased?: () => void;
}) {
  const { open, onClose } = props;

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      >
        <Container maxWidth="md">
          <Paper sx={{ width: "100%", height: "100%", padding: 4 }}>
            <Stack spacing={2}>
              <Typography variant="h6" fontWeight="bold">
                TODO: 크레딧 충전
              </Typography>
            </Stack>
          </Paper>
        </Container>
      </Box>
    </Modal>
  );
}
