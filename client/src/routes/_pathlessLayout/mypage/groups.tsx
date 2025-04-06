import { Card, CardContent, CardHeader, Typography } from "@mui/material";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_pathlessLayout/mypage/groups")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <Card>
      <CardHeader title="Groups" />
      <CardContent>
        <Typography>This is the groups page.</Typography>
      </CardContent>
    </Card>
  );
}
