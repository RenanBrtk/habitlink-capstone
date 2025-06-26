# HabitLink - Habit Tracking Application

## 📋 Project Overview

HabitLink is a comprehensive habit tracking application developed as a Capstone Project at the University of Calgary. The application helps users build and maintain positive habits through an intuitive mobile interface with powerful tracking and analytics features.

## 🏗️ Architecture

This project follows a full-stack architecture with separate frontend and backend applications:

- **Frontend**: Ionic/Angular mobile application
- **Backend**: Node.js REST API with Express.js
- **Database**: MariaDB for data persistence

## 🚀 Features

### Core Functionality
- **User Authentication**: Secure registration and login system
- **Habit Management**: Create, edit, and delete custom habits
- **Habit Tracking**: Log daily habit completion with streaks
- **Dashboard**: Visual overview of habit progress and statistics
- **Journal**: Personal reflection and note-taking capabilities
- **Profile Management**: User settings and preferences

### Advanced Features
- **Streak Tracking**: Monitor consecutive days of habit completion
- **Progress Analytics**: Visual charts and statistics
- **Habit Categories**: Organize habits by type or goal
- **Responsive Design**: Optimized for mobile and tablet devices

## 📁 Project Structure

```
habitlink-capstone/
├── habitlink-frontend/          # Ionic/Angular mobile app
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/      # Reusable UI components
│   │   │   ├── pages/          # Application pages/screens
│   │   │   └── services/       # Angular services
│   │   ├── assets/             # Static assets
│   │   └── theme/              # Styling and themes
│   ├── capacitor.config.ts     # Capacitor configuration
│   └── package.json
├── habitlink-backend/           # Node.js REST API
│   ├── src/
│   │   ├── controllers/        # Route handlers
│   │   ├── models/            # Database models
│   │   ├── routes/            # API routes
│   │   └── middlewares/       # Custom middleware
│   ├── config/                # Configuration files
│   └── package.json
└── package.json               # Root package.json
```

## 🛠️ Technology Stack

### Frontend
- **Framework**: Ionic 7 with Angular
- **Language**: TypeScript
- **Styling**: SCSS
- **Mobile**: Capacitor for native mobile features
- **State Management**: Angular Services
- **UI Components**: Ionic Components

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: JavaScript
- **Database**: MariaDB with MySQL2/Sequelize ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Express Validator

### Development Tools
- **Version Control**: Git
- **Package Manager**: npm
- **Code Editor**: VS Code
- **Testing**: Karma & Jasmine (Frontend), Jest (Backend)

## 📦 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- MariaDB (local or cloud instance)
- Ionic CLI: `npm install -g @ionic/cli`

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd habitlink-backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with your configuration:
   ```env
   PORT=3000
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=habitlink
   DB_USER=your_username
   DB_PASSWORD=your_password
   JWT_SECRET=your_jwt_secret_key
   NODE_ENV=development
   ```

4. Start the backend server:
   ```bash
   npm start
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd habitlink-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   ionic serve
   ```

4. For mobile development:
   ```bash
   # Add platforms
   ionic capacitor add ios
   ionic capacitor add android
   
   # Run on device/emulator
   ionic capacitor run ios
   ionic capacitor run android
   ```

## 🔧 Configuration

### Environment Variables
Create `.env` files in the backend directory with the following variables:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=habitlink
DB_USER=your_username
DB_PASSWORD=your_password

# Authentication
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d

# CORS
FRONTEND_URL=http://localhost:8100
```

### Database Setup
1. Install MariaDB locally or use a cloud MariaDB instance
2. Create a database named `habitlink`
3. Update the database configuration in your `.env` file
4. Run database migrations/setup if applicable

## 📱 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Habit Endpoints
- `GET /api/habits` - Get user's habits
- `POST /api/habits` - Create a new habit
- `PUT /api/habits/:id` - Update a habit
- `DELETE /api/habits/:id` - Delete a habit
- `POST /api/habits/:id/log` - Log habit completion

### Journal Endpoints
- `GET /api/journal` - Get journal entries
- `POST /api/journal` - Create journal entry
- `PUT /api/journal/:id` - Update journal entry
- `DELETE /api/journal/:id` - Delete journal entry

## 🧪 Testing

### Frontend Testing
```bash
cd habitlink-frontend
npm test
```

### Backend Testing
```bash
cd habitlink-backend
npm test
```

## 📱 Mobile Deployment

### iOS
1. Build the app: `ionic capacitor build ios`
2. Open in Xcode: `ionic capacitor open ios`
3. Configure signing and deploy

### Android
1. Build the app: `ionic capacitor build android`
2. Open in Android Studio: `ionic capacitor open android`
3. Configure signing and deploy

## 🤝 Contributing

This is a proprietary Capstone Project for the University of Calgary with commercial potential. 

### Academic Collaboration
- Fellow students and faculty may provide feedback and suggestions for academic purposes
- All intellectual property rights remain with the original author
- Contributions will be acknowledged but do not transfer ownership rights

### Future Commercial Development
- If you're interested in contributing to potential commercial development, please contact the author first
- Commercial contributors will require separate licensing agreements

For academic feedback or commercial collaboration inquiries:
1. Contact: nan.rabeloo@gmail.com
2. Clearly state whether your interest is academic or commercial
3. All contributions require explicit written agreement regarding IP rights

## 📄 License & Intellectual Property

**Copyright © 2025 Renan Rabelo. All Rights Reserved.**

This project is developed as part of academic coursework at the University of Calgary. While created for educational purposes, all intellectual property rights are retained by the author.

### Academic Use
- This code is shared for educational demonstration and peer review as part of university coursework
- Academic institutions may reference this work for educational purposes with proper attribution

### Commercial Rights Reserved
- Commercial use, distribution, or modification is prohibited without explicit written permission
- All rights reserved for potential future commercial release

### Contact for Licensing
For licensing inquiries or commercial use permissions, please contact: nan.rabeloo@gmail.com

*Note: This restrictive approach allows the author to maintain full control over intellectual property while fulfilling academic requirements.*

## 👥 Team

- **Developer**: Renan Rabelo
- **Institution**: University of Calgary
- **Program**: Full Stack Web Development

## 📞 Contact

For questions or support regarding this project:
- Email: [nan.rabeloo@gmail.com]
- GitHub: [@RenanBrtk](https://github.com/RenanBrtk)

## 🙏 Acknowledgments

- University of Calgary Computer Science Department
- Program Instructos - (Emmanuel, Jordan and Mostafa)
- Open source community for the amazing tools and libraries

---

**Note**: This application is developed for educational purposes as part of a university capstone project.
