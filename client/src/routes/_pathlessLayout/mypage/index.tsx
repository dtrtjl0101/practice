import { Card, CardContent, CardHeader, Typography } from "@mui/material";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_pathlessLayout/mypage/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <Card>
      <CardHeader title="Mypage" />
      <CardContent>
        <Typography>This is the mypage page.</Typography>
      </CardContent>
    </Card>
  );
}
