package com.airesumematcher.backend.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI resumeMatcherOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("AI Resume Screener & Job Matcher API")
                        .version("v1")
                        .description(
                                "Backend REST API for the AI Resume Screener & Job Matcher application."
                        )
                );
    }
}