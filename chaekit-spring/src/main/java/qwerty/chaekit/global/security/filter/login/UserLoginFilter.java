package qwerty.chaekit.global.security.filter.login;


import org.springframework.security.authentication.AuthenticationManager;
import qwerty.chaekit.global.jwt.JwtUtil;
import qwerty.chaekit.global.properties.JwtProperties;
import qwerty.chaekit.global.util.SecurityRequestReader;
import qwerty.chaekit.global.util.SecurityResponseSender;

public class UserLoginFilter extends LoginFilter {
    public UserLoginFilter(String loginUrl, JwtProperties jwtProperties, JwtUtil jwtUtil, AuthenticationManager authManager, SecurityRequestReader reader, SecurityResponseSender sender) {
        super(loginUrl, jwtProperties, jwtUtil, authManager, reader, sender);
    }
}
