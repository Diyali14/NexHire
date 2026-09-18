package com.airesumematcher.backend.rabbitmq.service;

import com.airesumematcher.backend.rabbitmq.config.RabbitMQConfig;
import com.airesumematcher.backend.rabbitmq.dto.ResumeProcessingMessage;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

@Service
public class ResumeMessageProducer {

    private final RabbitTemplate rabbitTemplate;

    public ResumeMessageProducer(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    public void publish(ResumeProcessingMessage message) {

        rabbitTemplate.convertAndSend(
                RabbitMQConfig.RESUME_EXCHANGE,
                RabbitMQConfig.RESUME_ROUTING_KEY,
                message
        );
    }
}