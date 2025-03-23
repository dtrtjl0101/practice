package qwerty.chaekit.domain;

import jakarta.persistence.Column;
import jakarta.persistence.MappedSuperclass;
import lombok.Getter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;

import java.time.LocalDateTime;

@Getter
@MappedSuperclass
public abstract class BaseEntity {
    @CreatedDate
    @Column(updatable = false)
    protected LocalDateTime createdAt;

    @LastModifiedDate
    protected LocalDateTime modifiedAt;
}