import {
  Card,
  CardContent,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { createFileRoute } from "@tanstack/react-router";
import useGetBooks from "../../../api/admin/useGetBooks";
import { useEffect, useState } from "react";
import { BookMetadata } from "../../../types/book";

export const Route = createFileRoute("/_pathlessLayout/admin/books")({
  component: RouteComponent,
});

function RouteComponent() {
  const { getBooks } = useGetBooks();
  const [books, setBooks] = useState<BookMetadata[]>([]);

  useEffect(() => {
    getBooks().then((response) => {
      if (response.isSuccessful) {
        setBooks(response.data.books);
      } else {
        console.error(response.error);
      }
    });
  }, [getBooks, setBooks]);

  return (
    <Card>
      <CardHeader title="Books" />
      <CardContent>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Author</TableCell>
                <TableCell>Size</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {books.map((book) => {
                return (
                  <TableRow key={book.id}>
                    <TableCell>{book.title}</TableCell>
                    <TableCell>{book.author}</TableCell>
                    <TableCell>{book.size}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
}
