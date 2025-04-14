import {
  Card,
  CardActionArea,
  CardContent,
  CardHeader,
  CardMedia,
  Grid2,
  Pagination,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import API_CLIENT, { wrapApiResponse } from "../api/api";
import { JSX, PropsWithChildren, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
const ITEM_HEIGHT = 384 - 20;

export default function GroupList(props: {
  size: "small" | "large";
  action?: JSX.Element;
}) {
  const { size, action } = props;

  const [page, setPage] = useState(0);
  const [sort, setSort] = useState<string[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  const pageSize = size === "small" ? 6 : 12;

  const { data } = useQuery({
    queryKey: ["groupList", page, sort, pageSize],
    queryFn: async () => {
      const response = await wrapApiResponse(
        API_CLIENT.groupController.getAllGroups({
          page,
          size: pageSize,
          sort,
        })
      );

      if (response.isSuccessful) {
        setTotalPages(response.data.totalPages!);
        return response.data.content;
      }

      throw new Error(response.errorMessage);
    },
    initialData: new Array(pageSize).fill(undefined),
    placeholderData: keepPreviousData,
  });

  return (
    <Card>
      <Stack spacing={2} sx={{ padding: 2 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="h4">모임</Typography>
          {action}
        </Stack>
        <PageNavigation
          pageZeroBased={page}
          setPage={setPage}
          totalPages={totalPages}
        />
        <Grid2 container spacing={2}>
          {data?.map((group, index) =>
            group ? (
              <ItemContainer key={group.groupId}>
                <Card sx={{ height: ITEM_HEIGHT }} elevation={3}>
                  <CardActionArea
                    sx={{
                      height: ITEM_HEIGHT,
                      display: "flex",
                      alignItems: "start",
                      flexDirection: "column",
                      justifyContent: "start",
                    }}
                    onClick={() => {
                      navigate({
                        to: "/groups/$groupId",
                        params: { groupId: group.groupId.toString() },
                      });
                    }}
                  >
                    <CardHeader title={group.name} />
                    <CardMedia
                      height={192}
                      component={"img"}
                      // TODO: Use group image
                      image="https://picsum.photos/512/512"
                    />
                    <CardContent>
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        component={"div"}
                        sx={{
                          textOverflow: "ellipsis",
                          overflow: "hidden",
                          whiteSpace: "wrap",
                          lineBreak: "anywhere",
                          height: 80,
                        }}
                      >
                        {group.description}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
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
