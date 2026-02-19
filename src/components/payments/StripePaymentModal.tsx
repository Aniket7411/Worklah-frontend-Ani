import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface StripePaymentModalProps {
  publishableKey: string;
  clientSecret: string;
  amount: number;
  currency: string;
  onSuccess: () => void;
  onClose: () => void;
}

function PaymentForm({ onSuccess, onClose }: { onSuccess: () => void; onClose: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.href,
          payment_method_data: {
            billing_details: {
              name: "Admin",
            },
          },
        },
      });

      if (error) {
        toast.error(error.message || "Payment failed");
        setLoading(false);
        return;
      }
      toast.success("Payment successful");
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err?.message || "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement
        options={{
          layout: "tabs",
          defaultCollapsed: false,
          radios: true,
          spacedAccordionItems: false,
        }}
      />
      <div className="flex gap-3 justify-end pt-2">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!stripe || !elements || loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Pay now"
          )}
        </button>
      </div>
    </form>
  );
}

export default function StripePaymentModal({
  publishableKey,
  clientSecret,
  amount,
  currency,
  onSuccess,
  onClose,
}: StripePaymentModalProps) {
  const [stripePromise] = useState(() =>
    publishableKey ? loadStripe(publishableKey) : null
  );

  const options = {
    clientSecret,
    appearance: {
      theme: "stripe" as const,
      variables: {
        colorPrimary: "#2563eb",
      },
    },
  };

  if (!stripePromise || !clientSecret) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
          <p className="text-gray-600">Loading payment form...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">Pay with card</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded"
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Amount: {currency} {typeof amount === "number" ? amount.toFixed(2) : amount}
        </p>
        <Elements stripe={stripePromise} options={options}>
          <PaymentForm onSuccess={onSuccess} onClose={onClose} />
        </Elements>
      </div>
    </div>
  );
}
