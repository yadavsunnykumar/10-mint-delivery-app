import { useState } from "react";
import {
  X,
  CreditCard,
  Smartphone,
  Banknote,
  CheckCircle,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Lock,
  Clock,
  MapPin,
} from "lucide-react";

import { CURRENCY_SYMBOL } from "@/lib/constants";

type PaymentMethod = "upi" | "card" | "cod";
type Step = "method" | "details" | "processing" | "success";

interface OrderResult {
  orderId: string;
  eta: number;
  warehouseName: string;
  distanceKm: number;
}

interface PaymentModalProps {
  grandTotal: number;
  itemCount: number;
  deliveryFee: number;
  onConfirm: () => Promise<OrderResult>;
  onClose: () => void;
  onViewOrders: () => void;
}

const PaymentModal = ({
  grandTotal,
  itemCount,
  deliveryFee,
  onConfirm,
  onClose,
  onViewOrders,
}: PaymentModalProps) => {
  const [step, setStep] = useState<Step>("method");
  const [method, setMethod] = useState<PaymentMethod>("upi");
  const [upiId, setUpiId] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardName, setCardName] = useState("");
  const [orderResult, setOrderResult] = useState<OrderResult | null>(null);
  const [payError, setPayError] = useState("");

  const canProceedDetails = () => {
    if (method === "upi") return upiId.includes("@") && upiId.length > 3;
    if (method === "card")
      return (
        cardNumber.replace(/\s/g, "").length >= 12 &&
        cardExpiry.length >= 4 &&
        cardCvv.length >= 3 &&
        cardName.length > 2
      );
    return true;
  };

  const handlePrimary = async () => {
    if (step === "method") {
      if (method === "cod") {
        await runPayment();
      } else {
        setStep("details");
      }
      return;
    }
    if (step === "details") {
      await runPayment();
    }
  };

  const runPayment = async () => {
    setStep("processing");
    setPayError("");
    // Small UX delay so the processing screen is visible
    await new Promise((r) => setTimeout(r, 1800));
    try {
      const result = await onConfirm();
      setOrderResult(result);
      // Append to the active-orders list so the banner tracks multiple orders
      try {
        const raw = localStorage.getItem("everest_active_orders");
        const existing = raw ? JSON.parse(raw) : [];
        existing.push({
          orderId: result.orderId,
          eta: result.eta,
          placedAt: Date.now(),
        });
        localStorage.setItem("everest_active_orders", JSON.stringify(existing));
        window.dispatchEvent(new Event("everest_order_placed"));
      } catch {
        /* ignore */
      }
      setStep("success");
    } catch (err: unknown) {
      setPayError((err as Error)?.message || "Payment failed. Please retry.");
      setStep("method");
    }
  };

  const isProcessingOrSuccess = step === "processing" || step === "success";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
      onClick={!isProcessingOrSuccess ? onClose : undefined}
    >
      <div
        className="bg-card rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {!isProcessingOrSuccess && (
          <div className="flex items-center justify-between p-5 border-b border-border">
            <div className="flex items-center gap-2">
              {step === "details" && (
                <button
                  onClick={() => setStep("method")}
                  className="text-muted-foreground hover:text-foreground mr-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              )}
              <Lock className="w-4 h-4 text-primary" />
              <h2 className="text-base font-bold text-foreground">
                {step === "method" ? "Secure Checkout" : "Payment Details"}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Order summary strip */}
        {(step === "method" || step === "details") && (
          <div className="bg-secondary/60 px-5 py-3 flex items-center justify-between text-sm border-b border-border">
            <span className="text-muted-foreground">
              {itemCount} item{itemCount !== 1 ? "s" : ""} ·{" "}
              {deliveryFee === 0
                ? "Free delivery"
                : `${CURRENCY_SYMBOL}${deliveryFee} delivery`}
            </span>
            <span className="font-bold text-foreground text-base">
              {CURRENCY_SYMBOL}
              {grandTotal}
            </span>
          </div>
        )}

        {/* Error */}
        {payError && step === "method" && (
          <div className="mx-5 mt-4 p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-xs text-destructive font-medium">
            {payError}
          </div>
        )}

        {/* ─── Step: Method ─── */}
        {step === "method" && (
          <div className="p-5 space-y-3">
            <p className="text-sm font-semibold text-foreground mb-1">
              Select Payment Method
            </p>

            {(["upi", "card", "cod"] as PaymentMethod[]).map((m) => (
              <button
                key={m}
                onClick={() => setMethod(m)}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${
                  method === m
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/40"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    method === m ? "bg-primary/10" : "bg-secondary"
                  }`}
                >
                  {m === "upi" && (
                    <Smartphone
                      className={`w-5 h-5 ${method === m ? "text-primary" : "text-muted-foreground"}`}
                    />
                  )}
                  {m === "card" && (
                    <CreditCard
                      className={`w-5 h-5 ${method === m ? "text-primary" : "text-muted-foreground"}`}
                    />
                  )}
                  {m === "cod" && (
                    <Banknote
                      className={`w-5 h-5 ${method === m ? "text-primary" : "text-muted-foreground"}`}
                    />
                  )}
                </div>
                <div className="text-left flex-1">
                  <p
                    className={`text-sm font-semibold ${
                      method === m ? "text-primary" : "text-foreground"
                    }`}
                  >
                    {m === "upi"
                      ? "eSewa / Khalti / FonePay"
                      : m === "card"
                        ? "Credit / Debit Card"
                        : "Cash on Delivery"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {m === "upi"
                      ? "Pay instantly via eSewa / Khalti"
                      : m === "card"
                        ? "Visa, Mastercard accepted"
                        : "Pay when you receive"}
                  </p>
                </div>
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    method === m
                      ? "border-primary"
                      : "border-muted-foreground/40"
                  }`}
                >
                  {method === m && (
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  )}
                </div>
              </button>
            ))}

            <button
              onClick={handlePrimary}
              className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold py-3 rounded-xl hover:opacity-90 mt-2 text-sm"
            >
              {method === "cod" ? "Place Order" : "Continue"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ─── Step: Details ─── */}
        {step === "details" && (
          <div className="p-5 space-y-4">
            {method === "upi" && (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    UPI ID
                  </label>
                  <input
                    type="text"
                    placeholder="username@fonepay"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="w-full bg-secondary text-foreground border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {["@fonepay", "@esewa", "@khalti", "@imepay"].map(
                    (suffix) => (
                      <button
                        key={suffix}
                        onClick={() =>
                          setUpiId((prev) => prev.split("@")[0] + suffix)
                        }
                        className="text-xs border border-border text-muted-foreground px-2.5 py-1 rounded-full hover:border-primary hover:text-primary transition-colors"
                      >
                        {suffix}
                      </button>
                    ),
                  )}
                </div>
              </>
            )}

            {method === "card" && (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Card Number
                  </label>
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                    value={cardNumber}
                    onChange={(e) =>
                      setCardNumber(
                        e.target.value
                          .replace(/[^0-9]/g, "")
                          .replace(/(\d{4})/g, "$1 ")
                          .trim(),
                      )
                    }
                    className="w-full bg-secondary text-foreground border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 font-mono tracking-wider"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Name on Card
                  </label>
                  <input
                    type="text"
                    placeholder="Your Name"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    className="w-full bg-secondary text-foreground border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Expiry
                    </label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      maxLength={5}
                      value={cardExpiry}
                      onChange={(e) => {
                        const v = e.target.value.replace(/[^0-9]/g, "");
                        setCardExpiry(
                          v.length > 2 ? `${v.slice(0, 2)}/${v.slice(2)}` : v,
                        );
                      }}
                      className="w-full bg-secondary text-foreground border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      CVV
                    </label>
                    <input
                      type="password"
                      placeholder="•••"
                      maxLength={4}
                      value={cardCvv}
                      onChange={(e) =>
                        setCardCvv(e.target.value.replace(/[^0-9]/g, ""))
                      }
                      className="w-full bg-secondary text-foreground border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={handlePrimary}
              disabled={!canProceedDetails()}
              className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold py-3 rounded-xl hover:opacity-90 disabled:opacity-60 text-sm"
            >
              Pay {CURRENCY_SYMBOL}
              {grandTotal}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ─── Step: Processing ─── */}
        {step === "processing" && (
          <div className="p-12 flex flex-col items-center gap-5 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">
                Processing Payment
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Please wait, do not close this window…
              </p>
            </div>
          </div>
        )}

        {/* ─── Step: Success ─── */}
        {step === "success" && orderResult && (
          <div className="p-8 flex flex-col items-center gap-4 text-center">
            <CheckCircle className="w-16 h-16 text-green-500" />
            <div>
              <p className="text-xl font-bold text-foreground">
                Order Confirmed!
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {orderResult.orderId}
              </p>
            </div>

            {orderResult.warehouseName && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <MapPin className="w-3 h-3 flex-shrink-0" />
                Dispatching from{" "}
                <span className="font-medium text-foreground">
                  {orderResult.warehouseName}
                </span>
                {orderResult.distanceKm > 0 && (
                  <> · {orderResult.distanceKm} km</>
                )}
              </p>
            )}

            <div className="flex items-center gap-2 bg-primary/10 text-primary font-semibold px-4 py-2 rounded-xl text-sm">
              <Clock className="w-4 h-4" />
              Delivery in {orderResult.eta} minutes
            </div>

            <div className="flex flex-col gap-2 w-full pt-2">
              <button
                onClick={onViewOrders}
                className="w-full bg-primary text-primary-foreground font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity text-sm"
              >
                View Orders
              </button>
              <button
                onClick={onClose}
                className="w-full text-muted-foreground font-medium py-2 text-sm hover:text-foreground transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentModal;
