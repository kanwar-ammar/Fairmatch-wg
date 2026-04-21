"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, LogIn, UserPlus } from "lucide-react";

import { getStoredAuthUser, setStoredAuthUser } from "@/lib/session";
import { GERMAN_REGIONS } from "@/lib/german-regions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AuthPage() {
  const router = useRouter();

  const [tab, setTab] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });

  const [signupForm, setSignupForm] = useState({
    fullName: "",
    location: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    if (getStoredAuthUser()) {
      router.replace("/");
    }
  }, [router]);

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginForm),
      });

      const result = await response.json();
      if (!response.ok) {
        setError(result.error || "Login failed.");
        return;
      }

      setStoredAuthUser(result.user);
      setSuccess("Login successful. Redirecting...");
      router.push("/");
    } catch {
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signupForm),
      });

      const result = await response.json();
      if (!response.ok) {
        setError(result.error || "Signup failed.");
        return;
      }

      setSuccess("Account created. Log in to continue.");
      setTab("login");
      setLoginForm((prev) => ({ ...prev, email: signupForm.email }));
      setSignupForm({ fullName: "", location: "", email: "", password: "" });
    } catch {
      setError("Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto grid min-h-screen w-full max-w-5xl gap-6 p-4 md:grid-cols-[320px_1fr] md:p-8">
        <Card className="rounded-3xl border-border shadow-sm md:sticky md:top-8 md:h-fit">
          <CardHeader>
            <Badge className="w-fit rounded-full border-0 bg-primary/12 text-primary">
              FairMatch WG
            </Badge>
            <CardTitle className="text-2xl">
              One account, two contexts
            </CardTitle>
            <CardDescription className="font-body text-sm leading-relaxed">
              Create one user account. After login, you can switch between
              Student and Resident context based on your WG membership.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p className="rounded-xl bg-muted/50 p-3">
              Signup is now intentionally simple: name, location, email, and
              password.
            </p>
            <p className="rounded-xl bg-muted/50 p-3">
              Profile details, house joining, and resident setup happen after
              authentication.
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl">Account Access</CardTitle>
            <CardDescription>
              Sign in to your existing account or create a new one.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Tabs
              value={tab}
              onValueChange={(next) => setTab(next as "login" | "signup")}
            >
              <TabsList className="h-auto rounded-xl bg-muted p-1">
                <TabsTrigger value="login" className="gap-2 rounded-lg text-xs">
                  <LogIn className="h-3.5 w-3.5" /> Login
                </TabsTrigger>
                <TabsTrigger
                  value="signup"
                  className="gap-2 rounded-lg text-xs"
                >
                  <UserPlus className="h-3.5 w-3.5" /> Signup
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="mt-4 space-y-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={loginForm.email}
                    onChange={(e) =>
                      setLoginForm((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input
                    type="password"
                    placeholder="Your password"
                    value={loginForm.password}
                    onChange={(e) =>
                      setLoginForm((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                    className="rounded-xl"
                  />
                </div>
                <Button
                  className="w-full rounded-xl gap-2"
                  onClick={handleLogin}
                  disabled={loading}
                >
                  {loading ? "Logging in..." : "Login"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </TabsContent>

              <TabsContent value="signup" className="mt-4 space-y-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input
                    placeholder="Ammar Ali"
                    value={signupForm.fullName}
                    onChange={(e) =>
                      setSignupForm((prev) => ({
                        ...prev,
                        fullName: e.target.value,
                      }))
                    }
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input
                    placeholder="Berlin"
                    value={signupForm.location}
                    onChange={(e) =>
                      setSignupForm((prev) => ({
                        ...prev,
                        location: e.target.value,
                      }))
                    }
                    list="auth-region-options"
                    className="rounded-xl"
                  />
                  <datalist id="auth-region-options">
                    {GERMAN_REGIONS.map((region) => (
                      <option key={region} value={region} />
                    ))}
                  </datalist>
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={signupForm.email}
                    onChange={(e) =>
                      setSignupForm((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input
                    type="password"
                    placeholder="At least 8 characters"
                    value={signupForm.password}
                    onChange={(e) =>
                      setSignupForm((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                    className="rounded-xl"
                  />
                </div>
                <Button
                  className="w-full rounded-xl gap-2"
                  onClick={handleSignup}
                  disabled={loading}
                >
                  {loading ? "Creating account..." : "Create account"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </TabsContent>
            </Tabs>

            {error && <p className="text-sm text-destructive">{error}</p>}
            {success && <p className="text-sm text-accent">{success}</p>}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
