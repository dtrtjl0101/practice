import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Typography,
  Container,
  Button,
  Paper,
  Divider,
  Stack,
  CircularProgress,
  Box,
  Card,
  CardContent,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import API_CLIENT, {
  wrapApiResponse,
  UnsafeApiResponseBody,
} from "../../../../../../../api/api";
import { Discussion } from "../../../../../../../types/discussion";
import { HttpResponse } from "../../../../../../../api/api.gen";

export const Route = createFileRoute(
  "/_pathlessLayout/groups/$groupId/activities/$activityId/discussions/"
)({
  component: Discussions,
});

function Discussions() {
  const navigate = useNavigate();

  const { groupId, activityId } = Route.useParams();
  const activityIdNumber = parseInt(activityId);
  const [page, setPage] = useState(0);
  const [sort, _setSort] = useState<string[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [discussions, setDiscussions] = useState<Discussion[] | null>(null);

  useEffect(() => {
    async function loadDiscussions() {
      const data = await fetchDiscussions(activityIdNumber);
      setDiscussions(data);
    }
    async function fetchDiscussions(activityIdNumber: number) {
      const discussionsResponse =
        await API_CLIENT.discussionController.getDiscussions(activityIdNumber);

      const transformedResponse: HttpResponse<UnsafeApiResponseBody, unknown> =
        {
          ...discussionsResponse,
          data: {
            isSuccessful: true,
            data: discussionsResponse.data,
          },
        };

      const response = await wrapApiResponse(
        Promise.resolve(transformedResponse)
      );

      if (response.isSuccessful) {
        // return response.data as Discussion[];
        return discussionsResponse.data as Discussion[];
      }
      return [];
    }
    loadDiscussions();
  }, [activityIdNumber]);

  return (
    <Container>
      <Box sx={{ textAlign: "center", my: 4 }}>
        <Typography variant="h4">게시판</Typography>
      </Box>
      <Box sx={{ textAlign: "right", mb: 4 }}>
        <Button
          variant="contained"
          onClick={() =>
            navigate({
              to: `/groups/${groupId}/activities/${activityId}/discussions/new`,
            })
          }
        >
          새 게시글 추가
        </Button>
      </Box>
      <Box>
        {discussions === null ? (
          <Typography>등록된 글이 없습니다.</Typography>
        ) : (
          discussions.map((discussion) => (
            <Paper
              key={discussion.discussionId}
              elevation={2}
              sx={{ mb: 2, borderRadius: 2, overflow: "hidden" }}
            >
              <Card>
                <CardContent>
                  {/* 제목 */}
                  <Stack direction="row" justifyContent="space-between">
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      gutterBottom
                      sx={{
                        cursor: "pointer",
                        transition: "color 0.2s",
                        "&:hover": {
                          color: "primary.main",
                        },
                      }}
                      onClick={() =>
                        navigate({
                          to: `/discussions/${discussion.discussionId}`,
                        })
                      }
                    >
                      {discussion.title}
                    </Typography>
                  </Stack>
                  {/* 본문 일부 미리보기 2줄 넘으면 ... */}
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mb: 1,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {discussion.content}
                  </Typography>

                  {/* 작성자 & 날짜 */}
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="caption" color="text.secondary">
                      작성자: {discussion.authorName}
                    </Typography>
                    <Typography variant="subtitle2" color="text.secondary">
                      {discussion.isDebate ? "찬반" : ""}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {discussion.createdAt.toLocaleDateString()}
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Paper>
          ))
        )}
      </Box>
    </Container>
  );
}
