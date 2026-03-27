"use client";

import { GoogleOutlined } from "@ant-design/icons";
import { Button, Card, Form, Input, message } from "antd";
import { useRouter } from "next/navigation";
import { useState } from "react";

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
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-page py-section sm:py-12">
      <div className="mb-section text-center">
        <h1 className="text-display font-bold tracking-tight text-foreground">Habit Rabbit</h1>
        <p className="mt-inline text-body-sm text-muted-fg">
          Log habits, streaks, and fitness in one place.
        </p>
      </div>
      <Card
        title={isSignUp ? "Create account" : "Sign in"}
        className="w-full max-w-md rounded-2xl border border-border-subtle bg-surface shadow-2xl shadow-black/40"
        styles={{
          header: {
            borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          },
        }}
      >
        <Form
          name="auth"
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
          className="pt-tight"
        >
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Enter your email" },
              { type: "email", message: "Enter a valid email" },
            ]}
          >
            <Input type="email" size="large" placeholder="you@example.com" />
          </Form.Item>
          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: "Enter your password" }]}
          >
            <Input.Password size="large" placeholder="••••••••" />
          </Form.Item>
          <Form.Item className="!mb-inline">
            <Button type="primary" htmlType="submit" block size="large" loading={submitting}>
              {isSignUp ? "Sign up" : "Sign in"}
            </Button>
          </Form.Item>
          <Form.Item className="!mb-tight">
            <Button
              type="default"
              block
              size="large"
              loading={googleLoading}
              onClick={handleGoogleSignIn}
              disabled={submitting}
              icon={<GoogleOutlined />}
            >
              Continue with Google
            </Button>
          </Form.Item>
          <div className="text-center text-body-sm text-muted-fg">
            <button
              type="button"
              onClick={() => setIsSignUp((v) => !v)}
              className="text-lime-400/90 underline-offset-2 hover:text-lime-300 hover:underline"
            >
              {isSignUp ? "Already have an account? Sign in" : "Need an account? Sign up"}
            </button>
          </div>
        </Form>
      </Card>
    </div>
  );
}
