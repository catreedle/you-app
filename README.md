# YouApp Backend Technical Challenge

A robust backend implementation featuring authentication, user profiles, and real-time chat functionality built with NestJS, MongoDB, RabbitMQ, and Socket.IO.

## 🚀 Features

- User Authentication with JWT
- Profile Management with Zodiac/Horoscope Integration
- Real-time Chat System
- Comprehensive API Documentation
- Unit Testing Coverage
- Docker Containerization

## 🛠 Tech Stack

- **Framework:** NestJS
- **Database:** MongoDB
- **Message Broker:** RabbitMQ
- **Real-time Communication:** Socket.IO
- **Authentication:** JWT
- **Testing:** Jest
- **Containerization:** Docker
- **API Documentation:** Swagger

## 📋 Prerequisites

- Node.js (v16+)
- Docker and Docker Compose
- MongoDB
- RabbitMQ

## 🔧 Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd you-app

```

2. Install dependencies:

 ```bash
 npm install
 ```

3. Set up environment variables:

 ```bash
 cp .env.example .env
 ```

4. Start the services using Docker:

 ```bash
 docker-compose up -d
 ```

## 🏗 Project Structure

```
src/
├── auth/              # Authentication module
├── messaging/         # Messaging functionality module
├── profiles/          # Profile management module
├── users/             # Users module
├── utils/             # Horoscope and zodiac helpers
├── app.module.ts      # Main application module
└── main.ts            # Application entry point
```

## 📚 API Documentation

This project uses **Swagger** to document all available endpoints.

After starting the server, you can access the Swagger API documentation at:

- **Swagger URL:** [http://localhost:3000/docs](http://localhost:3000/docs)

### Authentication Endpoints

#### Register User

- **URL:** `/api/register`
- **Method:** `POST`
- **Body:**

```json
{
  "email": "string",
  "username": "string",
  "password": "string"
}
```

- **Response:** `201 Created`

#### Login

- **URL:** `/api/login`
- **Method:** `POST`
- **Body:**

```json
{
  "email": "string",
  "password": "string"
}
```

- **Response:** JWT Token

### Profile Endpoints

#### Create Profile

- **URL:** `/api/createProfile`
- **Method:** `POST`
- **Authentication:** Required
- **Body:**

```json
{
  "name": "string",
  "gender": "string",
  "birthday": "date",
  "height": "number",
  "weight": "number"
}
```

- **Response:** `201 Created`

#### Get Profile

- **URL:** `/api/getProfile`
- **Method:** `GET`
- **Authentication:** Required
- **Response:** Profile Object

#### Update Profile

- **URL:** `/api/updateProfile`
- **Method:** `PUT`
- **Authentication:** Required
- **Body:** Same as Create Profile
- **Response:** Updated Profile

### Chat Endpoints

#### View Messages

- **URL:** `/api/viewMessages`
- **Method:** `GET`
- **Authentication:** Required
- **Response:** Message List

#### Send Message

- **URL:** `/api/sendMessage`
- **Method:** `POST`
- **Authentication:** Required
- **Body:**

```json
{
  "recipientId": "string",
  "content": "string"
}
```

- **Response:** Message Object

## 💾 Database Schema

### User Collection

```javascript
{
  _id: ObjectId,
  email: String,
  username: String,
  password: String
}
```

### Profile Collection

```javascript
{
  _id: ObjectId,
  displayName: String,
  gender: String,
  birthday: Date,
  horoscope: String,
  zodiac: String,
  height: Number,
  weight: Number,
  image: String,
  user: ObjectId
}

```

### Message Collection

```javascript
{
  _id: ObjectId,
  senderId: ObjectId,
  recipientId: ObjectId,
  content: String,
  delivered: Boolean,
  deliveredAt: Date
}
```

## 🧪 Testing

Run unit tests:

```bash
npm run test
```

Generate test coverage:

```bash
npm run test:cov
```

## 🐳 Docker Configuration

### Development Setup

For development, use `docker-compose.dev.yml`:

1. Start the services:

   ```bash
   docker-compose -f docker-compose.dev.yml up -d

   ```

2. To run the development server:

   ```bash
   npm run start:dev
   ```

### Production Setup

For production, use `docker-compose.yml`:

1. Start the services:
   ```bash
   docker-compose up -d
   ```

## 📜 License

This project is licensed under the MIT License
