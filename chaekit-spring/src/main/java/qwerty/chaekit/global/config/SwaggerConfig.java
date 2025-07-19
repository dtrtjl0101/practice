package qwerty.chaekit.global.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class SwaggerConfig {
    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Chaekit API")
                        .version("1.0")
                        .description("책잇 API 명세서"))
                .servers(List.of(
                        new Server().url("http://localhost:8080")
                                .description("Local Server"),
                        new Server().url("https://dev.api.chaekit.com")
                                .description("Development Server"),
                        new Server().url("https://api.chaekit.com")
                                .description("Production Server")
                ))
                .components(new Components().addSecuritySchemes("BearerAuth",
                        new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")))
                .addSecurityItem(new SecurityRequirement().addList("BearerAuth"));
    }

    @Bean
    public GroupedOpenApi hideLoginMemberParams() {
        return GroupedOpenApi.builder()
                .group("springdoc-hidden")
                .addOperationCustomizer((operation, handlerMethod) -> {
                    if (operation.getParameters() != null) {
                        operation.getParameters().removeIf(param ->
                                (param.getName().equals("userToken"))
                                        || param.getName().equals("token"));
                    }
                    return operation;
                })
                .pathsToMatch("/**") // 모든 경로에 대해 적용
                .build();
    }
}