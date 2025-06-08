// types/analytics.ts

/**
 * 월별 매출 데이터
 */
export interface MonthlyRevenue {
  month: string;
  monthlyRevenue: number;
}

/**
 * 도서별 증가 판매량 데이터
 */
export interface IncreasedSalesData {
  bookId: number;
  bookName: string;
  totalSalesCount: number;
}

/**
 * 도서별 통계 데이터
 */
export interface EbookStats {
  bookId: number;
  title: string;
  author: string;
  bookCoverImageURL: string;
  totalSalesCount: number;
  totalRevenue: number;
  viewCount: number;
  activityCount: number;
  createdAt: string;
}

/**
 * 출판사 통계 데이터
 */
export interface PublisherStatsData {
  totalSalesCount: number;
  increasedSalesCount: number;
  totalRevenue: number;
  increasedRevenue: number;
  totalActivityCount: number;
  increasedActivityCount: number;
  totalViewCount: number;
  monthlyRevenueList: MonthlyRevenue[];
  increasedSalesCountsPerEbook: IncreasedSalesData[];
  statsPerEbookList: EbookStats[];
}

/**
 * API 응답 래퍼
 */
export interface PublisherStatsResponse {
  isSuccessful: boolean;
  data: PublisherStatsData;
}

/**
 * AnalyticsTab 컴포넌트 Props
 */
export interface AnalyticsTabProps {
  publisherStats: PublisherStatsData | null;
}

// 차트 데이터를 위한 유틸리티 타입들
export interface PieChartData {
  name: string;
  value: number;
  fullName: string;
}

export interface LineChartData {
  title: string;
  매출: number;
  판매량: number;
  조회수: number;
  활동선정: number;
}

export interface BarChartData {
  title: string;
  avgPrice: number;
}
