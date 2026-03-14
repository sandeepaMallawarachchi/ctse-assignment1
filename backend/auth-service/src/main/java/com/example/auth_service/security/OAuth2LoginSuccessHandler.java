package com.example.auth_service.security;

import com.example.auth_service.model.User;
import com.example.auth_service.service.AuthService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    private final AuthService authService;
    private final JwtService jwtService;
    private final JwtCookieService jwtCookieService;
    private final AppSecurityProperties securityProperties;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {

        OAuth2User oauthUser = (OAuth2User) authentication.getPrincipal();
        String email = oauthUser.getAttribute("email");
        String firstName = oauthUser.getAttribute("given_name");
        String lastName = oauthUser.getAttribute("family_name");
        String pictureUrl = oauthUser.getAttribute("picture");

        User user = authService.processGoogleUser(email, firstName, lastName, pictureUrl);
        String token = jwtService.generateToken(user);

        response.addHeader("Set-Cookie", jwtCookieService.buildAuthCookie(token).toString());
        response.sendRedirect(securityProperties.getFrontendSuccessUrl());
    }
}
