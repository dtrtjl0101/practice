package qwerty.chaekit.global.security.resolver;

import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.MethodParameter;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;
import qwerty.chaekit.domain.member.enums.Role;
import qwerty.chaekit.global.enums.ErrorCode;
import qwerty.chaekit.global.exception.ForbiddenException;
import qwerty.chaekit.global.security.model.CustomUserDetails;

@Slf4j
@Component
@RequiredArgsConstructor
public class LoginArgumentResolver implements HandlerMethodArgumentResolver {

    @Override
    public boolean supportsParameter(MethodParameter parameter) {
        return parameter.hasParameterAnnotation(Login.class)
                && (
                        parameter.getParameterType().equals(UserToken.class)
                        || parameter.getParameterType().equals(PublisherToken.class));
    }

    @Override
    public Object resolveArgument(@NonNull MethodParameter parameter, ModelAndViewContainer mavContainer,
                                  @NonNull NativeWebRequest webRequest, WebDataBinderFactory binderFactory) {
        // @Login 어노테이션이 붙은 파라미터의 타입에 따라 requiredRole을 설정
        final Role requiredRole;
        if(parameter.getParameterType().equals(UserToken.class)) {
            requiredRole = Role.ROLE_USER;
        } else if (parameter.getParameterType().equals(PublisherToken.class)) {
            requiredRole = Role.ROLE_PUBLISHER;
        } else {
            throw new IllegalArgumentException("Unsupported parameter type: " + parameter.getParameterType());
        }

        // CustomUserDetails를 SecurityContext에서 가져옴
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new IllegalStateException("SecurityContext에 인증 정보가 없습니다.");
        }
        if (!(auth.getPrincipal() instanceof CustomUserDetails details)) { // if annonymous user
            if(requiredRole == Role.ROLE_USER) {
                throw new ForbiddenException(ErrorCode.ONLY_USER);
            } else { // if (requiredRole == Role.ROLE_PUBLISHER)
                throw new ForbiddenException(ErrorCode.ONLY_PUBLISHER);
            }
        }

        if (requiredRole == Role.ROLE_USER) {
            if (details.user() == null) {
                throw new ForbiddenException(ErrorCode.ONLY_USER);
            }
            return UserToken.builder()
                    .memberId(details.member().getId())
                    .email(details.member().getEmail())
                    .userId(details.user().getId())
                    .build();
        } else { // if (requiredRole == Role.ROLE_PUBLISHER)
            if (details.publisher() == null) {
                throw new ForbiddenException(ErrorCode.ONLY_PUBLISHER);
            }
            return PublisherToken.builder()
                    .memberId(details.member().getId())
                    .publisherId(details.publisher().getId())
                    .email(details.member().getEmail())
                    .build();
        }
    }
}
