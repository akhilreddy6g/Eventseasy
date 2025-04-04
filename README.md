# Eventseasy

## 🛠️ Prerequisites
Before you begin, make sure you have the following installed on your system
1. <a href="https://nodejs.org/en/download">Node.js</a> (v16 or above)
2. npm (comes with Node.js)
3. <a href="https://www.mongodb.com">MongoDB Atlas</a>
4. Shadcnui
```
pnpm dlx shadcn@latest init
```

## 💻 Tech Stack
1. NodeJS, and NestJS (Typescript) - Backend
2. NextJS, React (Typescript), ShadcnUI, and TailwindCSS - Frontend
3. MongoDB - Data Storage
4. AWS S3 - Multimedia Storage

## ⚡ Getting Started
#### 1. Clone the Repository
Clone the project to your local machine using the following command:
```
git clone https://github.com/akhilreddy6g/Eventseasy.git
```
#### 2. Navigate to the project directory
```
cd Eventseasy
```
#### 3. Install Dependencies
3.1. Navigate to frontend directory
```
cd Frontend
```
Install Frontend Dependencies
```
npm i
```
3.2. Navigate to backend directory
```
cd backend
```
Install Backend Dependencies
```
npm i
```
#### 4. Install MongoDB Atlas
Download and Install <a href = "https://www.mongodb.com/try/download/atlascli"> MongoDB Atlas</a>, which is a fully managed cloud database used in this project 
for secure, scalable, and efficient data storage, with built-in monitoring and automation across cloud providers.
#### 5. Run the Application
3.1. Navigate to frontend directory
```
cd Frontend
```
Generate production build
```
npm run build
```
Start Frontend Server
```
npm run start
```
3.2. Navigate to backend directory
```
cd backend
```
Start Backend Server
```
npm run start:dev
```

## 🔑 Key Features

### 1. Role-Based Access 
Hosts can create events, assign managers, and invite guests; managers assist in event coordination; guests access schedules and chat.

### 2. Microservice Architecture 
Built with NestJS involving 6 Microservices - for scalability and modularity with separation of concerns.

### 3. Authentication & Security 
Secure login system using JWT and refresh tokens with role-based route protection.

### 4. Email Invites 
Integrated Nodemailer to send dynamic event invitations and updates.

### 5. AWS S3 Integration 
Seamless multimedia uploads with role based access.

### 6. Real-Time Chat 
Allows event members to communicate before/during events using Web Sockets.
