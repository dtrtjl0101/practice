package qwerty.chaekit.global.init;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import qwerty.chaekit.domain.group.ReadingGroup;
import qwerty.chaekit.domain.group.repository.GroupRepository;
import qwerty.chaekit.domain.member.user.UserProfile;
import qwerty.chaekit.domain.member.user.UserProfileRepository;
import qwerty.chaekit.global.init.dummy.DummyGroup;
import qwerty.chaekit.global.init.dummy.DummyUser;

import java.util.Optional;

@Slf4j
@Component
@RequiredArgsConstructor
public class DummyGroupFactory {
    private final GroupRepository groupRepository;
    private final UserProfileRepository userProfileRepository;

    public void saveDummyGroups() {
        Optional<UserProfile> foundUser = userProfileRepository.findByNickname(DummyUser.LEADER.getNickname());
        if (foundUser.isEmpty()) {
            return;
        }
        UserProfile leader = foundUser.get();
        
        DummyGroup dummyGroup = DummyGroup.CLASSIC;
        ReadingGroup newGroup = ReadingGroup.builder()
                .name(dummyGroup.getName())
                .groupLeader(leader)
                .description(dummyGroup.getDescription())
                .groupImageKey(dummyGroup.getGroupImageKey())
                .build();
        
        if(!groupRepository.existsReadingGroupByName(newGroup.getName())) {
            ReadingGroup savedGroup = groupRepository.save(newGroup);
            savedGroup.addMember(leader).approve();
            savedGroup.addTags(dummyGroup.getTags());
            log.info("독서 모임\"{}\"이 새로 생성되었습니다.", newGroup.getName());
        }
    }
}
