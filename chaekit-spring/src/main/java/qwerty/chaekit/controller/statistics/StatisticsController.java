package qwerty.chaekit.controller.statistics;

import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import qwerty.chaekit.dto.statistics.MainStatisticResponse;
import qwerty.chaekit.global.response.ApiSuccessResponse;
import qwerty.chaekit.service.statistics.StatisticsService;

@Slf4j
@RestController
@RequestMapping("/api/statistics")
@RequiredArgsConstructor
public class StatisticsController {
    private final StatisticsService statisticsService;
    @Operation(
        summary = "모임 통계 조회",
        description = "모임의 통계 정보를 조회합니다. 총 모임 수, 총 사용자 수, 총 전자책 수, 총 활동 수, 최근 한 달간 증가한 활동 수를 포함합니다."
    )
    @GetMapping
    public ApiSuccessResponse<MainStatisticResponse> getMainStatistics() {
        return ApiSuccessResponse.of(statisticsService.getMainStatistics());
    }
}