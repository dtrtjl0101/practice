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
} from "@mui/material";
import { Group, Search, Clear } from "@mui/icons-material";
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
  size: "small" | "large";
  action?: JSX.Element;
  title: string;
  keyPrefix: string;
  kind?: GroupListKind;
  initialSearchTerms?: string[];
}) {
  const { size, action, title, keyPrefix, initialSearchTerms = [] } = props;

  console.log("Valid initial search terms:", initialSearchTerms);

  const [page, setPage] = useState(0);
  const [sort, _setSort] = useState<string[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerms, setSearchTerms] = useState<string[]>(initialSearchTerms);
  const [currentInput, setCurrentInput] = useState("");
  const [debouncedSearchTerms, setDebouncedSearchTerms] =
    useState<string[]>(initialSearchTerms);
  const navigate = useNavigate();

  const pageSize = size === "small" ? 4 : 12;
  const groupType =
    props.kind === undefined ? GroupListKind.ALL_GROUP : props.kind;

  // 검색어 디바운싱
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerms(searchTerms);
      setPage(0);
    }, SEARCH_DEBOUNCE_DELAY);

    return () => clearTimeout(timer);
  }, [searchTerms]);

  // 데이터 가져오기
  const { data: allGroups } = useQuery({
    queryKey: [keyPrefix, groupType, sort],
    queryFn: async () => {
      const requestPageSize = debouncedSearchTerms.length > 0 ? 1000 : pageSize;
      const requestPage = debouncedSearchTerms.length > 0 ? 0 : page;

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

  // 클라이언트 사이드 검색
  const filteredGroups = useMemo(() => {
    if (!allGroups?.content) return [];

    let filtered = allGroups.content.filter(Boolean) as GroupInfo[];

    if (debouncedSearchTerms.length > 0) {
      filtered = filtered.filter((group) => {
        return debouncedSearchTerms.some((searchTerm) => {
          // 문자열 타입 체크 추가
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
  }, [allGroups?.content, debouncedSearchTerms]);

  // 페이지네이션
  const paginatedGroups = useMemo(() => {
    const startIndex = page * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredGroups.slice(startIndex, endIndex);
  }, [filteredGroups, page, pageSize]);

  // 총 페이지 수 계산
  const calculatedTotalPages = useMemo(() => {
    return Math.max(1, Math.ceil(filteredGroups.length / pageSize));
  }, [filteredGroups.length, pageSize]);

  // 총 페이지 수 업데이트
  useEffect(() => {
    if (debouncedSearchTerms.length > 0) {
      setTotalPages(calculatedTotalPages);
    } else {
      setTotalPages(allGroups?.totalPages || 1);
    }
  }, [debouncedSearchTerms, calculatedTotalPages, allGroups?.totalPages]);

  const groups =
    debouncedSearchTerms.length > 0
      ? paginatedGroups
      : allGroups?.content || [];

  // 검색 이벤트 핸들러
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

        <PageNavigation
          pageZeroBased={page}
          setPage={setPage}
          totalPages={totalPages}
        />

        <Grid container spacing={2}>
          {groups.length === 0 && (
            <Grid size={12} textAlign={"center"}>
              <Typography variant="body1" color="textSecondary">
                {debouncedSearchTerms.length > 0
                  ? `"${debouncedSearchTerms.join(", ")}"에 대한 검색 결과가 없습니다.`
                  : groupType === GroupListKind.MY_GROUP
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
