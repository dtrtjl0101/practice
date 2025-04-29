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
        Class<?> parameterType = parameter.getParameterType();
        return parameter.hasParameterAnnotation(Login.class)
                && (parameterType.equals(UserToken.class) || parameterType.equals(PublisherToken.class));
    }

    @Override
    public Object resolveArgument(@NonNull MethodParameter parameter, ModelAndViewContainer mavContainer,
                                  @NonNull NativeWebRequest webRequest, WebDataBinderFactory binderFactory) {
        Login loginAnnotation = parameter.getParameterAnnotation(Login.class);
        boolean isRequired = loginAnnotation != null && loginAnnotation.required();

        Role requiredRole = determineRequiredRole(parameter.getParameterType());
        CustomUserDetails userDetails = getAuthenticatedUserDetails();

        return resolveToken(requiredRole, userDetails, isRequired);
    }

    private Role determineRequiredRole(Class<?> parameterType) {
        if (parameterType.equals(UserToken.class)) {
            return Role.ROLE_USER;
        } else if (parameterType.equals(PublisherToken.class)) {
            return Role.ROLE_PUBLISHER;
        } else {
            throw new IllegalArgumentException("Unsupported parameter type: " + parameterType);
        }
    }

    private CustomUserDetails getAuthenticatedUserDetails() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new IllegalStateException("SecurityContext에 인증 정보가 없습니다.");
        }
        if (!(auth.getPrincipal() instanceof CustomUserDetails details)) {
            throw new IllegalStateException("인증된 사용자 정보가 CustomUserDetails 타입이 아닙니다.");
        }
        return details;
    }

    private Object resolveToken(Role requiredRole, CustomUserDetails userDetails, boolean isRequired) {
        if (requiredRole == Role.ROLE_USER) {
            return resolveUserToken(userDetails, isRequired);
        } else { // Role.ROLE_PUBLISHER
            return resolvePublisherToken(userDetails);
        }
    }

    private Object resolveUserToken(CustomUserDetails userDetails, boolean isRequired) {
        if (userDetails.user() == null) {
            return handleNoUserRole(isRequired);
        }
        return UserToken.of(userDetails.member().getId(), userDetails.user().getId(), userDetails.member().getEmail());
    }

    private Object handleNoUserRole(boolean isRequired) {
        if (isRequired) {
            throw new ForbiddenException(ErrorCode.ONLY_USER);
        }
        return UserToken.anonymous();
    }

    private Object resolvePublisherToken(CustomUserDetails userDetails) {
        if (userDetails.publisher() == null) {
            throw new ForbiddenException(ErrorCode.ONLY_PUBLISHER);
        }
        return PublisherToken.of(userDetails.member().getId(), userDetails.publisher().getId(), userDetails.member().getEmail());
    }

}
