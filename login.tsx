import React from 'react';
import { createRoot } from 'react-dom/client';
import { LoginPage } from './components/LoginPage';

const LoginApp: React.FC = () => {
  const handleLogin = (username: string, password: string, apiKey: string) => {
    console.log('Login attempt:', { username, password, apiKey });
    // In a real app, you would authenticate the user here
    alert(`Welcome ${username}! You've successfully logged in.`);
  };

  return <LoginPage onLogin={handleLogin} />;
};

const root = createRoot(document.getElementById('root')!);
root.render(<LoginApp />);