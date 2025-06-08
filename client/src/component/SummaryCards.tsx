import React from "react";
import {
  Grid,
  Card,
  CardContent,
  Box,
  Typography,
  Avatar,
} from "@mui/material";
import {
  ShoppingCart,
  Analytics,
  Visibility,
  PendingActions,
} from "@mui/icons-material";
import { getTrendText, getRevenueTrendText } from "../utils/bookUtils";

interface SummaryCardsProps {
  publisherStats: any;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  publisherStats,
}) => {
  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Card variant="outlined">
          <CardContent>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
            >
              <Box>
                <Typography
                  color="textSecondary"
                  gutterBottom
                  variant="overline"
                >
                  총 판매량
                </Typography>
                <Typography variant="h4">
                  {(publisherStats?.totalSalesCount ?? 0).toLocaleString()}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: getTrendText(publisherStats?.increasedSalesCount)
                      .color,
                  }}
                >
                  {getTrendText(publisherStats?.increasedSalesCount).text}
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: "primary.main" }}>
                <ShoppingCart />
              </Avatar>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Card variant="outlined">
          <CardContent>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
            >
              <Box>
                <Typography
                  color="textSecondary"
                  gutterBottom
                  variant="overline"
                >
                  총 매출
                </Typography>
                <Typography variant="h4" color="success.main">
                  ₩{(publisherStats?.totalRevenue ?? 0).toLocaleString()}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: getRevenueTrendText(publisherStats?.increasedRevenue)
                      .color,
                  }}
                >
                  {getRevenueTrendText(publisherStats?.increasedRevenue).text}
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: "success.main" }}>
                <Analytics />
              </Avatar>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Card variant="outlined">
          <CardContent>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
            >
              <Box>
                <Typography
                  color="textSecondary"
                  gutterBottom
                  variant="overline"
                >
                  총 조회수
                </Typography>
                <Typography variant="h4" color="info.main">
                  {(publisherStats?.totalViewCount ?? 0).toLocaleString()}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  누적 도서 조회수
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: "info.main" }}>
                <Visibility />
              </Avatar>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Card variant="outlined">
          <CardContent>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
            >
              <Box>
                <Typography
                  color="textSecondary"
                  gutterBottom
                  variant="overline"
                >
                  활동 선정
                </Typography>
                <Typography variant="h4" color="warning.main">
                  {(publisherStats?.totalActivityCount ?? 0).toLocaleString()}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: getTrendText(publisherStats?.increasedActivityCount)
                      .color,
                  }}
                >
                  {getTrendText(publisherStats?.increasedActivityCount).text}
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: "warning.main" }}>
                <PendingActions />
              </Avatar>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};
