import { Button, Card, CardContent, CardHeader } from "@mui/material";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import HighlightBrowserModal from "../../../component/HighlightBrowserModal";

export const Route = createFileRoute("/_pathlessLayout/mypage/")({
  component: RouteComponent,
});

function RouteComponent() {
  const [openHighlightBrowserModal, setOpenHighlightBrowserModal] =
    useState(false);

  return (
    <>
      <HighlightBrowserModal
        open={openHighlightBrowserModal}
        onClose={() => setOpenHighlightBrowserModal(false)}
      />
      <Card>
        <CardHeader title="마이페이지" />
        <CardContent>
          <Button
            variant="contained"
            onClick={() => setOpenHighlightBrowserModal(true)}
          >
            하이라이트 관리
          </Button>
        </CardContent>
      </Card>
    </>
  );
}
