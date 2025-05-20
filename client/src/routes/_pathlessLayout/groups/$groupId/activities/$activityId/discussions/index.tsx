import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Typography,
  Container,
  Button,
  Paper,
  Stack,
  Box,
  Card,
  CardContent,
  Divider,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import API_CLIENT from "../../../../../../../api/api";
import { Discussion } from "../../../../../../../types/discussion";

export const Route = createFileRoute(
  "/_pathlessLayout/groups/$groupId/activities/$activityId/discussions/"
)({
  component: RouteComponent,
  params: {
    parse: (params) => {
      const groupId = parseInt(params.groupId);
      if (isNaN(groupId)) {
        throw new Error("Invalid groupId");
      }
      const activityId = parseInt(params.activityId);
      if (isNaN(activityId)) {
        throw new Error("Invalid activityId");
      }
      return {
        groupId,
        activityId,
      };
    },
  },
});

function RouteComponent() {
  const navigate = useNavigate();
  const { groupId, activityId } = Route.useParams();
  const { data: discussions } = useQuery({
    queryKey: ["discussions", activityId],
    queryFn: async () => {
      const response =
        await API_CLIENT.discussionController.getDiscussions(activityId);
      if (!response.isSuccessful) {
        alert(response.errorMessage);
        return;
      }
      return response.data.content as Discussion[];
    },
  });

  // const [page, setPage] = useState(0);
  // const [sort, _setSort] = useState<string[]>([]);
  // const [totalPages, setTotalPages] = useState(1);
  return (
    <Container maxWidth="md">
      <Box sx={{ textAlign: "center", my: 4 }}>
        <Typography variant="h4">게시판</Typography>
      </Box>
      <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
        <Box sx={{ textAlign: "left", mb: 4 }}>
          <Button
            variant="contained"
            onClick={() =>
              navigate({
                from: Route.to,
                to: "/groups/$groupId",
                params: {
                  groupId,
                },
              })
            }
          >
            이전 페이지
          </Button>
        </Box>
        <Box sx={{ textAlign: "right", mb: 4 }}>
          <Button
            variant="contained"
            onClick={() =>
              navigate({
                from: Route.to,
                to: `new`,
              })
            }
          >
            새 게시글 추가
          </Button>
        </Box>
      </Stack>
      <Divider sx={{ mb: 4 }} />

      <Box>
        {discussions?.length == 0 ? (
          <Typography>등록된 글이 없습니다.</Typography>
        ) : (
          discussions?.map((discussion) => (
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
                          from: Route.to,
                          to: "$discussionId",
                          params: {
                            discussionId: discussion.discussionId.toString(),
                          },
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
                      {new Date(
                        discussion.modifiedAt == undefined
                          ? discussion.createdAt
                          : discussion.modifiedAt
                      ).toLocaleString()}
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
