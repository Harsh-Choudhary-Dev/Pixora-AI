# Pixora - Smart Photo Management System

Pixora is an intelligent photo management and organization system built with Spring Boot that leverages AI-powered image processing to automatically detect faces, tag images, and provide advanced search capabilities.

## 🚀 Features

- **AI-Powered Image Processing**: Automatic face detection and image tagging using Python-based ML services
- **Face Recognition**: Detect and organize photos by recognized faces with person identification
- **Smart Tagging**: Automatic image content tagging for better categorization
- **Advanced Search**: Search photos by face, person name, or tags
- **User Authentication**: Secure JWT-based authentication system
- **Batch Processing**: Efficient multi-threaded image ingestion and processing
- **RESTful API**: Clean and comprehensive API endpoints
- **Caching**: Performance optimization with Spring Cache

## 🛠️ Technology Stack

### Backend
- **Java 21** with Spring Boot 4.0.6
- **Spring Security** with JWT authentication
- **Spring Data JPA** for database operations
- **Spring Data Elasticsearch** for search capabilities
- **MySQL** as primary database
- **Lombok** for boilerplate code reduction
- **Maven** for dependency management

### External Dependencies
- **Python ML Service** (running on port 18081) for image processing
- **Elasticsearch** for advanced search functionality

## 📋 Prerequisites

- Java 21 or higher
- Maven 3.6+
- MySQL 8.0+
- Python ML Service (separate deployment)
- Elasticsearch (optional, for enhanced search)

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Pixora
```

### 2. Database Setup
Create a MySQL database named `pixora_db`:
```sql
CREATE DATABASE pixora_db;
```

### 3. Configuration
Update `src/main/resources/application.properties` with your database credentials:

```properties
# Database configuration
spring.datasource.url=jdbc:mysql://localhost:3306/pixora_db
spring.datasource.username=your_username
spring.datasource.password=your_password

# Photo folder path
photo.folder.paths=/path/to/your/photos

# Python ML service endpoint
image.python.port=http://127.0.0.1:18081
```

### 4. Build and Run
```bash
# Using Maven Wrapper
./mvnw clean install
./mvnw spring-boot:run

# Or using Maven
mvn clean install
mvn spring-boot:run
```

The application will start on `http://localhost:8080`

## 📁 Project Structure

```
src/main/java/com/harsh/Pixora/
├── PixoraApplication.java          # Main application entry point
├── config/                         # Configuration classes
│   ├── AsyncConfig.java           # Async processing configuration
│   └── WebConfig.java             # Web configuration
├── controller/                     # REST API controllers
│   ├── AuthController.java        # Authentication endpoints
│   ├── HomeController.java        # Home page controller
│   ├── MediaController.java       # Media serving controller
│   └── PhotoController.java       # Photo management endpoints
├── entity/                         # JPA entities
│   ├── Face.java                  # Face entity
│   ├── ImageFace.java             # Image-Face relationship
│   ├── ImageInfo.java             # Image metadata
│   ├── ImageTag.java              # Image tags
│   ├── RegisterUser.java          # User registration
│   └── Users.java                 # User entity
├── ingestion/                      # Image processing services
│   ├── FileSystemPhotoIngestionService.java
│   ├── ImageProcessingClient.java
│   ├── PhotoIngestionService.java
│   └── PythonImageProcessingClient.java
├── repository/                     # Data access layer
├── security/                       # Security configuration
│   ├── JwtRequestFilter.java
│   └── WebSecurityCongif.java
└── service/                        # Business logic layer
    ├── AuthService.java
    ├── CustomUserDetailsService.java
    ├── ImageService.java
    └── JwtUtil.java
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/authenticate` - Generate JWT token

### Photo Management
- `GET /api/photos/process-photos` - Start photo ingestion process
- `GET /api/photos?page={page}&size={size}` - Get paginated photos
- `GET /api/photos/by-face?faceId={id}` - Search photos by face
- `GET /api/photos/by-tag?tagName={tag}` - Search photos by tag
- `GET /api/photos/by-person?personName={name}` - Search photos by person
- `GET /api/photos/faces` - Get all detected faces
- `POST /api/photos/person-name?personName={name}&faceId={id}` - Assign name to face

### Media Serving
- `GET /media/file?path={path}` - Serve image files

## 🔄 Image Processing Workflow

1. **Ingestion**: System monitors configured photo folders
2. **Batch Processing**: Images are processed in batches (8 images per batch)
3. **AI Analysis**: Python ML service detects faces and generates tags
4. **Storage**: Results are stored in MySQL database
5. **Indexing**: Data is indexed for fast search and retrieval

## ⚙️ Configuration

### Application Properties
```properties
# Server Configuration
server.port=8080

# Database
spring.datasource.url=jdbc:mysql://localhost:3306/pixora_db
spring.datasource.username=harsh
spring.datasource.password=root

# JWT Security
security.jwt.secret-key=your-secret-key
security.jwt.expiration-time=3600000

# Photo Processing
photo.folder.paths=/path/to/photos
image.python.port=http://127.0.0.1:18081
```

### Supported Image Formats
- JPEG (.jpg, .jpeg)
- PNG (.png)

## 🔐 Security

- JWT-based authentication with configurable expiration
- Secure password storage
- Request filtering for protected endpoints
- CORS configuration for cross-origin requests

## 🧪 Testing

Run the test suite:
```bash
./mvnw test
```

## 📊 Performance Features

- **Multi-threaded Processing**: Configurable thread pools for API and database operations
- **Batch Processing**: Efficient batch image processing (configurable batch size)
- **Caching**: Spring Cache integration for improved response times
- **Async Operations**: Non-blocking image ingestion using @Async

## 🐳 Docker Support (Optional)

You can containerize the application using Docker. Create a `Dockerfile`:

```dockerfile
FROM openjdk:21-jdk-slim
COPY target/Pixora-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app.jar"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🔗 Dependencies

Key external services required:
- **Python ML Service**: Face detection and image tagging (port 18081)
- **MySQL Database**: Primary data storage
- **Elasticsearch**: Optional enhanced search capabilities

## 📞 Support

For support and questions, please open an issue in the repository.

---

**Note**: This application requires a separate Python ML service to be running on port 18081 for image processing functionality. Make sure to deploy and configure the ML service before starting the application.
