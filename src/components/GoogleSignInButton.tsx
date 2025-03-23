
import { Button } from '@/components/ui/button';
import { signInWithGoogle } from '@/lib/googleAuth';
import { toast } from 'sonner';

export const GoogleSignInButton = () => {
  const handleGoogleSignIn = async () => {
    try {
      const { error } = await signInWithGoogle();
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign in with Google');
    }
  };

  return (
    <Button 
      variant="outline" 
      className="w-full flex items-center gap-2" 
      onClick={handleGoogleSignIn}
    >
      <img src="/google.svg" alt="Google" className="w-5 h-5" />
      Continue with Google
    </Button>
  );
};
