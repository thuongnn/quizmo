import { Routes, Route } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import UploadPage from './pages/Upload';
import QuizPage from './pages/Quiz';
import TestList from './pages/TestList';
import Test from './pages/Test';
import './App.css';

function App() {
  return (
    <>
      <Routes>
        <Route path="/test/exam" element={<Test />} />
        <Route path="/*" element={
          <MainLayout>
            <Routes>
              <Route path="/" element={<UploadPage />} />
              <Route path="/upload" element={<UploadPage />} />
              <Route path="/quiz" element={<QuizPage />} />
              <Route path="/test" element={<TestList />} />
            </Routes>
          </MainLayout>
        } />
      </Routes>
    </>
  );
}

export default App;
