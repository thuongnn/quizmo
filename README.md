# Quizmo - Interactive Quiz Learning Platform

Quizmo is a modern web application designed to help users learn and practice through interactive quizzes. Built with React and TypeScript, it provides a clean and intuitive interface for managing courses and taking quizzes.

## Features

- **Course Management**
  - Create and manage multiple courses
  - Upload questions in various formats
  - Organize questions by categories
  - Delete courses when needed

- **Interactive Quiz System**
  - Multiple choice questions support
  - Single and multiple answer options
  - Real-time answer validation
  - Progress tracking
  - Sound effects for correct/incorrect answers
  - Mute/unmute functionality

- **Practice Test Mode**
  - Timed test sessions
  - Random question selection
  - Score calculation
  - Detailed results review
  - Pass/Fail status

## Tech Stack

- **Frontend**
  - React 18
  - TypeScript
  - Ant Design (UI Components)
  - React Router (Navigation)
  - Local Storage (State Management)

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/quizmo.git
cd quizmo
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Start the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:5173](http://localhost:5173) in your browser.

## Project Structure

```
quizmo/
├── src/
│   ├── assets/         # Static assets (sounds, images)
│   ├── components/     # Reusable components
│   ├── hooks/         # Custom React hooks
│   ├── layouts/       # Layout components
│   ├── pages/         # Page components
│   ├── services/      # API and service functions
│   ├── types/         # TypeScript type definitions
│   ├── utils/         # Utility functions
│   ├── App.tsx        # Main App component
│   └── main.tsx       # Entry point
├── public/            # Public assets
├── index.html         # HTML template
├── package.json       # Project dependencies
├── tsconfig.json      # TypeScript configuration
└── vite.config.ts     # Vite configuration
```

## Usage

1. **Creating a Course**
   - Navigate to "My Courses"
   - Click "Add Course"
   - Enter course details and questions
   - Save the course

2. **Taking a Quiz**
   - Select a course from "My Courses"
   - Click "Learn" to start the quiz
   - Answer questions and get immediate feedback
   - Review your progress

3. **Practice Test**
   - Go to "Practice Test"
   - Select a course
   - Complete the test within the time limit
   - View your results

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Ant Design](https://ant.design/) for the UI components
- [React](https://reactjs.org/) for the frontend framework
- [TypeScript](https://www.typescriptlang.org/) for type safety

