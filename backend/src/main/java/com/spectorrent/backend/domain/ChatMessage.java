package com.spectorrent.backend.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "chat_messages")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // room id could be item-based or request-based
    @Column(nullable = false)
    private String roomId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "sender_id")
    private User sender;

    @Column(nullable = false, length = 2000)
    private String content;

    @Column(nullable = false)
    private Instant createdAt;

    /**
     * Whether this is a system/automated message (e.g. status change notification).
     * This column was auto-created by Hibernate ddl-auto:update in earlier runs.
     */
    @Builder.Default
    @Column(name = "system_message", nullable = false)
    private Boolean systemMessage = false;
}
