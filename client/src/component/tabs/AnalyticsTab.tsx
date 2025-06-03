import React from "react";
import {
  Grid,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Box,
} from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ResponsiveContainer,
} from "recharts";

interface AnalyticsTabProps {
  publisherStats: any;
}

export const AnalyticsTab: React.FC<AnalyticsTabProps> = ({
  publisherStats,
}) => {
  return (
    <Grid container spacing={3}>
      {/* 도서별 매출 비교 */}
      <Grid size={{ xs: 12, lg: 8 }}>
        <Paper sx={{ p: 3 }} variant="outlined">
          <Typography variant="h6" gutterBottom>
            도서별 매출 분석
          </Typography>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={publisherStats?.statsPerEbookList || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="title"
                angle={-45}
                textAnchor="end"
                height={80}
                interval={0}
              />
              <YAxis />
              <Tooltip
                formatter={(value, name) => [
                  name === "총 매출"
                    ? `₩${value.toLocaleString()}`
                    : value.toLocaleString(),
                  name,
                ]}
              />
              <Bar dataKey="totalRevenue" fill="#8884d8" name="총 매출" />
              <Bar dataKey="totalSalesCount" fill="#82ca9d" name="총 판매량" />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>

      {/* 도서별 활동 선정 현황 */}
      <Grid size={{ xs: 12, lg: 4 }}>
        <Paper sx={{ p: 3 }} variant="outlined">
          <Typography variant="h6" gutterBottom>
            활동 선정 현황
          </Typography>
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={(() => {
                  const sortedData = (
                    publisherStats?.statsPerEbookList || []
                  ).sort(
                    (a: { activityCount: any }, b: { activityCount: any }) =>
                      b.activityCount! - a.activityCount!
                  );
                  const top5 = sortedData.slice(0, 5);
                  const others = sortedData.slice(5);
                  const othersSum = others.reduce(
                    (sum: any, item: { activityCount: any }) =>
                      sum + item.activityCount!,
                    0
                  );

                  const result = top5.map(
                    (item: { title: any; activityCount: any }) => ({
                      name:
                        item.title!.length > 10
                          ? item.title!.substring(0, 10) + "..."
                          : item.title,
                      value: item.activityCount,
                      fullName: item.title,
                    })
                  );

                  if (othersSum > 0) {
                    result.push({
                      name: "기타",
                      value: othersSum,
                      fullName: `기타 ${others.length}권`,
                    });
                  }

                  return result;
                })()}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {(() => {
                  const colors = [
                    "#0088FE",
                    "#00C49F",
                    "#FFBB28",
                    "#FF8042",
                    "#8884D8",
                    "#82ca9d",
                  ];
                  const dataLength =
                    Math.min(
                      (publisherStats?.statsPerEbookList || []).length,
                      5
                    ) +
                    ((publisherStats?.statsPerEbookList || []).length > 5
                      ? 1
                      : 0);

                  return Array.from({ length: dataLength }, (_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={colors[index % colors.length]}
                    />
                  ));
                })()}
              </Pie>
              <Tooltip
                formatter={(value, name, props) => [
                  value.toLocaleString(),
                  props.payload?.fullName || name,
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>

      {/* 성과 요약 테이블 */}
      <Grid size={{ xs: 12 }}>
        <Paper sx={{ p: 3 }} variant="outlined">
          <Typography variant="h6" gutterBottom>
            도서별 성과 요약
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>도서명</TableCell>
                  <TableCell>저자</TableCell>
                  <TableCell align="right">총 매출</TableCell>
                  <TableCell align="right">판매량</TableCell>
                  <TableCell align="right">조회수</TableCell>
                  <TableCell align="right">활동 선정</TableCell>
                  <TableCell align="right">전환율</TableCell>
                  <TableCell align="right">평균 단가</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {publisherStats?.statsPerEbookList
                  ?.sort(
                    (a: { totalRevenue: any }, b: { totalRevenue: any }) =>
                      b.totalRevenue! - a.totalRevenue!
                  )
                  ?.map(
                    (book: {
                      viewCount: any;
                      totalSalesCount: any;
                      totalRevenue: any;
                      bookId: React.Key | null | undefined;
                      bookCoverImageURL: string | undefined;
                      title:
                        | string
                        | number
                        | bigint
                        | boolean
                        | React.ReactElement<
                            unknown,
                            string | React.JSXElementConstructor<any>
                          >
                        | Iterable<React.ReactNode>
                        | React.ReactPortal
                        | Promise<
                            | string
                            | number
                            | bigint
                            | boolean
                            | React.ReactPortal
                            | React.ReactElement<
                                unknown,
                                string | React.JSXElementConstructor<any>
                              >
                            | Iterable<React.ReactNode>
                            | null
                            | undefined
                          >
                        | null
                        | undefined;
                      author:
                        | string
                        | number
                        | bigint
                        | boolean
                        | React.ReactElement<
                            unknown,
                            string | React.JSXElementConstructor<any>
                          >
                        | Iterable<React.ReactNode>
                        | React.ReactPortal
                        | Promise<
                            | string
                            | number
                            | bigint
                            | boolean
                            | React.ReactPortal
                            | React.ReactElement<
                                unknown,
                                string | React.JSXElementConstructor<any>
                              >
                            | Iterable<React.ReactNode>
                            | null
                            | undefined
                          >
                        | null
                        | undefined;
                      activityCount: any;
                    }) => {
                      const conversionRate =
                        book.viewCount! > 0
                          ? (book.totalSalesCount! / book.viewCount!) * 100
                          : 0;
                      const avgPrice =
                        book.totalSalesCount! > 0
                          ? book.totalRevenue! / book.totalSalesCount!
                          : 0;

                      return (
                        <TableRow key={book.bookId} hover>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={1}>
                              <Avatar
                                src={book.bookCoverImageURL}
                                variant="rounded"
                                sx={{ width: 24, height: 32 }}
                              >
                                {book.title}
                              </Avatar>
                              <Typography variant="body2" fontWeight={500}>
                                {book.title}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>{book.author}</TableCell>
                          <TableCell
                            align="right"
                            sx={{ fontWeight: 600, color: "success.main" }}
                          >
                            ₩{book.totalRevenue!.toLocaleString()}
                          </TableCell>
                          <TableCell align="right">
                            {book.totalSalesCount!.toLocaleString()}
                          </TableCell>
                          <TableCell align="right">
                            {book.viewCount!.toLocaleString()}
                          </TableCell>
                          <TableCell align="right">
                            {book.activityCount!.toLocaleString()}
                          </TableCell>
                          <TableCell align="right">
                            <Typography
                              variant="body2"
                              color={
                                conversionRate > 5
                                  ? "success.main"
                                  : conversionRate > 1
                                    ? "warning.main"
                                    : "error.main"
                              }
                              fontWeight={500}
                            >
                              {conversionRate.toFixed(1)}%
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            ₩{avgPrice.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      );
                    }
                  )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Grid>
    </Grid>
  );
};
