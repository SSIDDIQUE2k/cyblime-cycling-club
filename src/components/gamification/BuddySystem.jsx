import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { UserPlus, Send, Check, X, Heart } from "lucide-react";

export default function BuddySystem({ user }) {
  const queryClient = useQueryClient();
  const [inviteEmail, setInviteEmail] = useState("");
  const [motivationMessage, setMotivationMessage] = useState("");
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

  const { data: buddies = [] } = useQuery({
    queryKey: ['buddies', user?.email],
    queryFn: async () => {
      if (!user) return [];
      const myBuddies = await base44.entities.Buddy.filter({ user_email: user.email });
      const buddyRequests = await base44.entities.Buddy.filter({ buddy_email: user.email });
      return [...myBuddies, ...buddyRequests];
    },
    enabled: !!user
  });

  const sendInviteMutation = useMutation({
    mutationFn: async () => {
      return await base44.entities.Buddy.create({
        user_email: user.email,
        buddy_email: inviteEmail,
        status: 'pending'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buddies'] });
      setInviteEmail("");
      setInviteDialogOpen(false);
    }
  });

  const respondToInviteMutation = useMutation({
    mutationFn: async ({ buddyId, status }) => {
      return await base44.entities.Buddy.update(buddyId, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buddies'] });
    }
  });

  const sendMotivationMutation = useMutation({
    mutationFn: async (buddyId) => {
      return await base44.entities.Buddy.update(buddyId, {
        motivation_message: motivationMessage
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buddies'] });
      setMotivationMessage("");
    }
  });

  const acceptedBuddies = buddies.filter(b => b.status === 'accepted');
  const pendingRequests = buddies.filter(b => 
    b.status === 'pending' && b.buddy_email === user?.email
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[var(--cy-text)]">Cycling Buddies</h2>
          <p className="text-sm text-[var(--cy-text-muted)]">Connect and motivate each other</p>
        </div>
        <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#6BCBFF] hover:bg-[#5bb5e6]">
              <UserPlus className="w-4 h-4 mr-2" />
              Invite Buddy
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite a Cycling Buddy</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Enter buddy's email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
              <Button 
                onClick={() => sendInviteMutation.mutate()}
                className="w-full bg-[#6BCBFF] hover:bg-[#5bb5e6]"
              >
                Send Invite
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <Card className="border-2 border-[#6BCBFF]">
          <CardHeader>
            <CardTitle className="text-lg">Pending Requests</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingRequests.map((request) => (
              <div key={request.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-semibold">{request.user_email}</p>
                  <p className="text-sm text-[var(--cy-text-muted)]">Wants to be your buddy</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => respondToInviteMutation.mutate({ buddyId: request.id, status: 'accepted' })}
                    className="bg-[#A4FF4F] text-[var(--cy-text)] hover:bg-[#94ef3f]"
                  >
                    <Check className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => respondToInviteMutation.mutate({ buddyId: request.id, status: 'declined' })}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* My Buddies */}
      <div className="grid md:grid-cols-2 gap-4">
        {acceptedBuddies.map((buddy) => {
          const buddyEmail = buddy.user_email === user?.email ? buddy.buddy_email : buddy.user_email;
          return (
            <Card key={buddy.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{buddyEmail.split('@')[0]}</CardTitle>
                  <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {buddy.motivation_message && (
                  <div className="p-3 bg-[#A4FF4F]/20 rounded-lg">
                    <p className="text-sm">{buddy.motivation_message}</p>
                  </div>
                )}
                <div className="flex gap-2">
                  <Input
                    placeholder="Send motivation..."
                    value={motivationMessage}
                    onChange={(e) => setMotivationMessage(e.target.value)}
                  />
                  <Button
                    size="icon"
                    onClick={() => sendMotivationMutation.mutate(buddy.id)}
                    className="bg-[#ff6b35] hover:bg-[#e55a2b]"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}