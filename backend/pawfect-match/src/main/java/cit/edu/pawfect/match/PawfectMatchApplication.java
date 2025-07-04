package cit.edu.pawfect.match;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import io.github.cdimascio.dotenv.Dotenv;

@SpringBootApplication
public class PawfectMatchApplication {

    public static void main(String[] args) {

        Dotenv dotenv = Dotenv.configure().ignoreIfMissing().load();

        String mongodbUri = dotenv.get("MONGODB_URI");
        String jwtSecret = dotenv.get("JWT_SECRET");
        String cloudinaryUrl = dotenv.get("CLOUDINARY_URL");

        // Set system properties if other parts of the app depend on them
        if (mongodbUri != null)
            System.setProperty("MONGODB_URI", mongodbUri);
        if (jwtSecret != null)
            System.setProperty("JWT_SECRET", jwtSecret);
        if (cloudinaryUrl != null)
            System.setProperty("CLOUDINARY_URL", cloudinaryUrl);

        SpringApplication.run(PawfectMatchApplication.class, args);

        System.out.println("Spring Boot is working!!");
    }

}