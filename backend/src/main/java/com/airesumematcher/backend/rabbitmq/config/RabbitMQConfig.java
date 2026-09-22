package com.airesumematcher.backend.rabbitmq.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    // =========================================================
    // RESUME INPUT
    // Spring Boot -> Python AI Service
    // =========================================================

    public static final String RESUME_EXCHANGE = "resume.exchange";

    public static final String RESUME_QUEUE = "resume.queue";

    public static final String RESUME_ROUTING_KEY = "resume.process";


    // =========================================================
    // RESUME RESULT
    // Python AI Service -> Spring Boot
    // =========================================================

    public static final String RESUME_RESULT_EXCHANGE = "resume.result.exchange";

    public static final String RESUME_RESULT_QUEUE = "resume.result.queue";

    public static final String RESUME_RESULT_ROUTING_KEY = "resume.result";


    // =========================================================
    // JOB / JD
    // =========================================================

    public static final String JOB_EXCHANGE = "job.exchange";

    public static final String JOB_QUEUE = "job.queue";

    public static final String JOB_ROUTING_KEY = "job.process";


    // =========================================================
    // MATCHER
    // Spring Boot Application -> Matcher Consumer
    // =========================================================

    public static final String MATCHER_EXCHANGE = "resume.matcher.exchange";

    public static final String MATCHER_QUEUE = "resume.matcher.queue";

    public static final String MATCHER_ROUTING_KEY = "resume.matcher";


    // =========================================================
    // RESUME INPUT
    // =========================================================

    @Bean
    public DirectExchange resumeExchange() {

        return new DirectExchange(RESUME_EXCHANGE);
    }

    @Bean
    public Queue resumeQueue() {

        return new Queue(RESUME_QUEUE, true);
    }

    @Bean
    public Binding resumeBinding(Queue resumeQueue, DirectExchange resumeExchange) {

        return BindingBuilder.bind(resumeQueue)
                .to(resumeExchange).with(RESUME_ROUTING_KEY);
    }


    // =========================================================
    // RESUME RESULT
    // =========================================================

    @Bean
    public DirectExchange resumeResultExchange() {

        return new DirectExchange(RESUME_RESULT_EXCHANGE);
    }

    @Bean
    public Queue resumeResultQueue() {

        return new Queue(RESUME_RESULT_QUEUE, true);
    }

    @Bean
    public Binding resumeResultBinding(Queue resumeResultQueue, DirectExchange resumeResultExchange) {

        return BindingBuilder.bind(resumeResultQueue).to(resumeResultExchange).with(RESUME_RESULT_ROUTING_KEY);
    }


    // =========================================================
    // JOB / JD
    // =========================================================

    @Bean
    public DirectExchange jobExchange() {

        return new DirectExchange(JOB_EXCHANGE);
    }

    @Bean
    public Queue jobQueue() {

        return new Queue(JOB_QUEUE, true);
    }

    @Bean
    public Binding jobBinding(Queue jobQueue, DirectExchange jobExchange) {

        return BindingBuilder.bind(jobQueue).to(jobExchange).with(JOB_ROUTING_KEY);
    }


    // =========================================================
    // MATCHER
    // =========================================================

    @Bean
    public DirectExchange matcherExchange() {

        return new DirectExchange(MATCHER_EXCHANGE);
    }

    @Bean
    public Queue matcherQueue() {

        return new Queue(MATCHER_QUEUE, true);
    }

    @Bean
    public Binding matcherBinding(Queue matcherQueue, DirectExchange matcherExchange) {

        return BindingBuilder.bind(matcherQueue)
                .to(matcherExchange).with(MATCHER_ROUTING_KEY);
    }


    // =========================================================
    // JSON MESSAGE CONVERTER
    // =========================================================

    @Bean
    public Jackson2JsonMessageConverter jackson2JsonMessageConverter() {

        return new Jackson2JsonMessageConverter();
    }


    // =========================================================
    // RABBIT TEMPLATE
    // =========================================================

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory, Jackson2JsonMessageConverter messageConverter) {

        RabbitTemplate rabbitTemplate = new RabbitTemplate(connectionFactory);

        rabbitTemplate.setMessageConverter(messageConverter);

        return rabbitTemplate;
    }
}