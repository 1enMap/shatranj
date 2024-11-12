import React, { useState } from 'react';
import { LogIn } from 'lucide-react';
import { signInWithGoogle } from '../config/firebase';

export function SignIn() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await signInWithGoogle();
    } catch (error: any) {
      if (error.code === 'auth/popup-blocked') {
        setError('Please allow popups for this site and try again.');
      } else if (error.code === 'auth/cancelled-popup-request') {
        setError('Sign-in was cancelled. Please try again.');
      } else {
        setError('Failed to sign in. Please try again.');
      }
      console.error('Error signing in:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <button
        onClick={handleSignIn}
        disabled={isLoading}
        className={`
          flex items-center space-x-2 px-6 py-3
          bg-blue-600 hover:bg-blue-700 
          text-white rounded-lg transition-colors
          disabled:opacity-50 disabled:cursor-not-allowed
          shadow-lg hover:shadow-xl
        `}
      >
        <LogIn className="h-5 w-5" />
        <span className="font-medium">
          {isLoading ? 'Signing in...' : 'Sign in with Google'}
        </span>
      </button>
      
      {error && (
        <div className="text-red-500 text-sm text-center max-w-sm bg-red-50 p-3 rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
}