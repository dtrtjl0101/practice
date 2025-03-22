package qwerty.chaekit.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import qwerty.chaekit.domain.User;
import qwerty.chaekit.dto.AuthRequest;
import qwerty.chaekit.global.JwtUtil;
import qwerty.chaekit.service.MyUserDetailService;

import javax.naming.AuthenticationException;

@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final MyUserDetailService userDetailsService;
    private final JwtUtil jwtUtil;

    @PostMapping("/authenticate")
    public String createAuthenticationToken(@RequestBody AuthRequest authRequest) throws Exception {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(authRequest.getUsername(), authRequest.getPassword())
            );
        } catch (Exception e) {
            throw new Exception("Incorrect username or password", e);
        }

        final UserDetails userDetails = userDetailsService
                .loadUserByUsername(authRequest.getUsername());

        return jwtUtil.generateToken(userDetails.getUsername());
    }

    @PostMapping("/register")
    public User registerUser(@RequestBody User user) {
        return userDetailsService.save(user);
    }
}
