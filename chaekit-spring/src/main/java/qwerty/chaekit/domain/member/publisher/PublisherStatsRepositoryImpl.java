package qwerty.chaekit.domain.member.publisher;

import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.core.types.dsl.Expressions;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import qwerty.chaekit.domain.ebook.QEbook;
import qwerty.chaekit.domain.ebook.purchase.QEbookPurchase;
import qwerty.chaekit.domain.group.activity.QActivity;
import qwerty.chaekit.domain.member.publisher.dto.PublisherMainStatsDto;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class PublisherStatsRepositoryImpl implements PublisherStatsRepository {
    private final JPAQueryFactory query;

    @Override
    public PublisherMainStatsDto getPublisherMainStatistic(Long publisherId, LocalDate currentDate){
        YearMonth currentMonth = YearMonth.from(currentDate);
        YearMonth previousMonth = currentMonth.minusMonths(1);

        String currentMonthStr = currentMonth.toString();
        String previousMonthStr = previousMonth.toString();

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
        BooleanExpression isCurrentMonth = Expressions.stringTemplate("DATE_FORMAT({0}, '%Y-%m')", purchase.createdAt).eq(currentMonthStr);
        BooleanExpression isPreviousMonth = Expressions.stringTemplate("DATE_FORMAT({0}, '%Y-%m')", purchase.createdAt).eq(previousMonthStr);

        Long currentMonthSales = query.select(purchase.count())
                .from(purchase)
                .join(purchase.ebook, ebook)
                .where(ebook.publisher.id.eq(publisherId), isCurrentMonth)
                .fetchOne();

        Long previousMonthSales = query.select(purchase.count())
                .from(purchase)
                .join(purchase.ebook, ebook)
                .where(ebook.publisher.id.eq(publisherId), isPreviousMonth)
                .fetchOne();

        Integer currentMonthRevenue = query.select(ebook.price.sum())
                .from(purchase)
                .join(purchase.ebook, ebook)
                .where(ebook.publisher.id.eq(publisherId), isCurrentMonth)
                .fetchOne();

        Integer previousMonthRevenue = query.select(ebook.price.sum())
                .from(purchase)
                .join(purchase.ebook, ebook)
                .where(ebook.publisher.id.eq(publisherId), isPreviousMonth)
                .fetchOne();

        BooleanExpression actCurrentMonth = Expressions.stringTemplate("DATE_FORMAT({0}, '%Y-%m')", activity.createdAt).eq(currentMonthStr);
        BooleanExpression actPreviousMonth = Expressions.stringTemplate("DATE_FORMAT({0}, '%Y-%m')", activity.createdAt).eq(previousMonthStr);

        Long currentMonthActivityCount = query.select(activity.count())
                .from(activity)
                .join(activity.book, ebook)
                .where(ebook.publisher.id.eq(publisherId), actCurrentMonth)
                .fetchOne();

        Long previousMonthActivityCount = query.select(activity.count())
                .from(activity)
                .join(activity.book, ebook)
                .where(ebook.publisher.id.eq(publisherId), actPreviousMonth)
                .fetchOne();

        return new PublisherMainStatsDto(
                Optional.ofNullable(totalSalesCount).orElse(0L),
                Long.valueOf(Optional.ofNullable(totalRevenue).orElse(0)),
                Optional.ofNullable(totalActivityCount).orElse(0L),
                Optional.ofNullable(totalViewCount).orElse(0L),
                Optional.ofNullable(currentMonthSales).orElse(0L),
                Optional.ofNullable(previousMonthSales).orElse(0L),
                Long.valueOf(Optional.ofNullable(currentMonthRevenue).orElse(0)),
                Long.valueOf(Optional.ofNullable(previousMonthRevenue).orElse(0)),
                Optional.ofNullable(currentMonthActivityCount).orElse(0L),
                Optional.ofNullable(previousMonthActivityCount).orElse(0L)
        );
    
    }
}
