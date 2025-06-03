import React from "react";
import {
  Alert,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  IconButton,
} from "@mui/material";
import { Visibility } from "@mui/icons-material";

interface PendingBooksTabProps {
  books: any[];
  onBookClick?: (book: any) => void;
}

export const PendingBooksTab: React.FC<PendingBooksTabProps> = ({
  books,
  onBookClick,
}) => {
  return (
    <>
      <Box mb={2}>
        <Alert severity="warning">
          현재 {books.length}권의 도서가 승인 대기 중입니다.
        </Alert>
      </Box>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>제목</TableCell>
              <TableCell>저자</TableCell>
              <TableCell>출판사</TableCell>
              <TableCell align="right">가격</TableCell>
              <TableCell>상태</TableCell>
              <TableCell align="center">관리</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {books.length > 0 ? (
              books.map((book) => (
                <TableRow
                  key={book.requestId}
                  onClick={() => onBookClick?.(book)}
                  sx={{ cursor: "pointer" }}
                  hover
                >
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight={600}>
                      {book.title}
                    </Typography>
                  </TableCell>
                  <TableCell>{book.author}</TableCell>
                  <TableCell>{book.publisherName}</TableCell>
                  <TableCell align="right">
                    ₩{book.price.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Chip label="심사중" color="warning" size="small" />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton size="small" color="primary">
                      <Visibility />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography variant="body2" color="textSecondary">
                    승인 대기 중인 도서가 없습니다.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};
