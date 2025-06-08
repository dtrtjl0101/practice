package qwerty.chaekit;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableJpaAuditing
@EnableScheduling
@SpringBootApplication(
		exclude = {
				org.springframework.boot.autoconfigure.data.redis.RedisRepositoriesAutoConfiguration.class
		}
)
@ConfigurationPropertiesScan
public class ChaekitApplication {

	public static void main(String[] args) {
		SpringApplication.run(ChaekitApplication.class, args);
	}

}