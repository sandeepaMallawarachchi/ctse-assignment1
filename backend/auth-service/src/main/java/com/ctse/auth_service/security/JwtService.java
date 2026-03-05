package com.ctse.auth_service.security;

import com.ctse.auth_service.model.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class JwtService {

    private final JwtProperties jwtProperties;

    public String generateToken(User user) {
        long nowMillis = System.currentTimeMillis();
        long expMillis = nowMillis + jwtProperties.getExpirationMinutes() * 60 * 1000;

        return Jwts.builder()
                .subject(user.getEmail())
                .issuer(jwtProperties.getIssuer())
                .claim("userId", user.getId())
                .claim("roles", user.getRoles())
                .issuedAt(new Date(nowMillis))
                .expiration(new Date(expMillis))
                .signWith(getSigningKey())
                .compact();
    }

    public boolean isTokenValid(String token) {
        try {
            Claims claims = parseClaims(token);
            return jwtProperties.getIssuer().equals(claims.getIssuer());
        } catch (JwtException | IllegalArgumentException ex) {
            return false;
        }
    }

    public String extractEmail(String token) {
        return parseClaims(token).getSubject();
    }

    public String extractUserId(String token) {
        return parseClaims(token).get("userId", String.class);
    }

    public List<String> extractRoles(String token) {
        Object rolesClaim = parseClaims(token).get("roles");
        if (!(rolesClaim instanceof List<?> roles)) {
            return Collections.emptyList();
        }
        return roles.stream()
                .filter(String.class::isInstance)
                .map(String.class::cast)
                .map(role -> role.startsWith("ROLE_") ? role : "ROLE_" + role)
                .collect(Collectors.toList());
    }

    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private SecretKey getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(jwtProperties.getSecret());
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
