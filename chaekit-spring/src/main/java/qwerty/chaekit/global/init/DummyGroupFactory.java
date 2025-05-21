package qwerty.chaekit.global.init;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import qwerty.chaekit.domain.group.ReadingGroup;
import qwerty.chaekit.domain.group.repository.GroupRepository;
import qwerty.chaekit.domain.member.user.UserProfile;
import qwerty.chaekit.global.init.dummy.DummyGroup;

@Slf4j
@Component
@RequiredArgsConstructor
public class DummyGroupFactory {
    private final GroupRepository groupRepository;

    public void saveDummyGroups(UserProfile leader) {
        DummyGroup dummyPublisher = DummyGroup.CLASSIC;
        ReadingGroup dummyGroup = ReadingGroup.builder()
                .name(dummyPublisher.getName())
                .groupLeader(leader)
                .description(dummyPublisher.getDescription())
                .groupImageKey(dummyPublisher.getGroupImageKey())
                .build();
        
        if(!groupRepository.existsReadingGroupByName(dummyGroup.getName())) {
            ReadingGroup savedGroup = groupRepository.save(dummyGroup);
            savedGroup.addMember(leader).approve();
            log.info("독서 모임\"{}\"이 새로 생성되었습니다.", dummyGroup.getName());
        }
    }
}
