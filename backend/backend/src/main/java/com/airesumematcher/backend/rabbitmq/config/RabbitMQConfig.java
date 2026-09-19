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

    // =========================================================
    // RESUME INPUT
    // Spring Boot -> Python AI Service
    // =========================================================

    public static final String RESUME_EXCHANGE =
            "resume.exchange";

    public static final String RESUME_QUEUE =
            "resume.queue";

    public static final String RESUME_ROUTING_KEY =
            "resume.process";


    // =========================================================
    // RESUME RESULT
    // Python AI Service -> Spring Boot
    // =========================================================

    public static final String RESUME_RESULT_EXCHANGE =
            "resume.result.exchange";

    public static final String RESUME_RESULT_QUEUE =
            "resume.result.queue";

    public static final String RESUME_RESULT_ROUTING_KEY =
            "resume.result";


    // =========================================================
    // JOB / JD
    // Keep these for later
    // =========================================================

    public static final String JOB_EXCHANGE =
            "job.exchange";

    public static final String JOB_QUEUE =
            "job.queue";

    public static final String JOB_ROUTING_KEY =
            "job.process";


    // =========================================================
    // RESUME INPUT RABBITMQ
    // =========================================================

    @Bean
    public DirectExchange resumeExchange() {

        return new DirectExchange(
                RESUME_EXCHANGE
        );
    }

    @Bean
    public Queue resumeQueue() {

        return new Queue(
                RESUME_QUEUE,
                true
        );
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


    // =========================================================
    // RESUME RESULT RABBITMQ
    // =========================================================

    @Bean
    public DirectExchange resumeResultExchange() {

        return new DirectExchange(
                RESUME_RESULT_EXCHANGE
        );
    }

    @Bean
    public Queue resumeResultQueue() {

        return new Queue(
                RESUME_RESULT_QUEUE,
                true
        );
    }

    @Bean
    public Binding resumeResultBinding(
            Queue resumeResultQueue,
            DirectExchange resumeResultExchange
    ) {

        return BindingBuilder
                .bind(resumeResultQueue)
                .to(resumeResultExchange)
                .with(RESUME_RESULT_ROUTING_KEY);
    }


    // =========================================================
    // JOB RABBITMQ
    // Leave this untouched for now
    // =========================================================

    @Bean
    public DirectExchange jobExchange() {

        return new DirectExchange(
                JOB_EXCHANGE
        );
    }

    @Bean
    public Queue jobQueue() {

        return new Queue(
                JOB_QUEUE,
                true
        );
    }

    @Bean
    public Binding jobBinding(
            Queue jobQueue,
            DirectExchange jobExchange
    ) {

        return BindingBuilder
                .bind(jobQueue)
                .to(jobExchange)
                .with(JOB_ROUTING_KEY);
    }


    // =========================================================
    // JSON MESSAGE CONVERTER
    // =========================================================

    @Bean
    public JacksonJsonMessageConverter jacksonJsonMessageConverter() {

        return new JacksonJsonMessageConverter();
    }


    // =========================================================
    // RABBIT TEMPLATE
    // =========================================================

    @Bean
    public RabbitTemplate rabbitTemplate(
            ConnectionFactory connectionFactory,
            JacksonJsonMessageConverter messageConverter
    ) {

        RabbitTemplate rabbitTemplate =
                new RabbitTemplate(
                        connectionFactory
                );

        rabbitTemplate.setMessageConverter(
                messageConverter
        );

        return rabbitTemplate;
    }
}

