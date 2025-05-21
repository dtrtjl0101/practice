package qwerty.chaekit.dto.group.activity;

import jakarta.annotation.Nullable;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import org.hibernate.validator.constraints.Length;

import java.time.LocalDate;

@Builder
public record ActivityPostRequest(
        @NotNull
        Long bookId,
        @NotNull
        LocalDate startTime,
        @NotNull
        LocalDate endTime,
        @Nullable
        @Length(max = 5000)
        String description
) { }
