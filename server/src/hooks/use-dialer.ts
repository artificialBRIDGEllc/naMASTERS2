import { useQueryClient } from "@tanstack/react-query";
import { useCallAction, useGetDispositions, getGetDispositionsQueryKey } from "@workspace/api-client-react";
import { useToast } from "@/components/ui/use-toast";

export function useDialer() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: dispositions = [] } = useGetDispositions({
    query: {
      queryKey: getGetDispositionsQueryKey(),
      staleTime: Infinity,
    }
  });

  const callActionMutation = useCallAction({
    mutation: {
      onSuccess: (_data, variables) => {
        queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
        queryClient.invalidateQueries({ queryKey: ["/api/analytics"] });

        if (variables.data.action === "disposition") {
          toast({
            title: "Disposition Saved",
            description: "Lead status updated successfully.",
          });
        }
      },
      onError: () => {
        toast({
          variant: "destructive",
          title: "Call Action Failed",
          description: "An unexpected error occurred.",
        });
      },
    },
  });

  return {
    dispositions,
    callAction: callActionMutation.mutateAsync,
    isActionPending: callActionMutation.isPending,
  };
}
