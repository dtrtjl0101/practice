import { createFileRoute } from "@tanstack/react-router";
import { GroupInfo, GroupMembershipStatus } from "../../../types/groups";
import {
  Box,
  Container,
  Divider,
  Grid,
  Paper,
  Skeleton,
  Stack,
  Typography,
  useTheme,
  alpha,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import API_CLIENT from "../../../api/api";
import { ActivityCard } from "../../../component/_pathlessLayout/groups/$groupId/ActivityCard";
import { GroupHeader } from "../../../component/_pathlessLayout/groups/$groupId/GroupHeader";
import GroupReviewCard from "../../../component/GroupReviewCard";

export const Route = createFileRoute("/groups/$groupId/")({
  component: RouteComponent,
  params: {
    parse: (params) => {
      const groupId = parseInt(params.groupId);
      if (isNaN(groupId)) {
        throw new Error("Invalid groupId");
      }
      return {
        groupId,
      };
    },
  },
});

function RouteComponent() {
  const { groupId } = Route.useParams();
  const theme = useTheme();

  const { data: group } = useQuery({
    queryKey: ["group", groupId],
    queryFn: async () => {
      const response = await API_CLIENT.groupController.getGroup(groupId);
      if (!response.isSuccessful) {
        throw new Error(response.errorMessage);
      }

      return response.data as GroupInfo;
    },
  });

  const isOwner = group?.myMemberShipStatus === GroupMembershipStatus.OWNED;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.02)} 0%, ${alpha(theme.palette.secondary.main, 0.02)} 100%)`,
        position: "relative",
      }}
    >
      {/* Hero Background with Group Image */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "400px",
          overflow: "hidden",
          zIndex: 0,
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: group?.groupImageURL
              ? `linear-gradient(135deg, ${alpha(theme.palette.background.default, 0.85)} 0%, ${alpha(theme.palette.background.default, 0.95)} 100%),
                 url("${group.groupImageURL}")`
              : `radial-gradient(circle at 30% 20%, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 50%),
                 radial-gradient(circle at 80% 80%, ${alpha(theme.palette.secondary.main, 0.08)} 0%, transparent 50%)`,
            backgroundSize: group?.groupImageURL ? "cover" : "auto",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            filter: group?.groupImageURL ? "blur(1px)" : "none",
            zIndex: -1,
          },
          "&::after": group?.groupImageURL
            ? {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: `linear-gradient(180deg, transparent 0%, ${alpha(theme.palette.background.default, 0.3)} 50%, ${alpha(theme.palette.background.default, 0.8)} 100%)`,
                zIndex: 0,
              }
            : {},
        }}
      >
        {/* Decorative Elements */}
        {group?.groupImageURL && (
          <>
            <Box
              sx={{
                position: "absolute",
                top: "20%",
                right: "10%",
                width: "150px",
                height: "150px",
                borderRadius: "50%",
                background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.2)} 0%, transparent 70%)`,
                animation: "float 6s ease-in-out infinite",
                "@keyframes float": {
                  "0%, 100%": { transform: "translateY(0px)" },
                  "50%": { transform: "translateY(-20px)" },
                },
              }}
            />
            <Box
              sx={{
                position: "absolute",
                bottom: "30%",
                left: "15%",
                width: "100px",
                height: "100px",
                borderRadius: "50%",
                background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.15)} 0%, transparent 70%)`,
                animation: "float 8s ease-in-out infinite reverse",
              }}
            />
          </>
        )}

        {/* Subtle Pattern Overlay */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `radial-gradient(circle at 20% 30%, ${alpha(theme.palette.primary.main, 0.05)} 0%, transparent 40%),
                       radial-gradient(circle at 80% 70%, ${alpha(theme.palette.secondary.main, 0.05)} 0%, transparent 40%)`,
            zIndex: 1,
          }}
        />
      </Box>

      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 2 }}>
        {/* Header Section with Enhanced Spacing */}
        <Box sx={{ pt: 6, pb: 4 }}>
          <GroupHeader group={group} groupId={groupId} />
        </Box>

        {/* Main Content Grid */}
        <Grid container spacing={4} sx={{ mb: 6 }}>
          {/* Left Column - Primary Content */}
          <Grid size={{ xs: 12, lg: 8 }}>
            <Stack spacing={4}>
              {/* Activity Section with Enhanced Design */}

              <ActivityCard groupId={groupId} canCreate={isOwner} />

              {/* Chat Room Section with Modern Design */}
              <Paper
                variant="outlined"
                sx={{
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  backdropFilter: "blur(10px)",
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                <Box sx={{ p: 4 }}>
                  <Stack spacing={3}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Box
                        sx={{
                          width: 6,
                          height: 32,
                          borderRadius: 3,
                          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        }}
                      />
                      <Typography
                        variant="h5"
                        sx={{
                          fontWeight: 700,
                          background: `linear-gradient(135deg, ${theme.palette.text.primary}, ${theme.palette.primary.main})`,
                          backgroundClip: "text",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                        }}
                      >
                        모임 대화방
                      </Typography>
                    </Box>

                    <Divider sx={{ opacity: 0.3 }} />

                    <Box
                      sx={{
                        position: "relative",
                        borderRadius: 2,
                        overflow: "hidden",
                        background: alpha(theme.palette.action.hover, 0.3),
                      }}
                    >
                      <Skeleton
                        variant="rectangular"
                        width="100%"
                        height={250}
                        sx={{
                          borderRadius: 2,
                          transform: "scale(1)",
                          "&::after": {
                            background: `linear-gradient(90deg, transparent, ${alpha(theme.palette.common.white, 0.4)}, transparent)`,
                          },
                        }}
                      />
                      <Box
                        sx={{
                          position: "absolute",
                          top: "50%",
                          left: "50%",
                          transform: "translate(-50%, -50%)",
                          textAlign: "center",
                          color: alpha(theme.palette.text.secondary, 0.6),
                        }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          대화방 준비 중...
                        </Typography>
                      </Box>
                    </Box>
                  </Stack>
                </Box>
              </Paper>
            </Stack>
          </Grid>

          {/* Right Column - Reviews */}
          <Grid size={{ xs: 12, lg: 4 }}>
            <GroupReviewCard groupId={groupId} canWriteReview={true} />
          </Grid>
        </Grid>

        {/* Bottom Spacing */}
        <Box sx={{ height: 64 }} />
      </Container>
    </Box>
  );
}
