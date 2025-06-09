package qwerty.chaekit.service.group;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import qwerty.chaekit.domain.group.ReadingGroup;
import qwerty.chaekit.domain.group.chat.GroupChat;
import qwerty.chaekit.domain.group.chat.repository.GroupChatRepository;
import qwerty.chaekit.domain.member.user.UserProfile;
import qwerty.chaekit.dto.group.chat.GroupChatRequest;
import qwerty.chaekit.dto.group.chat.GroupChatResponse;
import qwerty.chaekit.dto.page.PageResponse;
import qwerty.chaekit.global.enums.ErrorCode;
import qwerty.chaekit.global.exception.ForbiddenException;
import qwerty.chaekit.global.security.resolver.UserToken;
import qwerty.chaekit.service.util.EntityFinder;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class GroupChatService {
    private final GroupChatRepository groupChatRepository;
    private final EntityFinder entityFinder;
    private final GroupChatProducer groupChatProducer;
    //private final GroupChatConsumer groupChatConsumer;

    @Transactional
    public GroupChatResponse createChat(UserToken userToken, Long groupId, GroupChatRequest request) {
        UserProfile user = entityFinder.findUser(userToken.userId());
        ReadingGroup group = entityFinder.findGroup(groupId);

        if (group.isNotAcceptedMember(user)) {
            throw new ForbiddenException(ErrorCode.MEMBER_NOT_FOUND);
        }

        GroupChat chat = GroupChat.builder()
                .group(group)
                .author(user)
                .content(request.content())
                .build();
        
        GroupChat savedChat = groupChatRepository.save(chat);

        GroupChatResponse response = GroupChatResponse.builder()
                .chatId(savedChat.getId())
                .groupId(groupId)
                .authorId(user.getId())
                .authorName(user.getNickname())
                .authorProfileImage(user.getProfileImageKey())
                .content(request.content())
                .createdAt(savedChat.getCreatedAt())
                .build();

        groupChatProducer.sendMessage(response);

        return response;
    }

    public PageResponse<GroupChatResponse> getChats(Long groupId, Pageable pageable) {//과거메세지 받아오는용도
        ReadingGroup group = entityFinder.findGroup(groupId);
        Page<GroupChat> savedChats = groupChatRepository.findByGroupOrderByCreatedAtDesc(group, pageable);
        //groupChatConsumer.subscribeToGroupChat(groupId);
        return PageResponse.of(savedChats.map(GroupChatResponse::of));
    }
}   