package visualization.configuration;

import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.FilterType;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;

@Configuration
@EnableWebSocketMessageBroker
@ComponentScan(
        basePackages = {"visualization"},
        excludeFilters = {
                @ComponentScan.Filter(type = FilterType.ANNOTATION, value = EnableWebMvc.class)
        }
)
public class RootConfig {
}
