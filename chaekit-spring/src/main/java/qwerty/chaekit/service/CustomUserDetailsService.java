package qwerty.chaekit.service;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import qwerty.chaekit.domain.Member.Member;
import qwerty.chaekit.dto.CustomUserDetails;
import qwerty.chaekit.domain.Member.MemberRepository;

@Service
public class CustomUserDetailsService implements UserDetailsService {
    private final MemberRepository memberRepository;

    public CustomUserDetailsService(MemberRepository memberRepository) {

        this.memberRepository = memberRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {

        Member userData = memberRepository.findByUsername(username);

        if (userData != null) {

            return new CustomUserDetails(userData);
        }
        return null;
    }
}
