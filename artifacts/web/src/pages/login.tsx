import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLogin } from "@workspace/api-client-react";
import { useAuthStore } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { HardHat } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const [, setLocation] = useLocation();
  const { user, setUser } = useAuthStore();
  const { toast } = useToast();
  const loginMutation = useLogin();

  useEffect(() => {
    if (user) {
      setLocation(user.role === "admin" ? "/dashboard" : "/entry");
    }
  }, [user, setLocation]);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(
      { data },
      {
        onSuccess: (res) => {
          setUser(res.user, res.token);
          toast({ title: "Welcome back", description: "Successfully signed in." });
          setLocation(res.user.role === "admin" ? "/dashboard" : "/entry");
        },
        onError: (err) => {
          toast({
            variant: "destructive",
            title: "Sign in failed",
            description: (err as any)?.data?.error || err.message || "Please check your credentials and try again.",
          });
        },
      }
    );
  };

  return (
    <div className="min-h-[100dvh] bg-muted flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="bg-primary text-primary-foreground p-3 rounded-lg shadow-lg">
            <HardHat className="w-10 h-10" />
          </div>
        </div>
        
        <Card className="border-t-4 border-t-primary shadow-xl">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-2xl font-bold">ARN INFRA</CardTitle>
            <CardDescription className="text-base uppercase tracking-wider font-medium text-muted-foreground">
              Field Management System
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input placeholder="operator@arninfra.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full font-bold text-lg h-12" 
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? "Authenticating..." : "Access System"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
