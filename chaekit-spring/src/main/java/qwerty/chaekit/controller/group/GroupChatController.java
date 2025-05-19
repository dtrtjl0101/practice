package qwerty.chaekit.controller.group;

import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;
import qwerty.chaekit.dto.group.chat.GroupChatRequest;
import qwerty.chaekit.dto.group.chat.GroupChatResponse;
import qwerty.chaekit.dto.page.PageResponse;
import qwerty.chaekit.global.response.ApiSuccessResponse;
import qwerty.chaekit.global.security.resolver.Login;
import qwerty.chaekit.global.security.resolver.UserToken;
import qwerty.chaekit.service.group.GroupChatService;

@RestController
@RequestMapping("/api/groups/{groupId}/chats")
@RequiredArgsConstructor
public class GroupChatController {
    private final GroupChatService groupChatService;

    @PostMapping
    @Operation(summary = "그룹 채팅 메시지 작성", description = "그룹에 새로운 채팅 메시지를 작성합니다.")
    public ApiSuccessResponse<GroupChatResponse> createChat(
            @Login UserToken userToken,
            @PathVariable Long groupId,
            @Valid @RequestBody GroupChatRequest request
    ) {
        return ApiSuccessResponse.of(groupChatService.createChat(userToken, groupId, request));
    }

    @GetMapping
    @Operation(summary = "그룹 채팅 메시지 목록 조회", description = "그룹의 채팅 메시지 목록을 조회합니다.")
    public ApiSuccessResponse<PageResponse<GroupChatResponse>> getChats(
            @PathVariable Long groupId,
            @ParameterObject Pageable pageable
    ) {
        return ApiSuccessResponse.of(groupChatService.getChats(groupId, pageable));
    }
}