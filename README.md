# School Management System

A comprehensive full-stack application for managing students, teachers, classes, attendance, examinations, fees, and reports.

## Features

- **User Authentication** - JWT-based authentication with role-based access control (Admin, Teacher, Student)
- **Student Management** - Add, edit, view, and delete student records
- **Teacher Management** - Manage teacher profiles and subject assignments
- **Class & Subject Management** - Organize classes, sections, and subjects
- **Attendance Management** - Mark and track daily attendance
- **Examination Management** - Schedule exams and manage results
- **Fee Management** - Track fee payments and generate receipts
- **Dashboard** - Role-based dashboard with statistics and analytics

## Tech Stack

### Frontend
- React.js
- React Router
- Axios
- CSS3 (Responsive Design)

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- bcrypt.js

## Project Structure

```
school-management/
├── client/                 # React Frontend
│   ├── public/
│   └── src/
│       ├── components/     # Reusable components
│       ├── pages/          # Page components
│       ├── context/        # React context
│       ├── services/       # API services
│       └── styles/         # CSS files
│
├── server/                 # Node.js Backend
│   ├── routes/            # API routes
│   ├── models/            # Mongoose models
│   ├── middleware/        # Auth middleware
│   └── server.js          # Entry point
│
└── README.md
```

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/school-management.git
cd school-management
```

2. Install server dependencies:
```bash
cd server
npm install
```

3. Install client dependencies:
```bash
cd ../client
npm install
```

4. Create a `.env` file in the server directory:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/school_management
JWT_SECRET=your_jwt_secret_key
```

5. Start the server:
```bash
cd server
npm run dev
```

6. Start the client:
```bash
cd client
npm start
```

7. Open your browser and navigate to `http://localhost:3000`

## API Endpoints

### Auth
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Students
- `GET /api/students` - Get all students
- `GET /api/students/:id` - Get student by ID
- `POST /api/students` - Create a student
- `PUT /api/students/:id` - Update a student
- `DELETE /api/students/:id` - Delete a student

### Teachers
- `GET /api/teachers` - Get all teachers
- `GET /api/teachers/:id` - Get teacher by ID
- `POST /api/teachers` - Create a teacher
- `PUT /api/teachers/:id` - Update a teacher
- `DELETE /api/teachers/:id` - Delete a teacher

### Classes
- `GET /api/classes` - Get all classes
- `POST /api/classes` - Create a class
- `PUT /api/classes/:id` - Update a class
- `DELETE /api/classes/:id` - Delete a class

### Subjects
- `GET /api/subjects` - Get all subjects
- `POST /api/subjects` - Create a subject
- `PUT /api/subjects/:id` - Update a subject
- `DELETE /api/subjects/:id` - Delete a subject

### Attendance
- `GET /api/attendance` - Get attendance records
- `POST /api/attendance` - Mark attendance
- `PUT /api/attendance/:id` - Update attendance

### Exams
- `GET /api/exams` - Get all exams
- `POST /api/exams` - Create an exam
- `PUT /api/exams/:id` - Update an exam
- `DELETE /api/exams/:id` - Delete an exam

### Results
- `GET /api/results` - Get all results
- `POST /api/results` - Add a result
- `PUT /api/results/:id` - Update a result

### Fees
- `GET /api/fees` - Get all fees
- `POST /api/fees` - Create fee record
- `PUT /api/fees/:id/pay` - Record payment
- `DELETE /api/fees/:id` - Delete fee record

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

## User Roles

### Admin
- Full access to all features
- Manage students, teachers, classes, subjects
- View all reports and analytics

### Teacher
- Mark attendance
- Enter exam results
- View assigned classes

### Student
- View attendance
- View exam results
- View fee status

## Screenshots

Login Page: Clean and modern login interface
Dashboard: Statistics cards with key metrics
Student Management: Data table with CRUD operations
Attendance: Mark attendance by class and date

## Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set the root directory to `client`
3. Add environment variables

### Backend (Render/Railway)
1. Connect your GitHub repository
2. Set the root directory to `server`
3. Add environment variables

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@schoolmanagement.com or join our Slack channel.

---
