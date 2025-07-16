"use client";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "sonner";

export default function Login() {
  const router = useRouter();
  // Common state
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // Only used for signup
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [usernameSignup, setUsernameSignup] = useState("");

  //State used to check for existing username during signup
  const [usernameAvailable, setUsernameAvailable] = useState(null); // true / false / null
  const [checkingUsername, setCheckingUsername] = useState(false);

  // Handle existing-user sign-in
  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    let loginEmail = loginIdentifier.trim();
    const trimmedPassword = password.trim();

    // If it's not an email, treat it as a username and look up the email from profiles
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmail = emailPattern.test(loginEmail);

    if (!isEmail) {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("email")
        .eq("username", loginEmail)
        .maybeSingle();

      if (profileError) {
        toast.error("Something went wrong checking that username.");
        setErrorMsg("Error checking username.");
        setPassword("");
        return;
      }

      if (!profile?.email) {
        toast.error("Username not found or email missing.");
        setErrorMsg("Username not found or email missing.");
        setPassword("");
        return;
      }

      loginEmail = profile.email;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: trimmedPassword,
    });
    setLoading(false);

    if (error) {
      toast.error(error.message);
      setErrorMsg(error.message);
    } else {
      // window.location.reload(); //Old way. Refreshes page but causes flicker
      router.refresh(); // Soft refreshes data without page flicker
      toast.success("Welcome back!");
    }
  };

  // Handle new-user sign-up
  const handleSignUp = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    const trimmedUsernameSignup = usernameSignup.trim().toLowerCase();

    const { data: existing, error: lookupError } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", trimmedUsernameSignup)
      .maybeSingle();

    if (lookupError) {
      setErrorMsg("There was an issue checking that username.");
      return;
    }

    if (existing) {
      setErrorMsg("Username is already taken.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: trimmedEmail,
      password: trimmedPassword,
      options: {
        data: {
          first_name: trimmedFirstName,
          last_name: trimmedLastName,
          username: trimmedUsernameSignup,
        },
      },
    });
    setLoading(false);

    if (error) {
      toast.error(error.message);
      setErrorMsg(error.message);
    } else {
      // window.location.reload();
      router.refresh(); // Soft refreshes data without page flicker
      toast.success(
        "Account created! Check your email to verify your account and login."
      );
    }
  };

  const handleUsernameBlur = async (e) => {
    const raw = e.target.value.trim().toLowerCase();
    setUsernameSignup(raw); // update state cleanly
    setUsernameAvailable(null); // reset result
    setCheckingUsername(true);

    if (!raw) {
      setUsernameAvailable(null);
      setCheckingUsername(false);
      return;
    }

    const { data: existing, error } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", raw)
      .maybeSingle();

    if (error) {
      setUsernameAvailable(null);
    } else {
      setUsernameAvailable(!existing); // true = available
    }

    setCheckingUsername(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-semibold text-center mb-6">
          {isSigningUp
            ? "Create a Here We Grow Account"
            : "Log in to Here We Grow"}
        </h2>

        {errorMsg && (
          <p className="mb-4 text-sm text-red-600 text-center">{errorMsg}</p>
        )}

        {/* If isSigningUp is false, show Sign In form; otherwise show Sign Up form */}
        {!isSigningUp ? (
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label
                htmlFor="loginIdentifier"
                className="block text-sm font-medium text-gray-700"
              >
                Email or Username
              </label>
              <input
                autoFocus
                id="loginIdentifier"
                type="text"
                required
                value={loginIdentifier}
                onChange={(e) => setLoginIdentifier(e.target.value)}
                onBlur={(e) => setLoginIdentifier(e.target.value.trim())}
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={(e) => setPassword(e.target.value.trim())}
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignUp} className="space-y-5">
            <div>
              <label
                htmlFor="firstName"
                className="block text-sm font-medium text-gray-700"
              >
                First Name
              </label>
              <input
                autoFocus
                id="firstName"
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                onBlur={(e) => setFirstName(e.target.value.trim())}
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            <div>
              <label
                htmlFor="lastName"
                className="block text-sm font-medium text-gray-700"
              >
                Last Name
              </label>
              <input
                id="lastName"
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                onBlur={(e) => setLastName(e.target.value.trim())}
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700"
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                required
                value={usernameSignup}
                onChange={(e) =>
                  setUsernameSignup(e.target.value.toLowerCase())
                }
                onBlur={handleUsernameBlur}
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              {checkingUsername && (
                <p className="text-sm text-gray-500 mt-1">
                  Checking username...
                </p>
              )}
              {usernameAvailable === false && (
                <p className="text-sm text-red-600 mt-1">
                  That username is taken.
                </p>
              )}
              {usernameAvailable === true && (
                <p className="text-sm text-green-600 mt-1">
                  Username is available!
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="emailSignup"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                id="emailSignup"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={(e) => setEmail(e.target.value.trim())}
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            <div>
              <label
                htmlFor="passwordSignup"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                id="passwordSignup"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={(e) => setPassword(e.target.value.trim())}
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            <button
              type="submit"
              className={`w-full py-2 text-white font-medium rounded-lg transition ${
                usernameAvailable === false || checkingUsername
                  ? "bg-green-300 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              }`}
              disabled={usernameAvailable !== true || checkingUsername}
            >
              {checkingUsername ? "Checking..." : "Sign Up"}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-gray-500">
          {isSigningUp ? (
            <>
              Already have an account?{" "}
              <button
                onClick={() => {
                  setIsSigningUp(false);
                  setLoginIdentifier("");
                  setPassword("");
                  setErrorMsg("");
                  setFirstName("");
                  setLastName("");
                  setEmail("");
                  setPassword("");
                  setUsernameSignup("");
                  setUsernameAvailable(null);
                }}
                className="text-indigo-600 hover:text-indigo-700 font-medium"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </>
          ) : (
            <>
              Don’t have an account?{" "}
              <button
                onClick={() => {
                  setIsSigningUp(true);
                  setErrorMsg("");
                  setLoginIdentifier("");
                  setPassword("");
                }}
                className="text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Sign up
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
