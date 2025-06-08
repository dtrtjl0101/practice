package qwerty.chaekit.dto.statistics;

public record MainStatisticResponse(
    long totalGroups,
    long totalUsers,
    long totalEbooks,
    long totalActivities,
    long increasedActivities
) { }
