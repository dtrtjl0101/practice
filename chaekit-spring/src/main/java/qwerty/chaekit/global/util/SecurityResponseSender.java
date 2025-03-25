package qwerty.chaekit.global.util;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import qwerty.chaekit.global.response.ApiErrorResponse;
import qwerty.chaekit.global.response.ApiSuccessResponse;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class SecurityResponseSender {
    private final ObjectMapper objectMapper;

    public void sendError(HttpServletResponse response, int status, String code, String message) throws IOException {
        sendResponse(response, status, ApiErrorResponse.of(code, message));
    }

    public <T> void sendSuccess(HttpServletResponse response, T data) throws IOException {
        sendResponse(response, HttpServletResponse.SC_OK, ApiSuccessResponse.of(data));
    }

    private void sendResponse(HttpServletResponse response, int status, Object object) throws IOException {
        response.setStatus(status);
        response.setContentType("application/json;charset=UTF-8");
        response.getWriter().write(objectMapper.writeValueAsString(object));
    }
}
