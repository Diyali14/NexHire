package com.airesumematcher.backend.rabbitmq.service;

import com.airesumematcher.backend.rabbitmq.config.RabbitMQConfig;
import com.airesumematcher.backend.rabbitmq.dto.MatcherProcessingMessage;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

@Service
public class MatcherMessageProducer {

    private final RabbitTemplate rabbitTemplate;

    public MatcherMessageProducer(
            RabbitTemplate rabbitTemplate
    ) {
        this.rabbitTemplate = rabbitTemplate;
    }

    public void publish(
            MatcherProcessingMessage message
    ) {

        rabbitTemplate.convertAndSend(
                RabbitMQConfig.MATCHER_EXCHANGE,
                RabbitMQConfig.MATCHER_ROUTING_KEY,
                message
        );
    }
}