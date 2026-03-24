import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CreditCard, Ticket } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function TicketPurchaseDialog({ event, open, onOpenChange }) {
  const queryClient = useQueryClient();
  const [ticketType, setTicketType] = useState("general");
  const [processing, setProcessing] = useState(false);

  const ticketTypes = {
    general: { name: "General Admission", price: event?.price || 25 },
    early_bird: { name: "Early Bird", price: (event?.price || 25) * 0.8 },
    vip: { name: "VIP Access", price: (event?.price || 25) * 1.5 }
  };

  const purchaseMutation = useMutation({
    mutationFn: async (data) => {
      // Generate unique ticket ID
      const ticketId = `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Simulate Stripe payment
      // In production, this would call Stripe API
      const payment = await simulateStripePayment(data.price);
      
      return base44.entities.Ticket.create({
        event_id: data.event_id,
        event_name: data.event_name,
        ticket_type: data.ticket_type,
        price: data.price,
        ticket_id: ticketId,
        payment_status: "completed",
        stripe_payment_id: payment.id
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userTickets'] });
      alert('Ticket purchased successfully! Check your email for confirmation.');
      onOpenChange(false);
    }
  });

  const simulateStripePayment = async (amount) => {
    // In production, integrate real Stripe
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ id: `pi_${Math.random().toString(36).substr(2, 24)}` });
      }, 1000);
    });
  };

  const handlePurchase = async () => {
    if (!event) return;
    
    setProcessing(true);
    try {
      await purchaseMutation.mutateAsync({
        event_id: event.id,
        event_name: event.title,
        ticket_type: ticketType,
        price: ticketTypes[ticketType].price
      });
    } catch (error) {
      console.error("Purchase error:", error);
    }
    setProcessing(false);
  };

  if (!event) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ticket className="w-5 h-5 text-[#ff6b35]" />
            Purchase Ticket
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-xl">
            <h3 className="font-semibold text-[var(--cy-text)] mb-2">{event.title}</h3>
            <div className="text-sm text-[var(--cy-text-muted)]">
              {event.date} • {event.location}
            </div>
          </div>

          <div>
            <Label>Ticket Type</Label>
            <Select value={ticketType} onValueChange={setTicketType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(ticketTypes).map(([key, value]) => (
                  <SelectItem key={key} value={key}>
                    {value.name} - ${value.price}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="p-4 border-2 border-dashed border-gray-300 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[var(--cy-text-muted)]">Ticket Price</span>
              <span className="font-bold text-[var(--cy-text)]">${ticketTypes[ticketType].price}</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[var(--cy-text-muted)]">Service Fee</span>
              <span className="font-bold text-[var(--cy-text)]">$2.50</span>
            </div>
            <div className="border-t pt-2 flex items-center justify-between">
              <span className="font-semibold text-[var(--cy-text)]">Total</span>
              <span className="font-bold text-[#ff6b35] text-xl">
                ${(ticketTypes[ticketType].price + 2.5).toFixed(2)}
              </span>
            </div>
          </div>

          <Button
            onClick={handlePurchase}
            disabled={processing}
            className="w-full bg-[#ff6b35] hover:bg-[#e55a2b] text-white"
          >
            {processing ? (
              "Processing..."
            ) : (
              <>
                <CreditCard className="w-4 h-4 mr-2" />
                Complete Purchase
              </>
            )}
          </Button>

          <p className="text-xs text-[var(--cy-text-muted)] text-center">
            Powered by Stripe • Secure payment processing
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}