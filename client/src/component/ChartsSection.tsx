import React from "react";
import { Grid, Paper, Box, Typography } from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

interface ChartsSectionProps {
  publisherStats: any;
  publishedBooks: any[];
  pendingBooks: any[];
  rejectedBooks: any[];
}

export const ChartsSection: React.FC<ChartsSectionProps> = ({
  publisherStats,
  publishedBooks,
  pendingBooks,
  rejectedBooks,
}) => {
  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      <Grid size={{ xs: 12, lg: 8 }}>
        <Paper sx={{ p: 3 }} variant="outlined">
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography variant="h6">월별 매출</Typography>
          </Box>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={publisherStats.monthlyRevenueList}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="monthlyRevenue"
                stroke="#8884d8"
                name="수입"
              />
            </LineChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>

      <Grid size={{ xs: 12, lg: 4 }}>
        <Paper sx={{ p: 3 }} variant="outlined">
          <Typography variant="h6" gutterBottom>
            도서 상태 분포
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={[
                  {
                    name: "출간",
                    value: publishedBooks?.length,
                    color: "#00C49F",
                  },
                  {
                    name: "심사중",
                    value: pendingBooks.length,
                    color: "#FFBB28",
                  },
                  {
                    name: "거부됨",
                    value: rejectedBooks.length,
                    color: "#FF8042",
                  },
                ]}
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
                {[publishedBooks, pendingBooks, rejectedBooks].map(
                  (_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={["#00C49F", "#FFBB28", "#FF8042"][index]}
                    />
                  )
                )}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>
    </Grid>
  );
};
