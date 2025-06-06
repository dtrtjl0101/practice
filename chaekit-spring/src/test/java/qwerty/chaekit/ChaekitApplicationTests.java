package qwerty.chaekit;

import org.junit.jupiter.api.Test;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@ActiveProfiles("test")
@EnableAutoConfiguration(exclude = {
		org.springframework.boot.autoconfigure.kafka.KafkaAutoConfiguration.class
})
@SpringBootTest
class ChaekitApplicationTests {
	
	@Test
	void contextLoads() {
	}

}
