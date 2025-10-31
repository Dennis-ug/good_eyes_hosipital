package com.rossumtechsystems.eyesante_backend.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;

@Component
public class JwtTokenProvider {

    // @Value("${app.jwt-secret:your-very-long-secret-key-at-least-64-bytes-long-1234567890123456789012345678901234567890123456789012345678901234}")
    private String jwtSecret= "your-very-long-secret-key-at-least-64-bytes-long-1234567890123456789012345678901234567890123456789012345678901234";

    // @Value("${app.jwt-expiration-milliseconds:86400000}")
    private long jwtExpirationInMs= 86400000;

    // @Value("${app.jwt-refresh-expiration-milliseconds:604800000}")
    private long jwtRefreshExpirationInMs= 604800000;

    private SecretKey getSigningKey() {
        // Use the secret string directly as bytes (must be at least 64 bytes for HS512)
        byte[] keyBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
        if (keyBytes.length < 64) {
            throw new IllegalArgumentException("JWT secret key must be at least 64 bytes for HS512.");
        }
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public TokenInfo generateAccessToken(Authentication authentication) {
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationInMs);

        String token = Jwts.builder()
                .subject(userDetails.getUsername())
                .issuedAt(now)
                .expiration(expiryDate)
                .claim("type", "ACCESS")
                .signWith(getSigningKey(), Jwts.SIG.HS512)
                .compact();

        return new TokenInfo(token, LocalDateTime.ofInstant(expiryDate.toInstant(), ZoneId.systemDefault()));
    }

    public TokenInfo generateRefreshToken(Authentication authentication) {
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtRefreshExpirationInMs);

        String token = Jwts.builder()
                .subject(userDetails.getUsername())
                .issuedAt(now)
                .expiration(expiryDate)
                .claim("type", "REFRESH")
                .signWith(getSigningKey(), Jwts.SIG.HS512)
                .compact();

        return new TokenInfo(token, LocalDateTime.ofInstant(expiryDate.toInstant(), ZoneId.systemDefault()));
    }

    public String getUsernameFromJWT(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();

        return claims.getSubject();
    }

    public String getTokenType(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();

        return claims.get("type", String.class);
    }

    public boolean validateToken(String authToken) {
        try {
            Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(authToken);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    public boolean validateRefreshToken(String refreshToken) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(refreshToken)
                    .getPayload();
            
            String tokenType = claims.get("type", String.class);
            return "REFRESH".equals(tokenType);
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    // Helper class to return token and expiration time
    public static class TokenInfo {
        private final String token;
        private final LocalDateTime expiresAt;

        public TokenInfo(String token, LocalDateTime expiresAt) {
            this.token = token;
            this.expiresAt = expiresAt;
        }

        public String getToken() {
            return token;
        }

        public LocalDateTime getExpiresAt() {
            return expiresAt;
        }
    }
}
