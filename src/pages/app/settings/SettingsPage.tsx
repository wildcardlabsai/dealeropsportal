import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Save, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useUserDealerId } from "@/hooks/useCustomers";
import { toast } from "sonner";

export default function SettingsPage() {
  const { user } = useAuth();
  const { data: dealerId } = useUserDealerId();
  const queryClient = useQueryClient();

  // Profile data
  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Dealer data
  const { data: dealer, isLoading } = useQuery({
    queryKey: ["dealer", dealerId],
    queryFn: async () => {
      if (!dealerId) return null;
      const { data, error } = await supabase.from("dealers").select("*").eq("id", dealerId).single();
      if (error) throw error;
      return data;
    },
    enabled: !!dealerId,
  });

  const [profileForm, setProfileForm] = useState<Record<string, any>>({});
  const [dealerForm, setDealerForm] = useState<Record<string, any>>({});

  useEffect(() => {
    if (profile) setProfileForm({ ...profile });
  }, [profile]);

  useEffect(() => {
    if (dealer) setDealerForm({ ...dealer });
  }, [dealer]);

  const updateProfile = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not logged in");
      const { id, created_at, updated_at, dealer_id, is_active, avatar_url, ...updates } = profileForm;
      const { error } = await supabase.from("profiles").update(updates).eq("id", user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Profile saved");
    },
    onError: (err: any) => toast.error(err.message || "Failed to save"),
  });

  const updateDealer = useMutation({
    mutationFn: async () => {
      if (!dealerId) throw new Error("No dealer");
      const { id, created_at, updated_at, status, plan_id, ...updates } = dealerForm;
      const { error } = await supabase.from("dealers").update(updates).eq("id", dealerId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dealer"] });
      toast.success("Dealership settings saved");
    },
    onError: (err: any) => toast.error(err.message || "Failed to save"),
  });

  if (isLoading) return <div className="h-40 rounded-xl bg-muted/30 animate-pulse" />;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">Your profile and dealership preferences</p>
      </div>

      <Tabs defaultValue="profile" className="max-w-2xl">
        <TabsList className="mb-4">
          <TabsTrigger value="profile">My Profile</TabsTrigger>
          <TabsTrigger value="dealership">Dealership</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <div className="space-y-6">
            <div className="p-6 rounded-xl border border-border/50 bg-card/50 space-y-4">
              <div className="flex items-center gap-4 mb-2">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">{user?.email}</p>
                  <p className="text-xs text-muted-foreground">User ID: {user?.id?.slice(0, 8)}...</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs">First Name</Label>
                  <Input value={profileForm.first_name || ""} onChange={(e) => setProfileForm({ ...profileForm, first_name: e.target.value })} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Last Name</Label>
                  <Input value={profileForm.last_name || ""} onChange={(e) => setProfileForm({ ...profileForm, last_name: e.target.value })} className="mt-1" />
                </div>
              </div>
              <div>
                <Label className="text-xs">Phone</Label>
                <Input value={profileForm.phone || ""} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} className="mt-1" />
              </div>
            </div>
            <Button onClick={() => updateProfile.mutate()} disabled={updateProfile.isPending}>
              <Save className="h-4 w-4 mr-2" /> {updateProfile.isPending ? "Saving..." : "Save Profile"}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="dealership">
          <div className="space-y-6">
            <div className="p-6 rounded-xl border border-border/50 bg-card/50 space-y-4">
              <h3 className="text-sm font-semibold">Dealership Profile</h3>
              <div>
                <Label className="text-xs">Business Name</Label>
                <Input value={dealerForm.name || ""} onChange={(e) => setDealerForm({ ...dealerForm, name: e.target.value })} className="mt-1" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs">Phone</Label>
                  <Input value={dealerForm.phone || ""} onChange={(e) => setDealerForm({ ...dealerForm, phone: e.target.value })} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Email</Label>
                  <Input value={dealerForm.email || ""} onChange={(e) => setDealerForm({ ...dealerForm, email: e.target.value })} className="mt-1" />
                </div>
              </div>
              <div>
                <Label className="text-xs">Website</Label>
                <Input value={dealerForm.website || ""} onChange={(e) => setDealerForm({ ...dealerForm, website: e.target.value })} className="mt-1" />
              </div>
            </div>

            <div className="p-6 rounded-xl border border-border/50 bg-card/50 space-y-4">
              <h3 className="text-sm font-semibold">Address</h3>
              <div>
                <Label className="text-xs">Address Line 1</Label>
                <Input value={dealerForm.address_line1 || ""} onChange={(e) => setDealerForm({ ...dealerForm, address_line1: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Address Line 2</Label>
                <Input value={dealerForm.address_line2 || ""} onChange={(e) => setDealerForm({ ...dealerForm, address_line2: e.target.value })} className="mt-1" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs">City</Label>
                  <Input value={dealerForm.city || ""} onChange={(e) => setDealerForm({ ...dealerForm, city: e.target.value })} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Postcode</Label>
                  <Input value={dealerForm.postcode || ""} onChange={(e) => setDealerForm({ ...dealerForm, postcode: e.target.value })} className="mt-1" />
                </div>
              </div>
            </div>

            <Button onClick={() => updateDealer.mutate()} disabled={updateDealer.isPending}>
              <Save className="h-4 w-4 mr-2" /> {updateDealer.isPending ? "Saving..." : "Save Dealership"}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
