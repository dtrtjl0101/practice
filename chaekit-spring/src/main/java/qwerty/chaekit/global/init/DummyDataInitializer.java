package qwerty.chaekit.global.init;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Component
@RequiredArgsConstructor
@Profile(value = {"local", "dev"})
@Order(2)
public class DummyDataInitializer implements ApplicationRunner {
    private final DummyUserFactory dummyUserFactory;
    private final DummyPublisherFactory dummyPublisherFactory;
    private final DummyEbookFactory dummyEbookFactory;
    private final DummyGroupFactory dummyGroupFactory;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        log.info("더미 데이터를 생성을 시도합니다.");
        dummyUserFactory.saveDummyUsers();
        dummyPublisherFactory.saveDummyPublishers();
        dummyEbookFactory.saveDummyEbooks();
        dummyGroupFactory.saveDummyGroups();
    }
}
