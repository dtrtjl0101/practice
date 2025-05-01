package qwerty.chaekit.global.security.filter;

import io.jsonwebtoken.Claims;
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
import qwerty.chaekit.domain.member.publisher.PublisherProfile;
import qwerty.chaekit.domain.member.user.UserProfile;
import qwerty.chaekit.global.jwt.JwtUtil;
import qwerty.chaekit.global.security.model.CustomUserDetails;

import java.io.IOException;

@Slf4j
@RequiredArgsConstructor
public class JwtFilter extends OncePerRequestFilter {
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

        if (!jwtUtil.isValidAccessToken(token)) {
            filterChain.doFilter(request, response);
            return;
        }

        Claims parsedJwt = jwtUtil.parseJwt(token);
        Long memberId = jwtUtil.getMemberId(parsedJwt);
        Long userId = jwtUtil.getUserId(parsedJwt);
        Long publisherId = jwtUtil.getPublisherId(parsedJwt);
        String email = jwtUtil.getEmail(parsedJwt);
        String role = jwtUtil.getRole(parsedJwt);

        Member member = Member.builder()
                .id(memberId)
                .email(email)
                .role(Role.from(role))
                .build();
        PublisherProfile publisher = PublisherProfile.builder()
                .id(publisherId)
                .build();
        UserProfile user = UserProfile.builder()
                .id(userId)
                .build();

        CustomUserDetails customUserDetails = new CustomUserDetails(member, user, publisher);

        Authentication authToken = new UsernamePasswordAuthenticationToken(customUserDetails, null, customUserDetails.getAuthorities());

        SecurityContextHolder.getContext().setAuthentication(authToken);

        filterChain.doFilter(request, response);
    }
}
