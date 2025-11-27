import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Lock, Sparkles, Loader2, ArrowRight, Plus } from 'lucide-react';
import { userService } from '../services/userService';

interface LoginPageProps {
  onLogin: (username: string, password: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [showRegistration, setShowRegistration] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    if (showRegistration) {
      // Handle registration
      try {
        const result = await userService.registerUser({ username, password });
        if (result.success) {
          setRegistrationSuccess(true);
          // After successful registration, automatically switch to login mode
          setTimeout(() => {
            setShowRegistration(false);
            setRegistrationSuccess(false);
          }, 2000);
        } else {
          alert(result.error || 'Registration failed');
        }
      } catch (error) {
        console.error('Registration error:', error);
        alert('Registration failed. Please try again.');
      }
    } else {
      // Handle login
      try {
        const result = await userService.loginUser({ username, password });
        if (result.success) {
          onLogin(username, password);
        } else {
          alert(result.error || 'Login failed');
        }
      } catch (error) {
        console.error('Login error:', error);
        alert('Login failed. Please try again.');
      }
    }
    
    setIsLoading(false);
  };

  const toggleRegistration = () => {
    setShowRegistration(!showRegistration);
    setRegistrationSuccess(false);
    setUsername('');
    setPassword('');
  };

  return (
    <div className="fixed inset-0 flex bg-zinc-950 font-sans text-gray-100 overflow-hidden items-center justify-center p-4">
      {/* Background orbs for visual effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-900/20 rounded-full blur-[100px]"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ 
            duration: 10, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        />
        <motion.div 
          className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[100px]"
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ 
            duration: 15, 
            repeat: Infinity, 
            ease: "easeInOut",
            delay: 2
          }}
        />
      </div>
      
      {/* Login Card */}
      <motion.div 
        className="relative w-full max-w-md bg-zinc-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.3)] mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">PixelWalls</h1>
          <p className="text-zinc-400 text-sm">AI-Powered Wallpaper Generator</p>
          
          {/* Registration Success Message */}
          {registrationSuccess && (
            <motion.div 
              className="mt-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400 text-sm"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              Registration successful! You can now log in.
            </motion.div>
          )}
        </div>
        
        <form onSubmit={handleSubmit}>
          {/* Username Field */}
          <div className="mb-6">
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
              {showRegistration ? 'New Username' : 'Username'}
            </label>
            <div className="relative flex items-center bg-zinc-900/80 border border-white/10 rounded-xl px-4 py-3 focus-within:border-white/30 transition-colors hover:border-white/20">
              <User className="w-5 h-5 text-zinc-500 mr-3" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={showRegistration ? 'Choose a username' : 'Enter your username'}
                className="w-full bg-transparent text-white placeholder-zinc-500 focus:outline-none"
                disabled={isLoading}
                required
              />
            </div>
          </div>
          
          {/* Password Field */}
          <div className="mb-8">
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
              {showRegistration ? 'New Password' : 'Password'}
            </label>
            <div className="relative flex items-center bg-zinc-900/80 border border-white/10 rounded-xl px-4 py-3 focus-within:border-white/30 transition-colors hover:border-white/20">
              <Lock className="w-5 h-5 text-zinc-500 mr-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={showRegistration ? 'Choose a password' : 'Enter your password'}
                className="w-full bg-transparent text-white placeholder-zinc-500 focus:outline-none"
                disabled={isLoading}
                required
              />
            </div>
          </div>
          
          {/* Submit Button */}
          <motion.button
            type="submit"
            className="w-full bg-white text-black font-semibold py-3.5 px-4 rounded-xl flex items-center justify-center transition-all hover:bg-zinc-200 disabled:opacity-70"
            disabled={isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                <span>{showRegistration ? 'Creating Account...' : 'Entering Workspace...'}</span>
              </>
            ) : (
              <>
                <span>{showRegistration ? 'Create Account' : 'Enter Workspace'}</span>
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </motion.button>
        </form>
        
        {/* Toggle between Login and Registration */}
        <div className="mt-6 text-center">
          <button 
            onClick={toggleRegistration}
            className="text-sm text-zinc-400 hover:text-white transition-colors flex items-center justify-center mx-auto"
            disabled={isLoading}
          >
            <Plus className="w-4 h-4 mr-1" />
            {showRegistration ? 'Already have an account? Login' : 'Create new account'}
          </button>
        </div>
        
        {/* Demo Credentials */}
        <div className="mt-6 text-center text-xs text-zinc-500">
          <p>For demo: username: <span className="font-mono bg-zinc-800 px-1.5 py-0.5 rounded">abc</span> (case insensitive) and password: <span className="font-mono bg-zinc-800 px-1.5 py-0.5 rounded">123</span></p>
          <p className="mt-2">By signing in, you agree to our Terms of Service and Privacy Policy.</p>
        </div>
      </motion.div>
    </div>
  );
};