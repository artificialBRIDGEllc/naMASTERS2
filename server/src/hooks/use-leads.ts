import { useQueryClient } from "@tanstack/react-query";
import { useGetLeads, useCreateOrImportLeads, getGetLeadsQueryKey } from "@workspace/api-client-react";
import { useToast } from "@/components/ui/use-toast";

export function useLeads(page = 1, status?: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const params = { page, limit: 50, ...(status ? { status } : {}) };
  const { data, isLoading, isFetching, isPlaceholderData } = useGetLeads(
    params,
    {
      query: {
        queryKey: getGetLeadsQueryKey(params),
        placeholderData: (prev) => prev,
      }
    }
  );

  const importMutation = useCreateOrImportLeads({
    mutation: {
      onSuccess: (res) => {
        queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
        if ("imported" in res) {
          toast({
            title: "Import Complete",
            description: `Imported ${res.imported} leads. Skipped ${res.skipped}.`,
          });
        } else {
          toast({
            title: "Lead Created",
            description: "New lead was added successfully.",
          });
        }
      },
      onError: () => {
        toast({
          variant: "destructive",
          title: "Import Failed",
          description: "Could not process the leads.",
        });
      },
    }
  });

  return {
    leads: data?.leads || [],
    total: data?.total || 0,
    stats: data?.stats,
    isLoading,
    isFetching: isFetching || isPlaceholderData,
    importLeads: importMutation.mutateAsync,
    isImporting: importMutation.isPending,
  };
}
