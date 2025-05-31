package qwerty.chaekit.domain.member.publisher;

import com.querydsl.core.Tuple;
import com.querydsl.core.types.Projections;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.core.types.dsl.Expressions;
import com.querydsl.core.types.dsl.NumberExpression;
import com.querydsl.core.types.dsl.StringTemplate;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import qwerty.chaekit.domain.ebook.QEbook;
import qwerty.chaekit.domain.ebook.purchase.QEbookPurchase;
import qwerty.chaekit.domain.group.activity.QActivity;
import qwerty.chaekit.domain.member.publisher.dto.PublisherMainStatsDto;
import qwerty.chaekit.domain.member.publisher.dto.StatsPerEbookDto;
import qwerty.chaekit.dto.member.PublisherStatsResponse;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Repository
@RequiredArgsConstructor
public class PublisherStatsRepositoryImpl implements PublisherStatsRepository {
    private final JPAQueryFactory query;

    @Override
    public PublisherMainStatsDto getPublisherMainStatistic(Long publisherId, LocalDate currentDate){
        String previousMonth = YearMonth.from(currentDate).minusMonths(1).toString();

        QEbook ebook = QEbook.ebook;
        QEbookPurchase purchase = QEbookPurchase.ebookPurchase;
        QActivity activity = QActivity.activity;

        // 누적 통계
        Long totalSalesCount = query.select(purchase.count())
                .from(purchase)
                .join(purchase.ebook, ebook)
                .where(ebook.publisher.id.eq(publisherId))
                .fetchOne();

        Integer totalRevenue = query.select(ebook.price.sum())
                .from(purchase)
                .join(purchase.ebook, ebook)
                .where(ebook.publisher.id.eq(publisherId))
                .fetchOne();

        Long totalActivityCount = query.select(activity.count())
                .from(activity)
                .join(activity.book, ebook)
                .where(ebook.publisher.id.eq(publisherId))
                .fetchOne();

        Long totalViewCount = query.select(ebook.viewCount.sum())
                .from(ebook)
                .where(ebook.publisher.id.eq(publisherId))
                .fetchOne();

        // 현재월/이전월 조건
        BooleanExpression isPreviousMonth = Expressions.stringTemplate("DATE_FORMAT({0}, '%Y-%m')", purchase.createdAt).eq(previousMonth);

        Long increasedSalesCount = query.select(purchase.count())
                .from(purchase)
                .join(purchase.ebook, ebook)
                .where(ebook.publisher.id.eq(publisherId), isPreviousMonth)
                .fetchOne();

        Integer increasedRevenue = query.select(ebook.price.sum())
                .from(purchase)
                .join(purchase.ebook, ebook)
                .where(ebook.publisher.id.eq(publisherId), isPreviousMonth)
                .fetchOne();

        BooleanExpression actPreviousMonth = Expressions
                .stringTemplate("DATE_FORMAT({0}, '%Y-%m')", activity.createdAt).eq(previousMonth);

        Long increasedActivityCount = query.select(activity.count())
                .from(activity)
                .join(activity.book, ebook)
                .where(ebook.publisher.id.eq(publisherId), actPreviousMonth)
                .fetchOne();

        return new PublisherMainStatsDto(
                Optional.ofNullable(totalSalesCount).orElse(0L),
                Long.valueOf(Optional.ofNullable(totalRevenue).orElse(0)),
                Optional.ofNullable(totalActivityCount).orElse(0L),
                Optional.ofNullable(totalViewCount).orElse(0L),
                
                Optional.ofNullable(increasedSalesCount).orElse(0L),
                Long.valueOf(Optional.ofNullable(increasedRevenue).orElse(0)),
                Optional.ofNullable(increasedActivityCount).orElse(0L)
        );
    }

    @Override
    public List<PublisherStatsResponse.MonthlyRevenue> getMonthlyRevenueList(Long publisherId) {
        QEbook ebook = QEbook.ebook;
        QEbookPurchase purchase = QEbookPurchase.ebookPurchase;

        // 기준일: 전월 기준
        YearMonth baseMonth = YearMonth.from(LocalDate.now()).minusMonths(1);
        List<String> months = IntStream.rangeClosed(0, 11)
                .mapToObj(i -> baseMonth.minusMonths(11 - i).toString()) // ["2024-03", ..., "2025-02"]
                .toList();

        StringTemplate monthExpr = Expressions.stringTemplate("DATE_FORMAT({0}, '%Y-%m')", purchase.createdAt);
        NumberExpression<Long> revenueExpr = ebook.price.sum().castToNum(Long.class);

        // 1. 실제 매출 결과를 Map<String month, Long revenue>로 조회
        List<Tuple> resultTuples = query.select(monthExpr, revenueExpr)
                .from(purchase)
                .join(purchase.ebook, ebook)
                .where(
                        ebook.publisher.id.eq(publisherId),
                        monthExpr.in(months)
                )
                .groupBy(monthExpr)
                .fetch();

        Map<String, Long> revenueMap = resultTuples.stream()
                .collect(Collectors.toMap(
                        t -> t.get(monthExpr),
                        t -> Optional.ofNullable(t.get(revenueExpr)).orElse(0L)
                ));

        // 2. 12개월 전체 기준으로 0포함 매출 리스트 구성
        return months.stream()
                .map(month -> new PublisherStatsResponse.MonthlyRevenue(month, revenueMap.getOrDefault(month, 0L)))
                .collect(Collectors.toList());
    }
    
    @Override
    public List<PublisherStatsResponse.SalesCountPerEbook> getIncreasedSalesCountsPerEbook(Long publisherId, LocalDate currentDate) {
        String previousMonth = YearMonth.from(currentDate).minusMonths(1).toString();

        QEbook ebook = QEbook.ebook;
        QEbookPurchase purchase = QEbookPurchase.ebookPurchase;

        StringTemplate purchaseMonthExpr = Expressions.stringTemplate("DATE_FORMAT({0}, '%Y-%m')", purchase.createdAt);

        return query.select(Projections.constructor(PublisherStatsResponse.SalesCountPerEbook.class,
                        ebook.id,
                        ebook.title,
                        purchase.id.count()
                ))
                .from(ebook)
                .leftJoin(purchase).on(
                        purchase.ebook.id.eq(ebook.id),
                        purchaseMonthExpr.eq(previousMonth)
                )
                .where(ebook.publisher.id.eq(publisherId))
                .groupBy(ebook.id)
                .fetch();
    }

    @Override
    public List<StatsPerEbookDto> getStatsPerEbook(Long publisherId) {
        QActivity activity = QActivity.activity;
        QEbookPurchase purchase = QEbookPurchase.ebookPurchase;
        QEbook ebook = QEbook.ebook;

        return query.select(Projections.constructor(StatsPerEbookDto.class,
                        ebook.id,
                        ebook.title,
                        ebook.author,
                        ebook.coverImageKey,
                        purchase.id.count(),
                        ebook.price.multiply(purchase.id.count()).castToNum(Long.class),
                        ebook.viewCount,
                        activity.id.count(),
                        ebook.createdAt
                ))
                .from(ebook)
                .leftJoin(purchase).on(purchase.ebook.id.eq(ebook.id))
                .leftJoin(activity).on(activity.book.id.eq(ebook.id))
                .where(ebook.publisher.id.eq(publisherId))
                .groupBy(ebook.id)
                .fetch();
    }
}
