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
import { Visibility, Edit } from "@mui/icons-material";

interface RejectedBooksTabProps {
  books: any[];
  onBookClick?: (book: any) => void;
  onResubmit?: (book: any) => void;
}

export const RejectedBooksTab: React.FC<RejectedBooksTabProps> = ({
  books,
  onBookClick,
  onResubmit,
}) => {
  return (
    <>
      <Box mb={2}>
        <Alert severity="error">
          현재 {books.length}권의 도서가 거부된 상태입니다.
        </Alert>
      </Box>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>제목</TableCell>
              <TableCell>저자</TableCell>
              <TableCell>거부 사유</TableCell>
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
                  <TableCell>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      sx={{
                        maxWidth: 200,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {book.rejectReason || "사유 없음"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label="거부됨" color="error" size="small" />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton size="small" color="primary">
                      <Visibility />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        onResubmit?.(book);
                      }}
                    >
                      <Edit />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography variant="body2" color="textSecondary">
                    거부된 도서가 없습니다.
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
