import {
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  Skeleton,
  Stack,
  TextField,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Button,
} from "@mui/material";
import { Group, Search, Clear, PersonOutline } from "@mui/icons-material";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import API_CLIENT from "../api/api";
import {
  JSX,
  PropsWithChildren,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { useNavigate } from "@tanstack/react-router";
import PageNavigation from "./PageNavigation";
import { GroupInfo } from "../types/groups";

const ITEM_HEIGHT = 256;
const SEARCH_DEBOUNCE_DELAY = 500;

export enum GroupListKind {
  ALL_GROUP = "ALL_GROUP",
  MY_GROUP = "MY_GROUP",
  JOINED_GROUP = "JOINED_GROUP",
}

export default function GroupList(props: {
  size: "small" | "medium" | "large";
  action?: JSX.Element;
  title: string;
  keyPrefix: string;
  kind?: GroupListKind;
  initialSearchTerms?: string[];
}) {
  const { size, action, title, keyPrefix, initialSearchTerms = [] } = props;

  const [page, setPage] = useState(0);
  const [sort, _setSort] = useState<string[]>([]);
  const [searchTerms, setSearchTerms] = useState<string[]>(initialSearchTerms);
  const [currentInput, setCurrentInput] = useState("");
  const [debouncedSearchTerms, setDebouncedSearchTerms] =
    useState<string[]>(initialSearchTerms);
  const navigate = useNavigate();

  const pageSize =
    size === "small" ? 6 : size === "medium" ? 4 : size === "large" ? 12 : 4;
  const groupType =
    props.kind === undefined ? GroupListKind.ALL_GROUP : props.kind;
  const hasSearchTerms = debouncedSearchTerms.length > 0;

  // 검색어 디바운싱
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerms(searchTerms);
      // 검색어가 변경될 때마다 첫 페이지로 리셋
      setPage(0);
    }, SEARCH_DEBOUNCE_DELAY);

    return () => clearTimeout(timer);
  }, [searchTerms]);

  // 데이터 가져오기 - 검색 여부에 따라 다른 전략 사용
  const { data: queryData, isLoading } = useQuery({
    queryKey: [
      keyPrefix,
      groupType,
      sort,
      hasSearchTerms ? "search" : "normal",
      hasSearchTerms ? 0 : page,
    ],
    queryFn: async () => {
      // 검색 시에는 모든 데이터를 가져오고, 일반 상태에서는 페이지별로 가져옴
      const requestPageSize = hasSearchTerms ? 1000 : pageSize;
      const requestPage = hasSearchTerms ? 0 : page;

      const response = await getFetchFunction(groupType)({
        page: requestPage,
        size: requestPageSize,
        sort,
      });

      if (response.isSuccessful) {
        return {
          content: response.data.content! as GroupInfo[],
          totalPages: response.data.totalPages!,
          totalItems: response.data.totalItems!,
        };
      }

      throw new Error(response.errorMessage);
    },
    initialData: {
      content: new Array(pageSize).fill(undefined) as (GroupInfo | undefined)[],
      totalPages: 1,
      totalItems: 0,
    },
    placeholderData: keepPreviousData,
  });

  // 클라이언트 사이드 검색 필터링
  const filteredGroups = useMemo(() => {
    if (!queryData?.content) return [];

    let filtered = queryData.content.filter(Boolean) as GroupInfo[];

    if (hasSearchTerms) {
      filtered = filtered.filter((group) => {
        return debouncedSearchTerms.some((searchTerm) => {
          if (typeof searchTerm !== "string" || !searchTerm) return false;

          const termLower = searchTerm.toLowerCase();
          const nameMatch = group.name?.toLowerCase().includes(termLower);
          const tagMatch = group.tags?.some(
            (tag) =>
              typeof tag === "string" && tag.toLowerCase().includes(termLower)
          );
          return nameMatch || tagMatch;
        });
      });
    }

    return filtered;
  }, [queryData?.content, debouncedSearchTerms, hasSearchTerms]);

  // 페이지네이션 처리
  const { displayGroups, totalPages } = useMemo(() => {
    if (hasSearchTerms) {
      // 검색 시: 클라이언트 사이드 페이지네이션
      const startIndex = page * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedGroups = filteredGroups.slice(startIndex, endIndex);
      const calculatedTotalPages = Math.max(
        1,
        Math.ceil(filteredGroups.length / pageSize)
      );

      return {
        displayGroups: paginatedGroups,
        totalPages: calculatedTotalPages,
      };
    } else {
      // 일반 상태: 서버 사이드 페이지네이션
      return {
        displayGroups: filteredGroups,
        totalPages: queryData?.totalPages || 1,
      };
    }
  }, [hasSearchTerms, filteredGroups, page, pageSize, queryData?.totalPages]);

  // 페이지 변경 핸들러
  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  // 검색 이벤트 핸들러들
  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setCurrentInput(event.target.value);
    },
    []
  );

  const handleInputKeyPress = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter" && currentInput.trim()) {
        const trimmedInput = currentInput.trim();
        if (trimmedInput && !searchTerms.includes(trimmedInput)) {
          setSearchTerms((prev) => [...prev, trimmedInput]);
        }
        setCurrentInput("");
      }
    },
    [currentInput, searchTerms]
  );

  const handleRemoveSearchTerm = useCallback((termToRemove: string) => {
    setSearchTerms((prev) => prev.filter((term) => term !== termToRemove));
  }, []);

  const handleClearAllSearch = useCallback(() => {
    setSearchTerms([]);
    setCurrentInput("");
  }, []);

  // small size일 때는 카드 형태로 렌더링
  if (size === "small") {
    return (
      <Card variant="outlined">
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          px={3}
          py={2}
          borderBottom="1px solid"
          borderColor="divider"
        >
          <Typography variant="h6">{title}</Typography>
          {action}
        </Box>
        <CardContent sx={{ pt: 0 }}>
          {displayGroups.length === 0 && !isLoading ? (
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              py={4}
              color="text.secondary"
            >
              <Group sx={{ fontSize: 48, opacity: 0.5, m: 2 }} />
              <Typography variant="body2">
                {groupType === GroupListKind.MY_GROUP
                  ? "아직 생성한 모임이 없습니다"
                  : groupType === GroupListKind.JOINED_GROUP
                    ? "아직 가입한 모임이 없습니다"
                    : "아직 모임이 없습니다"}
              </Typography>
              {groupType === GroupListKind.JOINED_GROUP && (
                <Button
                  onClick={() => {
                    navigate({ to: "/groups", search: { searchTerms: [] } });
                  }}
                  variant="outlined"
                  sx={{ mt: 2, textTransform: "none" }}
                  startIcon={<Search />}
                >
                  모임 찾기
                </Button>
              )}
            </Box>
          ) : (
            <List disablePadding>
              {displayGroups.map((group, index) =>
                group ? (
                  <Box key={group.groupId}>
                    <ListItem
                      sx={{
                        px: 0,
                        py: 1.5,
                        cursor: "pointer",
                        borderRadius: 1,
                        "&:hover": {
                          bgcolor: "action.hover",
                          "& .group-actions": { opacity: 1 },
                        },
                      }}
                      onClick={() => {
                        navigate({
                          to: "/groups/$groupId",
                          params: { groupId: group.groupId! },
                        });
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar
                          src={group.groupImageURL}
                          sx={{
                            bgcolor:
                              groupType === GroupListKind.MY_GROUP
                                ? "primary.main"
                                : "secondary.main",
                            width: 40,
                            height: 40,
                          }}
                        >
                          {group.name?.charAt(0)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Stack
                            spacing={1}
                            direction="row"
                            alignItems={"center"}
                          >
                            <Typography
                              variant="subtitle2"
                              fontWeight={600}
                              noWrap
                            >
                              {group.name}
                            </Typography>
                            <Chip
                              icon={<PersonOutline />}
                              label={group.memberCount}
                              size="small"
                              variant="outlined"
                              sx={{ height: 20, fontSize: "0.75rem" }}
                            />
                          </Stack>
                        }
                        secondary={
                          <Box>
                            {groupType === GroupListKind.JOINED_GROUP && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                display="block"
                              >
                                모임지기: {group.leaderNickname}
                              </Typography>
                            )}
                            <Box
                              display="flex"
                              alignItems="center"
                              gap={1}
                              mt={0.5}
                            >
                              {group.tags?.slice(0, 2).map((tag, tagIndex) => (
                                <Chip
                                  key={tagIndex}
                                  label={tag}
                                  size="small"
                                  sx={{
                                    height: 20,
                                    fontSize: "0.75rem",
                                    bgcolor:
                                      groupType === GroupListKind.MY_GROUP
                                        ? "primary.main"
                                        : "secondary.main",
                                    color: "white",
                                  }}
                                />
                              ))}
                              {group.tags && group.tags.length > 2 && (
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  +{group.tags.length - 2}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <Box
                          className="group-actions"
                          sx={{ opacity: 0, transition: "opacity 0.2s" }}
                        >
                          {groupType === GroupListKind.MY_GROUP ? (
                            <Chip
                              label="리더"
                              size="small"
                              color="success"
                              variant="outlined"
                              sx={{ fontSize: "0.75rem" }}
                            />
                          ) : group.isAutoApproval ? (
                            <Chip
                              label="자동가입"
                              size="small"
                              color="info"
                              variant="outlined"
                              sx={{ fontSize: "0.75rem" }}
                            />
                          ) : null}
                        </Box>
                      </ListItemSecondaryAction>
                    </ListItem>
                    {index < displayGroups.length - 1 && <Divider />}
                  </Box>
                ) : (
                  <ListItem key={`skeleton-${index}`} sx={{ px: 0 }}>
                    <ListItemAvatar>
                      <Skeleton variant="circular" width={40} height={40} />
                    </ListItemAvatar>
                    <ListItemText
                      primary={<Skeleton width="60%" />}
                      secondary={<Skeleton width="80%" />}
                    />
                  </ListItem>
                )
              )}
            </List>
          )}
        </CardContent>
      </Card>
    );
  }

  // medium, large size일 때는 기존 형태 유지
  return (
    <Container>
      <Stack spacing={2}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="h4">{title}</Typography>
          {action}
        </Stack>

        {/* 검색창 - size가 large일 때만 표시 */}
        {size === "large" && (
          <Box sx={{ maxWidth: 600, mx: "auto", width: "100%" }}>
            <Stack spacing={2}>
              {/* 검색어 태그들 */}
              {searchTerms.length > 0 && (
                <Box>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {searchTerms.map((term, index) => (
                      <Chip
                        key={index}
                        label={term}
                        onDelete={() => handleRemoveSearchTerm(term)}
                        color="primary"
                        variant="filled"
                        size="small"
                        sx={{
                          fontWeight: 500,
                          "& .MuiChip-deleteIcon": {
                            fontSize: "18px",
                          },
                        }}
                      />
                    ))}
                    <Chip
                      label="모두 지우기"
                      onClick={handleClearAllSearch}
                      color="default"
                      variant="outlined"
                      size="small"
                      sx={{ fontWeight: 500 }}
                    />
                  </Stack>
                </Box>
              )}

              {/* 검색 입력창 */}
              <TextField
                fullWidth
                placeholder="검색어 입력 후 Enter를 눌러 태그를 추가하세요..."
                value={currentInput}
                onChange={handleInputChange}
                onKeyPress={handleInputKeyPress}
                variant="outlined"
                size="medium"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: currentInput && (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="입력 지우기"
                        onClick={() => setCurrentInput("")}
                        edge="end"
                        size="small"
                      >
                        <Clear />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    },
                    "&.Mui-focused": {
                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    },
                  },
                }}
              />
            </Stack>
          </Box>
        )}

        <Grid container spacing={2}>
          {displayGroups.length === 0 && !isLoading && (
            <Grid size={12} textAlign={"center"}>
              <Typography variant="body1" color="textSecondary">
                {hasSearchTerms
                  ? `"${debouncedSearchTerms.join(", ")}"에 대한 검색 결과가 없습니다.`
                  : groupType === GroupListKind.MY_GROUP
                    ? "아직 생성한 모임이 없습니다."
                    : groupType === GroupListKind.JOINED_GROUP
                      ? "아직 가입한 모임이 없습니다."
                      : "아직 모임이 없습니다."}
              </Typography>
            </Grid>
          )}
          {displayGroups?.map((group, index) =>
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
                        <Stack direction="row" spacing={1}>
                          {group.isAutoApproval && size === "large" && (
                            <Chip
                              label="자동 가입"
                              size="small"
                              sx={{
                                bgcolor: "rgba(255,255,255,0.2)",
                                color: "white",
                                backdropFilter: "blur(10px)",
                                border: "1px solid rgba(255,255,255,0.3)",
                                fontWeight: "bold",
                              }}
                            />
                          )}
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

        {size === "large" && (
          <PageNavigation
            pageZeroBased={page}
            setPage={handlePageChange}
            totalPages={totalPages}
          />
        )}
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
