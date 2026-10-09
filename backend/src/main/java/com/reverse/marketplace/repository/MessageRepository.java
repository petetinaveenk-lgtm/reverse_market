package com.reverse.marketplace.repository;

import com.reverse.marketplace.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {

    List<Message> findByRequirementIdOrderBySentAtAsc(Long requirementId);

    List<Message> findBySenderIdAndReceiverIdOrderBySentAtAsc(
            Long senderId,
            Long receiverId
    );

    @Modifying
    @Query("DELETE FROM Message m WHERE m.sender.id = :userId")
    void deleteMessagesBySender(@Param("userId") Long userId);

    @Modifying
    @Query("DELETE FROM Message m WHERE m.receiver.id = :userId")
    void deleteMessagesByReceiver(@Param("userId") Long userId);

    @Modifying
    @Query("DELETE FROM Message m WHERE m.requirement.id = :requirementId")
    void deleteMessagesByRequirement(
            @Param("requirementId") Long requirementId
    );
}