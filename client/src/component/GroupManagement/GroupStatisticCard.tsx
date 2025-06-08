import {
  Alert,
  Card,
  CardContent,
  CardHeader,
  Stack,
  Typography,
} from "@mui/material";

export default function GroupStatisticsCard() {
  return (
    <Card variant="outlined">
      <CardHeader title="통계 및 분석" />
      <CardContent>
        <Stack spacing={3}>
          <Alert severity="info">통계 기능은 개발 중입니다.</Alert>
          <Typography variant="body2" color="text.secondary">
            • 멤버 활동 통계
            <br />
            • 가입 신청 추이
            <br />
            • 게시글/댓글 분석
            <br />
            • 참여도 분석
            <br />• 월별/주별 리포트 등등등...
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}
