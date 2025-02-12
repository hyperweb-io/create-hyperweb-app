import { useToast } from './useToast';

enum TxStatus {
  Failed = 'Transaction Failed',
  Successful = 'Transaction Successful',
  Broadcasting = 'Transaction Broadcasting',
}

export function useToastHandlers() {
  const { toast } = useToast();

  return {
    onMutate: () => {
      const id = toast({
        title: TxStatus.Broadcasting,
        description: 'Waiting for transaction to be included in the block',
        type: 'loading',
        duration: 999999,
      });
      return { toastId: id };
    },
    onSuccess: (_data: unknown, _variables: unknown, context: any) => {
      toast.close(context?.toastId);

      toast({
        title: TxStatus.Successful,
        type: 'success',
        description: 'Your transaction has been successfully completed',
      });
    },
    onError: (error: unknown, _variables: unknown, context: any) => {
      toast.close(context?.toastId);

      toast({
        title: TxStatus.Failed,
        description:
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred',
        type: 'error',
        duration: 10000,
      });
    },
  };
}
