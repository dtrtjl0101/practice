package qwerty.chaekit.global.security.resolver;

import lombok.NonNull;
import lombok.RequiredArgsConstructor;
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
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new ForbiddenException(ErrorCode.NO_VALID_TOKEN);
        }
        if (!(auth.getPrincipal() instanceof CustomUserDetails userDetails)) {
            throw new IllegalStateException("Invalid authentication principal");
        }

        String role = userDetails.getAuthorities().iterator().next().getAuthority();
        if (parameter.getParameterType().equals(UserToken.class)) {
            if (!role.equals(Role.ROLE_USER.name()) && !role.equals(Role.ROLE_ADMIN.name())) {
                throw new ForbiddenException(ErrorCode.ONLY_USER);
            }
            return UserToken.builder()
                    .memberId(userDetails.getMemberId())
                    .userId(userDetails.getProfileId())
                    .email(userDetails.getEmail())
                    .role(role)
                    .build();
        } else if (parameter.getParameterType().equals(PublisherToken.class)) {
            if (!role.equals(Role.ROLE_PUBLISHER.name()) && !role.equals(Role.ROLE_ADMIN.name())) {
                throw new ForbiddenException(ErrorCode.ONLY_PUBLISHER);
            }
            return PublisherToken.builder()
                    .memberId(userDetails.getMemberId())
                    .publisherId(userDetails.getProfileId())
                    .email(userDetails.getEmail())
                    .role(role)
                    .build();
        }

        throw new IllegalArgumentException("Unsupported parameter type: " + parameter.getParameterType());
    }
}
