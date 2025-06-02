import {
  Container,
  Stack,
  Typography,
  Box,
  Paper,
  Tabs,
  Tab,
} from "@mui/material";
import {
  PersonAdd as PersonAddIcon,
  Group as GroupIcon,
  Settings as SettingsIcon,
  BarChart as BarChartIcon,
} from "@mui/icons-material";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import API_CLIENT from "../../../api/api";
import GroupStatisticsCard from "../../../component/GroupManagement/GroupStatisticCard";
import PendingMemberCard from "../../../component/GroupManagement/PendingMemberCard";
import GroupDashboard from "../../../component/GroupManagement/GroupDashboard";
import GroupMembersCard from "../../../component/GroupManagement/GroupMembersCard";
import GroupSettingsCard from "../../../component/GroupManagement/GroupSettingsCard";

export const Route = createFileRoute("/groups/$groupId/manage")({
  component: RouteComponent,
  params: {
    parse: (params) => {
      const groupId = parseInt(params.groupId);
      if (isNaN(groupId)) {
        throw new Error("Invalid groupId");
      }
      return { groupId };
    },
  },
});

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`group-management-tabpanel-${index}`}
      aria-labelledby={`group-management-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

function RouteComponent() {
  const [tabValue, setTabValue] = useState(0);
  const { groupId } = Route.useParams();
  const navigate = Route.useNavigate();
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const { data: groupData } = useQuery({
    queryKey: ["getGroup", groupId],
    queryFn: async () => {
      const response = await API_CLIENT.groupController.getGroup(groupId);
      if (!response.isSuccessful) {
        throw new Error(response.errorMessage);
      }
      return response.data;
    },
  });
  const groupName = groupData?.name;

  const handleRouteGroups = () => {
    navigate({ to: "/groups" });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={4}>
        {/* 헤더 영역 */}
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            {groupName} 모임 관리
          </Typography>
          <Typography variant="body1" color="text.secondary">
            멤버 관리, 설정 변경 및 모임 운영을 관리하세요
          </Typography>
        </Box>

        {/* 대시보드 카드 */}
        <GroupDashboard groupId={groupId} />

        {/* 탭 네비게이션 */}
        <Paper sx={{ mb: 3 }} variant="outlined">
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="모임 관리 탭"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab
              icon={<PersonAddIcon />}
              label="가입 신청"
              iconPosition="start"
            />
            <Tab icon={<GroupIcon />} label="멤버 관리" iconPosition="start" />
            <Tab
              icon={<SettingsIcon />}
              label="모임 설정"
              iconPosition="start"
            />
            <Tab icon={<BarChartIcon />} label="통계" iconPosition="start" />
          </Tabs>
        </Paper>

        {/* 탭 패널 */}
        <TabPanel value={tabValue} index={0}>
          <PendingMemberCard groupId={groupId} />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <GroupMembersCard groupId={groupId} />
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <GroupSettingsCard
            groupId={groupId}
            onDeleteRoute={handleRouteGroups}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <GroupStatisticsCard />
        </TabPanel>
      </Stack>
    </Container>
  );
}
