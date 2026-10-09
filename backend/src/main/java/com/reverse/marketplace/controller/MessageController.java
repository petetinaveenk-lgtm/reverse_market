package com.reverse.marketplace.controller;

import com.reverse.marketplace.entity.Message;
import com.reverse.marketplace.service.MessageService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
@CrossOrigin(origins = "*")
public class MessageController {

    private final MessageService messageService;

    public MessageController(MessageService messageService) {
        this.messageService = messageService;
    }

    // =========================
    // SEND MESSAGE
    // =========================

    @PostMapping
    public ResponseEntity<Message> sendMessage(
            @RequestBody Message message
    ) {

        return ResponseEntity.ok(
                messageService.sendMessage(message)
        );
    }

    // =========================
    // GET MESSAGES BY REQUIREMENT
    // =========================

    @GetMapping("/requirement/{requirementId}")
    public ResponseEntity<List<Message>> getMessages(
            @PathVariable Long requirementId
    ) {

        return ResponseEntity.ok(
                messageService.getMessagesByRequirement(
                        requirementId
                )
        );
    }

    // =========================
    // GET CONVERSATION
    // =========================

    @GetMapping("/conversation")
    public ResponseEntity<List<Message>> getConversation(
            @RequestParam Long senderId,
            @RequestParam Long receiverId
    ) {

        return ResponseEntity.ok(
                messageService.getConversation(
                        senderId,
                        receiverId
                )
        );
    }
}