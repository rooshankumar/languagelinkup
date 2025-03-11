
import React, { useState } from 'react';
import Button from '@/components/Button';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const AuthPlaceholder = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLoginWithReplit = () => {
    setIsLoading(true);
    
    try {
      window.addEventListener("message", authComplete);
      const h = 500;
      const w = 350;
      const left = window.screen.width / 2 - w / 2;
      const top = window.screen.height / 2 - h / 2;

      const authWindow = window.open(
        "https://replit.com/auth_with_repl_site?domain=" + location.host,
        "_blank",
        "modal=yes, toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=" +
          w +
          ", height=" +
          h +
          ", top=" +
          top +
          ", left=" +
          left
      );

      function authComplete(e: MessageEvent) {
        if (e.data !== "auth_complete") {
          return;
        }

        window.removeEventListener("message", authComplete);
        setIsLoading(false);
        
        if (authWindow) {
          authWindow.close();
        }
        
        toast({
          title: "Success!",
          description: "You are now signed in with Replit",
        });
        
        navigate("/");
        location.reload();
      }
    } catch (error) {
      setIsLoading(false);
      toast({
        title: "Error",
        description: "Failed to authenticate with Replit",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full max-w-md mx-auto p-6 text-center">
      <h2 className="text-2xl font-bold mb-4">Sign in to continue</h2>
      <p className="text-muted-foreground mb-6">
        You need to be signed in to access this feature and connect with other language learners.
      </p>
      
      <Button 
        variant="primary"
        size="lg"
        isLoading={isLoading}
        onClick={handleLoginWithReplit}
        className="w-full"
      >
        Login with Replit
      </Button>
    </div>
  );
};

export default AuthPlaceholder;
