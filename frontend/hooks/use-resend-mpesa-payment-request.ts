"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { resendMpesaPaymentRequest } from "@/services/billing-service";

export function useResendMpesaPaymentRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (paymentId: number) => resendMpesaPaymentRequest(paymentId),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["billing-invoices"] });
      queryClient.invalidateQueries({ queryKey: ["billing-dashboard"] });
      if (result.payment?.invoiceId) {
        queryClient.invalidateQueries({
          queryKey: ["billing-invoice", result.payment.invoiceId],
        });
      }
    },
  });
}
