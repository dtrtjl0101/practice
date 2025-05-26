import {
  Card,
  CardContent,
  CardHeader,
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BookMetadata } from "../../types/book";
import API_CLIENT from "../../api/api";

export const Route = createFileRoute("/admin/books")({
  component: RouteComponent,
});

function RouteComponent() {
  const [books, setBooks] = useState<BookMetadata[]>([]);

  useEffect(() => {
    API_CLIENT.ebookController.getBooks().then((response) => {
      if (response.isSuccessful) {
        const books =
          response.data.content?.map((book) => {
            const { id, title, author, description, size } = book;
            return {
              id: id!,
              title: title!,
              author: author!,
              description: description!,
              size: size!,
            } as BookMetadata;
          }) || [];
        setBooks(books);
      } else {
        console.error(response.errorCode, response.errorMessage);
      }
    });
  }, [setBooks]);

  return (
    <Container sx={{ my: 8 }}>
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
    </Container>
  );
}
