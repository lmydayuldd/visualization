package visualization.configuration;

import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.AbstractWebSocketMessageBrokerConfigurer;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketTransportRegistration;

@Configuration
@ComponentScan({"visualization"})
public class WebSocketConfig extends AbstractWebSocketMessageBrokerConfigurer {

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint(Messaging.ENPOINT).withSockJS();
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker(Messaging.BROCKER_DESTINATION_PREFIX);
        registry.setApplicationDestinationPrefixes(Messaging.APPLICATION_DESTINATION_PREFIX);
    }

    @Override
    public void configureWebSocketTransport(WebSocketTransportRegistration registration) {
        registration.setSendBufferSizeLimit((Messaging.MESSAGE_SIZE_LIMIT_KB + 1) * 1024);
        registration.setMessageSizeLimit(Messaging.MESSAGE_SIZE_LIMIT_KB * 1024);
    }

}
