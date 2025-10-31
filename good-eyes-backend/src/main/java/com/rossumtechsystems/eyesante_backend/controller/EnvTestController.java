package com.rossumtechsystems.eyesante_backend.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/env-test")
@CrossOrigin(origins = "*")
public class EnvTestController {

    @Value("${spring.datasource.url:NOT_SET}")
    private String datasourceUrl;

    @Value("${spring.datasource.username:NOT_SET}")
    private String datasourceUsername;

    @Value("${spring.datasource.password:NOT_SET}")
    private String datasourcePassword;

    @Value("${app.jwt-secret:NOT_SET}")
    private String jwtSecret;

    @Value("${spring.mail.host:NOT_SET}")
    private String mailHost;

    @Value("${spring.mail.port:NOT_SET}")
    private String mailPort;

    @Value("${spring.mail.username:NOT_SET}")
    private String mailUsername;

    @Value("${spring.mail.password:NOT_SET}")
    private String mailPassword;

    @Value("${server.port:NOT_SET}")
    private String serverPort;

    @GetMapping("/config")
    public ResponseEntity<Map<String, Object>> getConfig() {
        Map<String, Object> config = new HashMap<>();
        
        // Database config
        config.put("datasource_url", datasourceUrl);
        config.put("datasource_username", datasourceUsername);
        config.put("datasource_password", datasourcePassword != null && !datasourcePassword.equals("NOT_SET") ? "***HIDDEN***" : "NOT_SET");
        
        // JWT config
        config.put("jwt_secret", jwtSecret != null && !jwtSecret.equals("NOT_SET") ? "***HIDDEN***" : "NOT_SET");
        
        // Mail config
        config.put("mail_host", mailHost);
        config.put("mail_port", mailPort);
        config.put("mail_username", mailUsername);
        config.put("mail_password", mailPassword != null && !mailPassword.equals("NOT_SET") ? "***HIDDEN***" : "NOT_SET");
        
        // Server config
        config.put("server_port", serverPort);
        
        // Environment info
        config.put("env_file_loaded", !datasourceUrl.equals("NOT_SET"));
        config.put("timestamp", System.currentTimeMillis());
        
        return ResponseEntity.ok(config);
    }
}
