import { Routes, Route } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import UploadPage from './pages/Upload';
import QuizPage from './pages/Quiz';
import './App.css';

function App() {
  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<UploadPage />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/quiz" element={<QuizPage />} />
      </Routes>
    </MainLayout>
  );
}

export default App;
