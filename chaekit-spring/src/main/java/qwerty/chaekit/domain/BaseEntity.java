package qwerty.chaekit.domain;

import jakarta.persistence.Column;
import jakarta.persistence.MappedSuperclass;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@MappedSuperclass
public abstract class BaseEntity {

    @Column(updatable = false)
    protected LocalDateTime createdAt;

    protected LocalDateTime modifiedAt;

    @PrePersist
    public void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }

    @PreUpdate
    public void onUpdate() {
        modifiedAt = LocalDateTime.now();
    }

    public void resetCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
