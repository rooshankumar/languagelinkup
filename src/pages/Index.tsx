import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Button from "@/components/Button";

const AuthPlaceholder = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignIn = async () => {
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) setError(error.message);
    setLoading(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-white shadow-md rounded-md">
      <h2 className="text-xl font-bold mb-4">Sign in to MyLanguage</h2>

      <input
        type="email"
        placeholder="Email"
        className="w-full p-2 border rounded-md mb-3"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        className="w-full p-2 border rounded-md mb-3"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <Button onClick={handleSignIn} disabled={loading}>
        {loading ? "Signing in..." : "Sign In"}
      </Button>

      <p className="text-sm text-muted-foreground mt-2">
        New user? <a href="/signup" className="text-primary">Sign up</a>
      </p>

      <Button onClick={handleSignOut} variant="outline" className="mt-4">
        Sign Out
      </Button>
    </div>
  );
};

export default AuthPlaceholder;
