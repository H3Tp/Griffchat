# GriffChat

A real-time group chat application with user authentication, avatar upload, and image messaging.  
The project includes an **Angular client** and a **Node.js + Express server**, connected via REST APIs and backed by **MongoDB**.

---

## 🧭 Table of Contents
1. [Project Overview](#project-overview)
2. [Repository Organization](#repository-organization)
3. [Tech Stack](#tech-stack)
4. [Features](#features)
5. [Data Structures](#data-structures)
6. [Client-Server Responsibilities](#client-server-responsibilities)
7. [API Endpoints](#api-endpoints)
8. [Angular Architecture](#angular-architecture)
9. [Client-Server Interaction Flow](#client-server-interaction-flow)
10. [Installation & Usage](#installation--usage)
11. [Contributing](#contributing)
12. [License](#license)

---

## 📘 Project Overview

GriffChat is a web-based real-time chat system where users can:
- Register and login securely.
- Create or join chat groups and channels.
- Send text or image messages.
- Upload and display avatars.
- View and maintain chat history.

The app is built using the **MEAN stack (MongoDB, Express, Angular, Node.js)**.

---

## 🏗️ Repository Organization

The project repository is structured as follows:
```text
griffchat/
│
├── client/ # Angular Frontend
│ ├── src/
│ │ ├── app/
│ │ │ ├── components/ # Chat, Login, Register components
│ │ │ ├── services/ # API communication (HTTP requests)
│ │ │ ├── models/ # TypeScript interfaces (User, Message, Group,channel)
│ │ │ └── app.module.ts
│ │ └── assets/ # Static assets (icons, images)
│ └── angular.json
│
├── server/ # Node.js + Express Backend
│ ├── controllers/ # Handles HTTP requests
│ ├── models/ # MongoDB Schemas 
│ ├── routes/ # REST API route definitions
| |
│ ├── tests/ # Jest test cases
│ ├── db.js # MongoDB connection setup
│ └── server.js # Main server entry point
│
└── README.md # Documentation file

### 🔧 Git Usage During Development
- Each feature (login, messaging, avatar upload) was developed in a separate branch.
- Branches were merged into the main branch after testing via pull requests.
- Commits followed a structured convention:
  - `feat:` for new features  
  - `fix:` for bug fixes  
  - `test:` for Jest testing updates  
  - `docs:` for documentation changes

---

## 💻 Tech Stack

| Layer | Technology |
|-------|-------------|
| **Frontend** | Angular, TypeScript, HTML, CSS |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB |
| **Authentication** | bcrypt (password hashing), JWT |
| **File Uploads** | multer |
| **Testing** | Jest |

---

## 🚀 Features
- User registration and authentication
- Group and channel-based chat
- Real-time updates via REST APIs
- Chat history retrieval
- Secure password encryption

---

## 🧩 Data Structures

### User
```json
{
  "_id": "ObjectId",
  "name": "John Doe",
  "email": "john@example.com",
  "password": "<hashed_password>",
  "avatar": "uploads/avatars/john.jpg",
  "role": "User"
}


### Group
```json
{
  "_id": "ObjectId",
  "name": "Developers",
  "channels": ["ObjectId1", "ObjectId2"]
}

### Channel
```json
{
  "_id": "ObjectId",
  "groupId": "ObjectId",
  "name": "Frontend Discussions"
}

### Message
```json
{
  "_id": "ObjectId",
  "group": "groupId",
  "channel": "channelId",
  "sender": "userId",
  "text": "Hello world!",
  "image": "uploads/messages/image.jpg",
  "timestamp": "2025-10-11T17:00:00Z"
}


Client-Server Responsibilities
| Component                      | Responsibilities                                                                                                                          |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **Client (Angular)**           | Handles UI, user interaction, form validation, and sending HTTP requests. Displays server responses dynamically.                          |
| **Server (Node.js + Express)** | Handles authentication, API routing, message processing, avatar uploads, and MongoDB communication. Returns JSON responses to the client. |
| **Database (MongoDB)**         | Stores users, messages, groups, and channels persistently.                                                               
                 |


🌐 API Endpoints
Method	Endpoint	Description
POST	/api/users/register	Register a new user
POST	/api/users/login	Authenticate a user and return JWT
POST	/api/users/:id/avatar	Upload user avatar
GET	/api/groups	Retrieve all groups
GET	/api/groups/:id/channels	Get channels in a group
POST	/api/messages	Send a new message (text/image)
GET	/api/messages/:group/:channel	Fetch all messages for a specific channel



Example Response (GET /api/messages/:group/:channel)
[
  {
    "sender": "John Doe",
    "text": "Hello everyone!",
    "timestamp": "2025-10-11T17:05:00Z",
    "image": null
  },
  {
    "sender": "Alice",
    "text": "Hi John!",
    "timestamp": "2025-10-11T17:06:30Z",
    "image": null
  }
]


Angular Architecture
Components
Component	Purpose
LoginComponent	Handles user authentication
RegisterComponent	Handles new user registration
ChatComponent	Displays messages and allows sending text/images
ProfileComponent	Displays and updates user avatar/profile info
GroupListComponent	Displays list of groups and channels
Services
Service	Responsibility
AuthService	Login, registration, and token handling
ChatService	Send/fetch messages and handle chat logic
UserService	Avatar upload, user data retrieval
ApiService	Common HTTP methods and API configuration
Models
Model	Description
User	Represents user data
Message	Represents a message in a chat
Group	Represents a chat group and its channels
Routing
Route	Component
/login	LoginComponent
/register	RegisterComponent
/chat	ChatComponent
/profile	ProfileComponent


Client-Server Interaction Flow

User Registration/Login

Angular sends a POST request to /api/users/register or /api/users/login.

Server validates credentials and returns a token.

Client stores token locally and redirects to chat screen.

Fetching Groups/Channels

Client sends GET /api/groups → server returns JSON list.

UI updates dynamically using Angular data binding.

Sending a Message

Angular calls POST /api/messages with message data.

Server saves the message to MongoDB.

Client refreshes message list (GET /api/messages/:group/:channel).

Uploading an Avatar

Client uploads file to /api/users/:id/avatar using FormData.

Server stores file in /uploads/avatars/ and updates user record.

UI Updates

Angular components subscribe to Observables from services.

When data changes, UI auto-refreshes using reactive state management.

⚙️ Installation & Usage
Prerequisites

Node.js ≥ 18

Angular CLI

MongoDB running locally or in the cloud

Setup

# Clone the repository
git clone https://github.com/H3Tp/Griffchat.git
cd griffchat

# Install backend dependencies
cd server
npm install

# Run backend server
npm run dev

# Install frontend dependencies
cd ../client
npm install

# Run frontend
ng serve

Access

Visit http://localhost:4200
 in your browser.

 API Flow Diagram
 +--------------------+       POST /login        +-----------------------+
|  Angular Client    | -----------------------> |  Node.js Server (API) |
| (LoginComponent)   |                         |  Auth Controller       |
+---------+----------+                         +----------+------------+
          |                                             |
          |        JWT Token (Response)                 |
          | <-------------------------------------------+
          |
          |      GET /groups                            |
          |-------------------------------------------->|
          |      JSON Response (Groups, Channels)       |
          |<--------------------------------------------|
          |
          |      POST /messages                         |
          |-------------------------------------------->|
          |      Stored in MongoDB                      |
          |<--------------------------------------------|
