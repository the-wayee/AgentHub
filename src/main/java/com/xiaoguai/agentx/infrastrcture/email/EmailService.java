package com.xiaoguai.agentx.infrastrcture.email;

import jakarta.mail.Authenticator;
import jakarta.mail.Message;
import jakarta.mail.MessagingException;
import jakarta.mail.PasswordAuthentication;
import jakarta.mail.Session;
import jakarta.mail.Transport;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Properties;
import java.util.concurrent.CompletableFuture;

/**
 * @Author: the-way
 * @Verson: v1.0
 * @Date: 2025-10-05 13:21
 * @Description: 邮箱服务
 */
@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    @Value("${mail.smtp.host}")
    private String host;

    @Value("${mail.smtp.port}")
    private int port;

    @Value("${mail.smtp.username}")
    private String username;

    @Value("${mail.smtp.password}")
    private String password;

    @Value("${mail.verification.subject}")
    private String verificationSubject;

    @Value("${mail.verification.template}")
    private String verificationTemplate;

    @Value("${mail.smtp.auth:true}")
    private boolean authEnabled;

    @Value("${mail.smtp.starttls.enable:true}")
    private boolean starttlsEnabled;

    @Value("${mail.smtp.ssl.enable:false}")
    private boolean sslEnabled;

    @Value("${mail.smtp.timeout:30000}")
    private int timeout;

    @Value("${mail.smtp.connectiontimeout:30000}")
    private int connectionTimeout;

    /**
     * 创建邮件会话
     */
    private Session createMailSession() {
        Properties props = new Properties();

        // SMTP服务器配置
        props.put("mail.smtp.host", host);
        props.put("mail.smtp.port", port);
        props.put("mail.smtp.auth", authEnabled);
        props.put("mail.smtp.starttls.enable", starttlsEnabled);
        props.put("mail.smtp.ssl.enable", sslEnabled);
        props.put("mail.smtp.timeout", timeout);
        props.put("mail.smtp.connectiontimeout", connectionTimeout);

        // 连接池配置
        props.put("mail.smtp.connectionpool", true);
        props.put("mail.smtp.connectionpoolsize", 10);

        // 调试模式
        props.put("mail.debug", log.isDebugEnabled());

        // 如果需要认证
        if (authEnabled) {
            Authenticator authenticator = new Authenticator() {
                @Override
                protected PasswordAuthentication getPasswordAuthentication() {
                    return new PasswordAuthentication(username, password);
                }
            };
            return Session.getInstance(props, authenticator);
        } else {
            return Session.getInstance(props);
        }
    }

    /**
     * 发送验证码邮件
     *
     * @param to 收件人邮箱
     * @param verificationCode 验证码
     * @return 发送结果
     */
    public boolean sendVerificationEmail(String to, String verificationCode) {
        try {
            String content = String.format(verificationTemplate, verificationCode);
            return sendEmail(to, verificationSubject, content);
        } catch (Exception e) {
            log.error("发送验证码邮件失败, 收件人: {}, 验证码: {}", to, verificationCode, e);
            return false;
        }
    }

    /**
     * 发送验证码邮件（异步）
     *
     * @param to 收件人邮箱
     * @param verificationCode 验证码
     * @return CompletableFuture 包装发送结果
     */
    public CompletableFuture<Boolean> sendVerificationEmailAsync(String to, String verificationCode) {
        return CompletableFuture.supplyAsync(() -> sendVerificationEmail(to, verificationCode));
    }

    /**
     * 发送普通邮件
     *
     * @param to 收件人邮箱
     * @param subject 邮件主题
     * @param content 邮件内容
     * @return 发送结果
     */
    public boolean sendEmail(String to, String subject, String content) {
        return sendEmail(new String[]{to}, subject, content);
    }

    /**
     * 发送普通邮件（异步）
     *
     * @param to 收件人邮箱
     * @param subject 邮件主题
     * @param content 邮件内容
     * @return CompletableFuture 包装发送结果
     */
    public CompletableFuture<Boolean> sendEmailAsync(String to, String subject, String content) {
        return CompletableFuture.supplyAsync(() -> sendEmail(to, subject, content));
    }

    /**
     * 发送邮件给多个收件人
     *
     * @param recipients 收件人邮箱数组
     * @param subject 邮件主题
     * @param content 邮件内容
     * @return 发送结果
     */
    public boolean sendEmail(String[] recipients, String subject, String content) {
        if (recipients == null || recipients.length == 0) {
            log.warn("收件人列表为空，无法发送邮件");
            return false;
        }

        try {
            Session session = createMailSession();
            MimeMessage message = new MimeMessage(session);

            // 设置发件人
            message.setFrom(new InternetAddress(username));

            // 设置收件人
            InternetAddress[] addresses = new InternetAddress[recipients.length];
            for (int i = 0; i < recipients.length; i++) {
                addresses[i] = new InternetAddress(recipients[i]);
            }
            message.setRecipients(Message.RecipientType.TO, addresses);

            // 设置邮件主题和内容
            message.setSubject(subject, "UTF-8");
            message.setContent(content, "text/html; charset=UTF-8");

            // 发送邮件
            Transport.send(message);

            log.info("邮件发送成功, 收件人: {}, 主题: {}", String.join(",", recipients), subject);
            return true;

        } catch (MessagingException e) {
            log.error("邮件发送失败, 收件人: {}, 主题: {}", String.join(",", recipients), subject, e);
            return false;
        } catch (Exception e) {
            log.error("邮件发送时发生未知错误, 收件人: {}, 主题: {}", String.join(",", recipients), subject, e);
            return false;
        }
    }

    /**
     * 发送邮件给多个收件人（异步）
     *
     * @param recipients 收件人邮箱数组
     * @param subject 邮件主题
     * @param content 邮件内容
     * @return CompletableFuture 包装发送结果
     */
    public CompletableFuture<Boolean> sendEmailAsync(String[] recipients, String subject, String content) {
        return CompletableFuture.supplyAsync(() -> sendEmail(recipients, subject, content));
    }

    /**
     * 验证邮箱格式是否正确
     *
     * @param email 邮箱地址
     * @return 是否为有效邮箱格式
     */
    public boolean isValidEmail(String email) {
        if (email == null || email.trim().isEmpty()) {
            return false;
        }

        // 简单的邮箱格式验证正则表达式
        String emailRegex = "^[a-zA-Z0-9_+&*-]+(?:\\.[a-zA-Z0-9_+&*-]+)*@(?:[a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,7}$";
        return email.matches(emailRegex);
    }

    /**
     * 测试邮件配置是否正确
     *
     * @param testEmail 测试邮箱
     * @return 测试结果
     */
    public boolean testEmailConfiguration(String testEmail) {
        if (!isValidEmail(testEmail)) {
            log.warn("测试邮箱格式不正确: {}", testEmail);
            return false;
        }

        String testSubject = "AgentHub 邮件服务测试";
        String testContent = """
            <html>
            <body>
                <h2>邮件服务测试成功！</h2>
                <p>如果您收到此邮件，说明 AgentHub 的邮件服务配置正确。</p>
                <p>发送时间: %s</p>
                <p>此为系统自动发送的测试邮件，请勿回复。</p>
            </body>
            </html>
            """.formatted(java.time.LocalDateTime.now().toString());

        return sendEmail(testEmail, testSubject, testContent);
    }
}
