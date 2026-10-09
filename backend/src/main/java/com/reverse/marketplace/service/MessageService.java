package com.reverse.marketplace.service;

import com.reverse.marketplace.entity.Message;
import com.reverse.marketplace.repository.MessageRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MessageService {

    private final MessageRepository messageRepository;

    public MessageService(MessageRepository messageRepository) {
        this.messageRepository = messageRepository;
    }

    public Message sendMessage(Message message) {
        return messageRepository.save(message);
    }

    public List<Message> getMessagesByRequirement(Long requirementId) {
        return messageRepository
                .findByRequirementIdOrderBySentAtAsc(requirementId);
    }

    public List<Message> getConversation(
            Long senderId,
            Long receiverId
    ) {
        return messageRepository
                .findBySenderIdAndReceiverIdOrderBySentAtAsc(
                        senderId,
                        receiverId
                );
    }
}