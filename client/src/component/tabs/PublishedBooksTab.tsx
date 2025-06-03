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
  Avatar,
  IconButton,
} from "@mui/material";
import { Visibility, Edit } from "@mui/icons-material";

interface PublishedBooksTabProps {
  books: any[];
  publisherInfo: any;
  onBookClick?: (book: any) => void;
}

export const PublishedBooksTab: React.FC<PublishedBooksTabProps> = ({
  books,
  publisherInfo,
  onBookClick,
}) => {
  return (
    <>
      <Box mb={2}>
        <Alert severity="success">
          현재 {books?.length}권의 도서가 출간되었습니다.
        </Alert>
      </Box>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>도서</TableCell>
              <TableCell>출판사</TableCell>
              <TableCell align="right">가격</TableCell>
              <TableCell align="right">파일 크기</TableCell>
              <TableCell align="center">관리</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {books?.length && books?.length > 0 ? (
              books?.map((book) => (
                <TableRow
                  key={book.id}
                  onClick={() => onBookClick?.(book)}
                  sx={{ cursor: "pointer" }}
                  hover
                >
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar
                        src={book.bookCoverImageURL}
                        variant="rounded"
                        sx={{ width: 40, height: 50 }}
                      >
                        {book.title![0]}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={600}>
                          {book.title}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {book.author}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {publisherInfo.publisherName}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight={600}>
                      ₩{book.price?.toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2">
                      {(book.size! / 1024 / 1024).toFixed(1)} MB
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <IconButton size="small" color="primary">
                      <Visibility />
                    </IconButton>
                    <IconButton size="small" color="primary">
                      <Edit />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography variant="body2" color="textSecondary">
                    출간된 도서가 없습니다.
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
