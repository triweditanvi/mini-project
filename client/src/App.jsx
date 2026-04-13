import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import TextAnalysis from './pages/TextAnalysis';
import SpamDetection from './pages/SpamDetection';
import GrammarCheck from './pages/GrammarCheck';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      
      <Route path="/analyze" element={
        <ProtectedRoute>
          <TextAnalysis />
        </ProtectedRoute>
      } />
      <Route path="/spam" element={
        <ProtectedRoute>
          <SpamDetection />
        </ProtectedRoute>
      } />
      <Route path="/grammar" element={
        <ProtectedRoute>
          <GrammarCheck />
        </ProtectedRoute>
      } />
      
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;