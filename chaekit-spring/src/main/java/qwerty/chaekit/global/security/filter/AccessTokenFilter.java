package qwerty.chaekit.global.security.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;
import qwerty.chaekit.domain.member.Member;
import qwerty.chaekit.domain.member.enums.Role;
//import qwerty.chaekit.domain.member.publisher.PublisherProfile;
import qwerty.chaekit.domain.member.user.UserProfile;
import qwerty.chaekit.global.jwt.JwtUtil;
import qwerty.chaekit.global.jwt.TokenParsingResult;
import qwerty.chaekit.global.security.model.CustomUserDetails;

import java.io.IOException;

@Slf4j
@RequiredArgsConstructor
public class AccessTokenFilter extends OncePerRequestFilter {
    private final JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull FilterChain filterChain) throws ServletException, IOException {
        //request에서 Authorization 헤더를 찾음
        String authorization= request.getHeader("Authorization");

        //Authorization 헤더 검증
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authorization.split(" ")[1];

        TokenParsingResult parsedToken = jwtUtil.parseAccessToken(token);
        request.setAttribute("TOKEN_STATUS", parsedToken.getStatus());
        if (!parsedToken.isValid()) {
            filterChain.doFilter(request, response);
            return;
        }

        Member member = Member.builder()
                .id(parsedToken.memberId())
                .email(parsedToken.email())
                .role(Role.from(parsedToken.role()))
                .build();
//        PublisherProfile publisher = parsedToken.publisherId() != null ?
//                PublisherProfile.builder()
//                        .id(parsedToken.publisherId())
//                        .build()
//                : null;
        UserProfile user = parsedToken.userId() != null ?
                UserProfile.builder()
                        .id(parsedToken.userId())
                        .build()
                : null;

        CustomUserDetails customUserDetails = new CustomUserDetails(member, user);

        Authentication authToken = new UsernamePasswordAuthenticationToken(customUserDetails, null, customUserDetails.getAuthorities());

        SecurityContextHolder.getContext().setAuthentication(authToken);

        filterChain.doFilter(request, response);
    }
}
