import { Pagination } from "@mui/material";

export default function PageNavigation(props: {
  pageZeroBased: number;
  setPage: (page: number) => void;
  totalPages?: number;
}) {
  const { pageZeroBased, setPage, totalPages } = props;
  const page = pageZeroBased + 1;

  return (
    <Pagination
      count={totalPages}
      page={page}
      onChange={(_, page) => {
        setPage(page - 1);
      }}
      sx={{ width: "100%", display: "flex", justifyContent: "center" }}
    />
  );
}
