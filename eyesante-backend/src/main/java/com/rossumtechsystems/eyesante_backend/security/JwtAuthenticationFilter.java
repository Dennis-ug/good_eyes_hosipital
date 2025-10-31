package com.rossumtechsystems.eyesante_backend.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.rossumtechsystems.eyesante_backend.dto.ErrorResponse;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.security.SignatureException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    private ObjectMapper objectMapper;

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull FilterChain filterChain)
            throws ServletException, IOException {
        try {
            String jwt = getJwtFromRequest(request);

            if (StringUtils.hasText(jwt)) {
                try {
                    // First validate the token
                    if (tokenProvider.validateToken(jwt)) {
                        String username = tokenProvider.getUsernameFromJWT(jwt);

                        UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                                userDetails, null, userDetails.getAuthorities());
                        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                        SecurityContextHolder.getContext().setAuthentication(authentication);
                    } else {
                        // Token is invalid but not an exception - let it continue to be handled by Spring Security
                        logger.debug("Invalid JWT token");
                    }
                } catch (ExpiredJwtException ex) {
                    logger.error("JWT token has expired", ex);
                    handleJwtError(response, "Token Expired", "Your authentication token has expired. Please login again.");
                    return; // Stop the filter chain
                } catch (UnsupportedJwtException ex) {
                    logger.error("JWT token is unsupported", ex);
                    handleJwtError(response, "Unsupported Token", "The provided token format is not supported.");
                    return; // Stop the filter chain
                } catch (MalformedJwtException ex) {
                    logger.error("JWT token is malformed", ex);
                    handleJwtError(response, "Malformed Token", "The provided authentication token is malformed.");
                    return; // Stop the filter chain
                } catch (SignatureException ex) {
                    logger.error("JWT signature validation failed", ex);
                    handleJwtError(response, "Invalid Token Signature", "The token signature is invalid.");
                    return; // Stop the filter chain
                } catch (IllegalArgumentException ex) {
                    logger.error("JWT token is empty or null", ex);
                    handleJwtError(response, "Invalid Token", "The provided token is invalid.");
                    return; // Stop the filter chain
                }
            }
        } catch (Exception ex) {
            logger.error("Could not set user authentication in security context", ex);
            handleJwtError(response, "Authentication Error", "An error occurred during authentication.");
            return; // Stop the filter chain
        }

        filterChain.doFilter(request, response);
    }

    private void handleJwtError(HttpServletResponse response, String error, String message) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        
        ErrorResponse errorResponse = new ErrorResponse(
            HttpServletResponse.SC_UNAUTHORIZED,
            error,
            message,
            "JWT_AUTHENTICATION"
        );
        
        String jsonResponse = objectMapper.writeValueAsString(errorResponse);
        response.getWriter().write(jsonResponse);
        response.getWriter().flush();
    }

    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
} 