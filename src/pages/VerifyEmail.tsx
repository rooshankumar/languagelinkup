
import { Mail } from "lucide-react";

const VerifyEmail = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md text-center space-y-4">
        <Mail className="h-12 w-12 text-primary mx-auto" />
        <h2 className="text-2xl font-bold">Check Your Email</h2>
        <p className="text-muted-foreground">
          We've sent a verification link to your email address. 
          Please check your inbox and click the link to verify your account.
        </p>
      </div>
    </div>
  );
};

export default VerifyEmail;
