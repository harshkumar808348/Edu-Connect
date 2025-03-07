# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## API Endpoints

### Authentication
- POST `/api/auth/student/register` - Student registration
- POST `/api/auth/student/login` - Student login
- POST `/api/auth/teacher/register` - Teacher registration
- POST `/api/auth/teacher/login` - Teacher login

### Classrooms
- POST `/api/classroom/create` - Create classroom (Teacher)
- POST `/api/classroom/join` - Join classroom (Student)
- GET `/api/classroom/teacher` - Get teacher's classrooms
- GET `/api/classroom/student` - Get student's joined classrooms

### Assignments
- POST `/api/assignment/create/:classroomId` - Create assignment
- POST `/api/assignment/submit/:assignmentId` - Submit assignment
- GET `/api/assignment/classroom/:classroomId` - Get classroom assignments
- GET `/api/assignment/submissions/:assignmentId` - Get assignment submissions

### Chat
- GET `/api/chat/classroom/:classroomId` - Get classroom chat history
- WebSocket events for real-time messaging

### Whiteboard
- POST `/api/whiteboard/create` - Create whiteboard session
- GET `/api/whiteboard/:id` - Get whiteboard data
- WebSocket events for real-time drawing

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

For enterprise inquiries: harshkumarconnect@gmail.com
