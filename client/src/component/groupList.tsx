import {
  Card,
  Grid2,
  Pagination,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import API_CLIENT, { wrapApiResponse } from "../api/api";
import { PropsWithChildren, useState } from "react";
import { GroupFetchResponse } from "../api/api.gen";

const PAGE_SIZE = 12;
const ITEM_HEIGHT = 192;

export default function GroupList() {
  const [page, setPage] = useState(0);
  const [sort, setSort] = useState<string[]>([]);
  const [totalPages, setTotalPages] = useState(1);

  const { data } = useQuery({
    queryKey: ["groupList", page, sort],
    queryFn: async () => {
      const response = await wrapApiResponse(
        API_CLIENT.groupController.getAllGroups({
          page,
          size: PAGE_SIZE,
          sort,
        })
      );

      if (response.isSuccessful) {
        setTotalPages(response.data.totalPages!);
        const length = response.data.groups?.length ?? 0;
        if (length < PAGE_SIZE) {
          const groups: (GroupFetchResponse | undefined)[] =
            response.data.groups ?? [];
          for (let i = length; i < PAGE_SIZE; i++) {
            groups.push(undefined);
          }
          return groups;
        }
        return response.data.groups;
      }

      throw new Error(response.errorMessage);
    },
    placeholderData: keepPreviousData,
  });

  return (
    <Card>
      <Stack spacing={2} sx={{ padding: 2 }}>
        <Typography variant="h4">Groups</Typography>
        <PageNavigation
          pageZeroBased={page}
          setPage={setPage}
          totalPages={totalPages}
        />
        <Grid2 container spacing={2}>
          {data?.map((group, index) =>
            group ? (
              <ItemContainer key={group.groupId}>
                <Card sx={{ height: ITEM_HEIGHT }}>
                  <Typography variant="h6">{group.name}</Typography>
                  <Typography variant="body2">{group.description}</Typography>
                </Card>
              </ItemContainer>
            ) : (
              <ItemContainer key={`placeholder-${index}`}>
                <Skeleton height={ITEM_HEIGHT} variant="rounded" />
              </ItemContainer>
            )
          )}
        </Grid2>
        <PageNavigation
          pageZeroBased={page}
          setPage={setPage}
          totalPages={totalPages}
        />
      </Stack>
    </Card>
  );
}

function ItemContainer(props: PropsWithChildren) {
  const { children } = props;

  return (
    <Grid2
      size={{
        xs: 12,
        sm: 6,
        md: 4,
        lg: 4,
        xl: 4,
      }}
    >
      {children}
    </Grid2>
  );
}

function PageNavigation(props: {
  pageZeroBased: number;
  setPage: (page: number) => void;
  totalPages?: number;
}) {
  const { pageZeroBased, setPage, totalPages } = props;
  const page = pageZeroBased + 1;

  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      spacing={2}
    >
      <Pagination
        count={totalPages}
        page={page}
        onChange={(_, page) => {
          setPage(page - 1);
        }}
      />
    </Stack>
  );
}
