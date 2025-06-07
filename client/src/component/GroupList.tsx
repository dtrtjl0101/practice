import {
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Grid,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { Group } from "@mui/icons-material";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import API_CLIENT from "../api/api";
import { JSX, PropsWithChildren, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import PageNavigation from "./PageNavigation";
import { GroupInfo } from "../types/groups";
const ITEM_HEIGHT = 256;

export enum GroupListKind {
  ALL_GROUP = "ALL_GROUP",
  MY_GROUP = "MY_GROUP",
  JOINED_GROUP = "JOINED_GROUP",
}

export default function GroupList(props: {
  size: "small" | "large";
  action?: JSX.Element;
  title: string;
  keyPrefix: string;
  kind?: GroupListKind;
}) {
  const { size, action, title, keyPrefix } = props;

  const [page, setPage] = useState(0);
  const [sort, _setSort] = useState<string[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  const pageSize = size === "small" ? 4 : 12;
  const groupType =
    props.kind === undefined ? GroupListKind.ALL_GROUP : props.kind;

  const { data: groups } = useQuery({
    queryKey: [keyPrefix, groupType, page, sort, pageSize],
    queryFn: async () => {
      const response = await getFetchFunction(groupType)({
        page,
        size: pageSize,
        sort,
      });

      if (response.isSuccessful) {
        setTotalPages(response.data.totalPages!);
        return response.data.content! as GroupInfo[];
      }

      throw new Error(response.errorMessage);
    },
    initialData: new Array(pageSize).fill(undefined) as (
      | GroupInfo
      | undefined
    )[],
    placeholderData: keepPreviousData,
  });

  return (
    <Container>
      <Stack spacing={1}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="h4">{title}</Typography>
          {action}
        </Stack>
        <PageNavigation
          pageZeroBased={page}
          setPage={setPage}
          totalPages={totalPages}
        />
        <Grid container spacing={2}>
          {groups.length === 0 && (
            <Grid size={12} textAlign={"center"}>
              <Typography variant="body1" color="textSecondary">
                {groupType === GroupListKind.MY_GROUP
                  ? "아직 생성한 모임이 없습니다."
                  : groupType === GroupListKind.JOINED_GROUP
                    ? "아직 가입한 모임이 없습니다."
                    : "아직 모임이 없습니다."}
              </Typography>
            </Grid>
          )}
          {groups?.map((group, index) =>
            group ? (
              <ItemContainer key={group.groupId}>
                <Card
                  sx={{
                    height: 1,
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: 3,
                    },
                  }}
                  variant="outlined"
                  onClick={() => {
                    navigate({
                      to: "/groups/$groupId",
                      params: { groupId: group.groupId! },
                    });
                  }}
                >
                  <CardContent
                    sx={{
                      p: 0,
                      position: "relative",
                      overflow: "hidden",
                      "&:last-child": { pb: 0 },
                    }}
                  >
                    {/* 배경 이미지 오버레이 */}
                    <Box
                      sx={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 120,
                        backgroundImage: group.groupImageURL
                          ? `url(${group.groupImageURL})`
                          : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        "&::after": {
                          content: '""',
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background:
                            "linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.7) 100%)",
                        },
                      }}
                    />

                    {/* 상단 헤더 영역 */}
                    <Box sx={{ position: "relative", zIndex: 2, p: 3, pb: 1 }}>
                      <Stack
                        direction="row"
                        alignItems="flex-start"
                        spacing={2}
                        mb={1}
                      >
                        <Box flex={1} sx={{ minWidth: 0 }}>
                          <Typography
                            variant="h5"
                            fontWeight="bold"
                            sx={{
                              color: "white",
                              textShadow: "0 2px 4px rgba(0,0,0,0.5)",
                              mb: 1,
                            }}
                            noWrap
                            textOverflow={"ellipsis"}
                          >
                            {group.name}
                          </Typography>
                          <Stack
                            direction={"row"}
                            alignItems={"center"}
                            spacing={1}
                          >
                            <Avatar src={group.leaderProfileImageURL} />
                            <Typography
                              variant="body2"
                              sx={{
                                color: "rgba(255,255,255,0.9)",
                                textShadow: "0 1px 2px rgba(0,0,0,0.5)",
                              }}
                            >
                              {group.leaderNickname}
                            </Typography>
                          </Stack>
                        </Box>

                        {/* 멤버 수 배지 */}
                        <Chip
                          icon={<Group color="inherit" />}
                          label={group.memberCount}
                          size="small"
                          sx={{
                            bgcolor: "rgba(255,255,255,0.2)",
                            color: "white",
                            backdropFilter: "blur(10px)",
                            border: "1px solid rgba(255,255,255,0.3)",
                            fontWeight: "bold",
                          }}
                        />
                      </Stack>
                    </Box>

                    {/* 컨텐츠 영역 */}
                    <Box sx={{ p: 3, pt: 2, bgcolor: "background.paper" }}>
                      {/* 설명 텍스트 - 고정 높이 */}
                      <Box sx={{ minHeight: 72 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            mb: 2,
                            display: "-webkit-box",
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            lineHeight: 1.6,
                            color: "text.secondary",
                          }}
                        >
                          {group.description}
                        </Typography>
                      </Box>
                      <Divider sx={{ my: 2 }} />
                      {/* 태그 섹션 - 고정 높이 */}
                      <Box sx={{ minHeight: 40 }}>
                        <Stack
                          direction="row"
                          spacing={1}
                          flexWrap="wrap"
                          useFlexGap
                        >
                          {group.tags.map((tag, tagIndex) => (
                            <Chip
                              key={tagIndex}
                              label={tag}
                              size="small"
                              sx={{
                                bgcolor: "primary.main",
                                color: "white",
                                fontWeight: 500,
                                "&:hover": {
                                  bgcolor: "primary.dark",
                                  transform: "translateY(-1px)",
                                  boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                                },
                                transition: "all 0.2s ease",
                              }}
                            />
                          ))}
                        </Stack>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </ItemContainer>
            ) : (
              <ItemContainer key={`placeholder-${index}`}>
                <Skeleton height={ITEM_HEIGHT} variant="rounded" />
              </ItemContainer>
            )
          )}
        </Grid>
        <PageNavigation
          pageZeroBased={page}
          setPage={setPage}
          totalPages={totalPages}
        />
      </Stack>
    </Container>
  );
}

function ItemContainer(props: PropsWithChildren) {
  const { children } = props;

  return (
    <Grid
      size={{
        xs: 12,
        md: 6,
      }}
    >
      {children}
    </Grid>
  );
}

function getFetchFunction(groupType: GroupListKind) {
  switch (groupType) {
    case GroupListKind.ALL_GROUP:
      return API_CLIENT.groupController.getAllGroups;
    case GroupListKind.MY_GROUP:
      return API_CLIENT.groupController.getCreatedGroups;
    case GroupListKind.JOINED_GROUP:
      return API_CLIENT.groupController.getJoinedGroups;
    default:
      throw new Error("Invalid group type");
  }
}
