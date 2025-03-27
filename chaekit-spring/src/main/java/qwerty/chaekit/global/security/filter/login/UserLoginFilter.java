package qwerty.chaekit.global.security.filter.login;


import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.stereotype.Component;
import qwerty.chaekit.global.jwt.JwtUtil;
import qwerty.chaekit.global.util.SecurityRequestReader;
import qwerty.chaekit.global.util.SecurityResponseSender;

@Component
public class UserLoginFilter extends LoginFilter {
    public UserLoginFilter(AuthenticationManager authManager, JwtUtil jwtUtil,
                           SecurityRequestReader reader, SecurityResponseSender sender) {
        super(authManager, jwtUtil, reader, sender);
        setAuthenticationManager(authManager);
        setFilterProcessesUrl("/api/users/login");
    }
}
