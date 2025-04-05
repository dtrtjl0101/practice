import { Card, CardContent, CardHeader, Typography } from "@mui/material";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_pathlessLayout/admin/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <Card>
      <CardHeader title="Dashboard" />
      <CardContent>
        <Typography>admin</Typography>
      </CardContent>
    </Card>
  );
}
