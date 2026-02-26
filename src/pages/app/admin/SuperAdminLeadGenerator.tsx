import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import {
  Search, MapPin, Building2, Mail, Phone, Globe, Sparkles,
  Send, Loader2, CheckCircle, Crosshair, RefreshCw,
} from "lucide-react";

type Dealership = {
  name: string;
  location: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
};

type EmailDraft = {
  subject: string;
  body: string;
};

export default function SuperAdminLeadGenerator() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<"city" | "postcode">("city");
  const [radius, setRadius] = useState("25");
  const [results, setResults] = useState<Dealership[]>([]);
  const [selectedDealership, setSelectedDealership] = useState<Dealership | null>(null);
  const [emailDraft, setEmailDraft] = useState<EmailDraft | null>(null);
  const [editedSubject, setEditedSubject] = useState("");
  const [editedBody, setEditedBody] = useState("");
  const queryClient = useQueryClient();

  // Saved leads
  const { data: savedLeads = [] } = useQuery({
    queryKey: ["generated-leads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("generated_leads")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
  });

  // Search mutation
  const searchMutation = useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/search-dealerships`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            query: searchQuery,
            searchType,
            radius: searchType === "postcode" ? parseInt(radius) : undefined,
          }),
        }
      );

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Search failed");
      }
      return response.json();
    },
    onSuccess: (data) => {
      setResults(data.dealerships || []);
      if (data.dealerships?.length === 0) {
        toast.info("No dealerships found. Try a different search.");
      } else {
        toast.success(`Found ${data.dealerships.length} dealerships`);
      }
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  // Generate email mutation
  const generateEmailMutation = useMutation({
    mutationFn: async (dealership: Dealership) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-pitch-email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            dealershipName: dealership.name,
            location: dealership.location,
            email: dealership.email,
            phone: dealership.phone,
          }),
        }
      );

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Email generation failed");
      }
      return response.json();
    },
    onSuccess: (data) => {
      setEmailDraft({ subject: data.subject, body: data.body });
      setEditedSubject(data.subject);
      setEditedBody(data.body);
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  // Save & send mutation
  const sendEmailMutation = useMutation({
    mutationFn: async () => {
      if (!selectedDealership?.email) throw new Error("No email address");

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      // Save to DB first
      const { data: lead, error: insertErr } = await supabase
        .from("generated_leads")
        .insert({
          dealership_name: selectedDealership.name,
          location: selectedDealership.location,
          phone: selectedDealership.phone,
          email: selectedDealership.email,
          website: selectedDealership.website,
          pitch_email_subject: editedSubject,
          pitch_email_body: editedBody,
          search_query: searchQuery,
          created_by_user_id: session.user.id,
          status: "sending",
        })
        .select("id")
        .single();

      if (insertErr) throw insertErr;

      // Send email
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-pitch-email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            leadId: lead.id,
            to: selectedDealership.email,
            subject: editedSubject,
            body: editedBody,
          }),
        }
      );

      if (!response.ok) {
        const err = await response.json();
        // Update status to failed
        await supabase
          .from("generated_leads")
          .update({ status: "failed" })
          .eq("id", lead.id);
        throw new Error(err.error || "Send failed");
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success("Email sent successfully!");
      setSelectedDealership(null);
      setEmailDraft(null);
      queryClient.invalidateQueries({ queryKey: ["generated-leads"] });
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  // Save as draft mutation
  const saveDraftMutation = useMutation({
    mutationFn: async () => {
      if (!selectedDealership) throw new Error("No dealership selected");

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const { error } = await supabase.from("generated_leads").insert({
        dealership_name: selectedDealership.name,
        location: selectedDealership.location,
        phone: selectedDealership.phone,
        email: selectedDealership.email,
        website: selectedDealership.website,
        pitch_email_subject: editedSubject,
        pitch_email_body: editedBody,
        search_query: searchQuery,
        created_by_user_id: session.user.id,
        status: "draft",
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Saved as draft");
      setSelectedDealership(null);
      setEmailDraft(null);
      queryClient.invalidateQueries({ queryKey: ["generated-leads"] });
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const handleSelectDealership = (d: Dealership) => {
    setSelectedDealership(d);
    setEmailDraft(null);
    setEditedSubject("");
    setEditedBody("");
    generateEmailMutation.mutate(d);
  };

  const sentCount = savedLeads.filter((l: any) => l.status === "sent").length;
  const draftCount = savedLeads.filter((l: any) => l.status === "draft").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Crosshair className="h-6 w-6 text-primary" />
          Lead Generator
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Find independent dealerships, generate pitch emails, and send them
        </p>
        <div className="flex gap-3 mt-2">
          <Badge variant="outline">{sentCount} sent</Badge>
          <Badge variant="outline">{draftCount} drafts</Badge>
        </div>
      </div>

      {/* Search section */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Search className="h-4 w-4" /> Search for Dealerships
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <Select
              value={searchType}
              onValueChange={(v) => setSearchType(v as "city" | "postcode")}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="city">City / Town</SelectItem>
                <SelectItem value="postcode">Postcode + Radius</SelectItem>
              </SelectContent>
            </Select>

            <div className="relative flex-1">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={
                  searchType === "city"
                    ? "e.g. Birmingham, Manchester, Leeds..."
                    : "e.g. B1 1BB"
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && searchQuery.trim()) {
                    searchMutation.mutate();
                  }
                }}
              />
            </div>

            {searchType === "postcode" && (
              <Select value={radius} onValueChange={setRadius}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 miles</SelectItem>
                  <SelectItem value="10">10 miles</SelectItem>
                  <SelectItem value="15">15 miles</SelectItem>
                  <SelectItem value="25">25 miles</SelectItem>
                  <SelectItem value="50">50 miles</SelectItem>
                </SelectContent>
              </Select>
            )}

            <Button
              onClick={() => searchMutation.mutate()}
              disabled={!searchQuery.trim() || searchMutation.isPending}
            >
              {searchMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {results.length > 0 && (
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Found {results.length} Dealerships
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Dealership</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Website</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((d, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{d.name}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {d.location || "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {d.phone || "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {d.email || (
                        <span className="text-destructive/60">Not found</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {d.website ? (
                        <a
                          href={d.website.startsWith("http") ? d.website : `https://${d.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center gap-1"
                        >
                          <Globe className="h-3 w-3" /> Visit
                        </a>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSelectDealership(d)}
                      >
                        <Sparkles className="h-4 w-4 mr-1" />
                        Generate Email
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Recent leads */}
      {savedLeads.length > 0 && (
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Recent Generated Leads</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Dealership</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {savedLeads.slice(0, 20).map((lead: any) => (
                  <TableRow key={lead.id}>
                    <TableCell className="font-medium">
                      {lead.dealership_name}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {lead.email || "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm max-w-[200px] truncate">
                      {lead.pitch_email_subject || "—"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          lead.status === "sent"
                            ? "bg-green-500/10 text-green-400 border-green-500/30"
                            : lead.status === "failed"
                            ? "bg-destructive/10 text-destructive border-destructive/30"
                            : "bg-yellow-500/10 text-yellow-400 border-yellow-500/30"
                        }
                      >
                        {lead.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Email draft dialog */}
      <Dialog
        open={!!selectedDealership}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedDealership(null);
            setEmailDraft(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-[650px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              Pitch Email — {selectedDealership?.name}
            </DialogTitle>
            <DialogDescription>
              Review, edit, and send the generated pitch email.
            </DialogDescription>
          </DialogHeader>

          {generateEmailMutation.isPending ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                Generating personalised email...
              </p>
            </div>
          ) : emailDraft ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                    <Building2 className="h-3 w-3" /> Dealership
                  </span>
                  <p className="font-medium">{selectedDealership?.name}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                    <Mail className="h-3 w-3" /> To
                  </span>
                  <p className="font-medium">
                    {selectedDealership?.email || (
                      <span className="text-destructive">No email found</span>
                    )}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Subject
                </label>
                <Input
                  value={editedSubject}
                  onChange={(e) => setEditedSubject(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Body
                </label>
                <Textarea
                  value={editedBody}
                  onChange={(e) => setEditedBody(e.target.value)}
                  rows={12}
                  className="font-mono text-sm"
                />
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => generateEmailMutation.mutate(selectedDealership!)}
                className="text-xs"
              >
                <RefreshCw className="h-3 w-3 mr-1" /> Regenerate
              </Button>
            </div>
          ) : null}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setSelectedDealership(null);
                setEmailDraft(null);
              }}
            >
              Cancel
            </Button>
            {emailDraft && (
              <>
                <Button
                  variant="secondary"
                  disabled={saveDraftMutation.isPending}
                  onClick={() => saveDraftMutation.mutate()}
                >
                  Save Draft
                </Button>
                <Button
                  disabled={
                    !selectedDealership?.email ||
                    sendEmailMutation.isPending ||
                    !editedSubject ||
                    !editedBody
                  }
                  onClick={() => sendEmailMutation.mutate()}
                >
                  {sendEmailMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Approve & Send
                    </>
                  )}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
