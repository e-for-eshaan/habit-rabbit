"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Form, Input, Button, Card, message } from "antd";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const onFinish = async (values: { email: string; password: string }) => {
    setSubmitting(true);
    try {
      if (isSignUp) {
        await signUp(values.email, values.password);
        message.success("Account created. Signing you in.");
      } else {
        await signIn(values.email, values.password);
        message.success("Signed in.");
      }
      router.push("/");
      router.refresh();
    } catch (e) {
      message.error(e instanceof Error ? e.message : "Authentication failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      message.success("Signed in with Google.");
      router.push("/");
      router.refresh();
    } catch (e) {
      message.error(e instanceof Error ? e.message : "Google sign-in failed");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card title={isSignUp ? "Create account" : "Sign in"} className="w-full max-w-md">
        <Form name="auth" layout="vertical" onFinish={onFinish} autoComplete="off">
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Enter your email" },
              { type: "email", message: "Enter a valid email" },
            ]}
          >
            <Input type="email" placeholder="you@example.com" />
          </Form.Item>
          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: "Enter your password" }]}
          >
            <Input.Password placeholder="••••••••" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={submitting}>
              {isSignUp ? "Sign up" : "Sign in"}
            </Button>
          </Form.Item>
          <Form.Item>
            <Button
              type="default"
              block
              loading={googleLoading}
              onClick={handleGoogleSignIn}
              disabled={submitting}
            >
              Sign in with Google
            </Button>
          </Form.Item>
          <div className="text-center text-sm text-stone-500">
            <button
              type="button"
              onClick={() => setIsSignUp((v) => !v)}
              className="underline hover:text-stone-700 dark:hover:text-stone-300"
            >
              {isSignUp ? "Already have an account? Sign in" : "Need an account? Sign up"}
            </button>
          </div>
        </Form>
      </Card>
    </div>
  );
}
