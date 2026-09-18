package com.airesumematcher.backend.rabbitmq.service;

import com.airesumematcher.backend.rabbitmq.config.RabbitMQConfig;
import com.airesumematcher.backend.rabbitmq.dto.JobProcessingMessage;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

@Service
public class JobMessageProducer {

    private final RabbitTemplate rabbitTemplate;

    public JobMessageProducer(
            RabbitTemplate rabbitTemplate
    ) {
        this.rabbitTemplate = rabbitTemplate;
    }

    public void publish(
            JobProcessingMessage message
    ) {

        rabbitTemplate.convertAndSend(
                RabbitMQConfig.JOB_EXCHANGE,
                RabbitMQConfig.JOB_ROUTING_KEY,
                message
        );
    }
}