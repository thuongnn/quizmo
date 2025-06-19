import {Route, Routes} from 'react-router-dom';
import {MainLayout} from './layouts/MainLayout';
import UploadPage from './pages/Upload';
import QuizPage from './pages/Quiz';
import TestList from './pages/TestList';
import Test from './pages/Test';
import './App.css';
import { ConfigProvider } from 'antd';

function App() {
    return (
        <ConfigProvider>
            <Routes>
                <Route path="/test/exam" element={<Test/>}/>
                <Route path="/quiz" element={<QuizPage/>}/>
                <Route path="/*" element={
                    <MainLayout>
                        <Routes>
                            <Route path="/" element={<UploadPage/>}/>
                            <Route path="/upload" element={<UploadPage/>}/>
                            <Route path="/test" element={<TestList/>}/>
                        </Routes>
                    </MainLayout>
                }/>
            </Routes>
        </ConfigProvider>
    );
}

export default App;
