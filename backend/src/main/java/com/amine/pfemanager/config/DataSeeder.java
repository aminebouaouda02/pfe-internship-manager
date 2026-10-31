package com.amine.pfemanager.config;

import com.amine.pfemanager.model.Application;
import com.amine.pfemanager.model.InternshipOffer;
import com.amine.pfemanager.model.Role;
import com.amine.pfemanager.model.User;
import com.amine.pfemanager.repository.ApplicationRepository;
import com.amine.pfemanager.repository.InternshipOfferRepository;
import com.amine.pfemanager.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Demo seed data, off by default.
 *
 * <p>Start the backend with {@code SEED_ENABLED=true} (see
 * {@code application.yml}) and this runner fills only tables that are still
 * empty, so restarting a seeded database never duplicates rows. It creates
 * two local demo accounts (a student, {@code demo}, and a supervisor,
 * {@code supervisor}, both with the demo password documented in the README),
 * 6 internship offers across several cities and skill sets, and 5
 * applications with different statuses — enough to click through the offers
 * pages, the applications pages and the dashboard without creating anything
 * by hand first.</p>
 *
 * <p>The demo password is a local placeholder, not a real credential: it
 * defaults to {@code demo12345} and can be overridden with the
 * {@code DEMO_PASSWORD} environment variable. Never enable seeding against a
 * shared or production database.</p>
 */
@Component
@ConditionalOnProperty(prefix = "app.seed", name = "enabled", havingValue = "true")
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final InternshipOfferRepository offerRepository;
    private final ApplicationRepository applicationRepository;
    private final PasswordEncoder passwordEncoder;
    private final String demoPassword;

    public DataSeeder(UserRepository userRepository,
                      InternshipOfferRepository offerRepository,
                      ApplicationRepository applicationRepository,
                      PasswordEncoder passwordEncoder,
                      @Value("${app.seed.demo-password:demo12345}") String demoPassword) {
        this.userRepository = userRepository;
        this.offerRepository = offerRepository;
        this.applicationRepository = applicationRepository;
        this.passwordEncoder = passwordEncoder;
        this.demoPassword = demoPassword;
    }

    @Override
    public void run(String... args) {
        seedDemoUsers();
        List<InternshipOffer> offers = seedOffers();
        seedApplications(offers);
    }

    private void seedDemoUsers() {
        seedDemoUser("demo", "demo@example.com", Role.ROLE_STUDENT);
        seedDemoUser("supervisor", "supervisor@example.com", Role.ROLE_SUPERVISOR);
    }

    private void seedDemoUser(String username, String email, Role role) {
        if (userRepository.findByUsername(username).isPresent()) {
            return;
        }
        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(demoPassword));
        user.setRole(role);
        userRepository.save(user);
    }

    private List<InternshipOffer> seedOffers() {
        if (offerRepository.count() > 0) {
            return offerRepository.findAll();
        }
        List<InternshipOffer> offers = List.of(
                new InternshipOffer("PFE Data Engineering Intern",
                        "Build Spark pipelines over sales data",
                        "Atlas Data", "Sara El Amrani", "Spark, SQL, Python", "Casablanca"),
                new InternshipOffer("Full-Stack Web Intern",
                        "Build a Spring Boot + React internal tool",
                        "NovaSoft", "Yassine Benali", "React, Spring Boot, PostgreSQL", "Rabat"),
                new InternshipOffer("Machine Learning Intern",
                        "Prototype an image-classification model",
                        "NeuralEdge", "Imane Chraibi", "Python, TensorFlow, ML", "Casablanca"),
                new InternshipOffer("DevOps Intern",
                        "Set up CI/CD and containerised deployments",
                        "CloudPrime", "Omar Haddad", "Docker, Kubernetes, CI/CD", "Casablanca"),
                new InternshipOffer("Mobile App Intern",
                        "Build a Flutter companion app",
                        "MobileWorks", "Lina Fassi", "Flutter, Firebase", "Marrakech"),
                new InternshipOffer("Big Data Analyst Intern",
                        "Analyse application data with Hive and Spark",
                        "DataVista", "Karim Alaoui", "Hadoop, Hive, Spark", "Rabat")
        );
        return offerRepository.saveAll(offers);
    }

    private void seedApplications(List<InternshipOffer> offers) {
        if (applicationRepository.count() > 0 || offers.isEmpty()) {
            return;
        }
        Application first = new Application("Amine Demo", "demo@example.com",
                "Spark, SQL, Python", "Interested in the data pipeline work.", offers.get(0));
        Application second = new Application("Alice Martin", "alice@example.com",
                "React, Spring Boot", "Final-year student looking for a PFE.", offers.get(1));
        second.setStatus(Application.Status.ACCEPTED);
        Application third = new Application("Bob Karim", "bob@example.com",
                "Python, TensorFlow", "Passionate about ML prototypes.", offers.get(2));
        third.setStatus(Application.Status.REJECTED);
        Application fourth = new Application("Sara Idrissi", "sara@example.com",
                "Docker, Kubernetes", "Familiar with CI/CD from coursework.", offers.get(3));
        Application fifth = new Application("Youssef Amrani", "youssef@example.com",
                "Spark, Hive, SQL", "Big Data student, PFE 2027.", offers.get(5));
        fifth.setStatus(Application.Status.ACCEPTED);
        applicationRepository.saveAll(List.of(first, second, third, fourth, fifth));
    }
}
