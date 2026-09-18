package com.airesumematcher.backend.rabbitmq.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.JacksonJsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String RESUME_EXCHANGE = "resume.exchange";
    public static final String RESUME_QUEUE = "resume.queue";
    public static final String RESUME_ROUTING_KEY = "resume.process";

    @Bean
    public DirectExchange resumeExchange() {
        return new DirectExchange(RESUME_EXCHANGE);
    }

    @Bean
    public Queue resumeQueue() {
        return new Queue(RESUME_QUEUE, true);
    }

    @Bean
    public Binding resumeBinding(
            Queue resumeQueue,
            DirectExchange resumeExchange
    ) {
        return BindingBuilder
                .bind(resumeQueue)
                .to(resumeExchange)
                .with(RESUME_ROUTING_KEY);
    }

    @Bean
    public JacksonJsonMessageConverter jacksonJsonMessageConverter() {
        return new JacksonJsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(
            ConnectionFactory connectionFactory,
            JacksonJsonMessageConverter messageConverter
    ) {
        RabbitTemplate rabbitTemplate = new RabbitTemplate(connectionFactory);
        rabbitTemplate.setMessageConverter(messageConverter);
        return rabbitTemplate;
    }
}