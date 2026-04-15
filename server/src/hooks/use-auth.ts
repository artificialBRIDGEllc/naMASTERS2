import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useGetMe, useLogin, useLogout, useSignup, getGetMeQueryKey } from "@workspace/api-client-react";
import { useToast } from "@/components/ui/use-toast";

export function useAuth() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: user, isLoading: isLoadingUser } = useGetMe({
    query: {
      queryKey: getGetMeQueryKey(),
      retry: false,
      staleTime: 5 * 60 * 1000,
    }
  });

  const loginMutation = useLogin({
    mutation: {
      onSuccess: (data) => {
        queryClient.setQueryData(getGetMeQueryKey(), data);
        toast({
          title: "Welcome back!",
          description: "You have successfully logged in.",
        });
        setLocation("/");
      },
      onError: () => {
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: "Invalid email or password.",
        });
      },
    },
  });

  const signupMutation = useSignup({
    mutation: {
      onSuccess: (data) => {
        queryClient.setQueryData(getGetMeQueryKey(), data);
        toast({
          title: "Welcome!",
          description: "Your account has been created.",
        });
        setLocation("/");
      },
      onError: (error: { response?: { status?: number } }) => {
        const msg = error?.response?.status === 409
          ? "An account with this email already exists."
          : "Could not create account. Please try again.";
        toast({
          variant: "destructive",
          title: "Sign Up Failed",
          description: msg,
        });
      },
    },
  });

  const logoutMutation = useLogout({
    mutation: {
      onSuccess: () => {
        queryClient.setQueryData(getGetMeQueryKey(), null);
        queryClient.clear();
        setLocation("/login");
        toast({
          title: "Logged out",
          description: "You have been securely logged out.",
        });
      },
    },
  });

  return {
    user,
    isLoadingUser,
    isAuthenticated: !!user,
    login: loginMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    signup: signupMutation.mutate,
    isSigningUp: signupMutation.isPending,
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
  };
}
