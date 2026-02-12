import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserDealerId } from "@/hooks/useCustomers";
import { useAuth } from "@/contexts/AuthContext";
import { logAuditEvent } from "@/hooks/useAuditLogs";
import { toast } from "sonner";

// ─── Templates ───
export function useDocumentTemplates() {
  const { data: dealerId } = useUserDealerId();
  return useQuery({
    queryKey: ["document-templates", dealerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("document_templates")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!dealerId,
  });
}

export function useDuplicateTemplate() {
  const { data: dealerId } = useUserDealerId();
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (templateId: string) => {
      const { data: orig, error: fetchErr } = await supabase
        .from("document_templates")
        .select("*")
        .eq("id", templateId)
        .single();
      if (fetchErr) throw fetchErr;
      const { data, error } = await supabase
        .from("document_templates")
        .insert({
          dealer_id: dealerId!,
          name: `${orig.name} (Copy)`,
          category: orig.category,
          description: orig.description,
          template_html: orig.template_html,
          created_by_user_id: user?.id,
        })
        .select()
        .single();
      if (error) throw error;
      await logAuditEvent({
        dealerId: dealerId || null,
        actorUserId: user?.id || null,
        actionType: "TEMPLATE_DUPLICATED",
        entityType: "DocTemplates",
        entityId: data.id,
        summary: `Duplicated template "${orig.name}"`,
      });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["document-templates"] });
      toast.success("Template duplicated");
    },
    onError: (e: any) => toast.error(e.message),
  });
}

export function useUpdateTemplate() {
  const { data: dealerId } = useUserDealerId();
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; name?: string; template_html?: string; is_active?: boolean; description?: string }) => {
      const { data, error } = await supabase
        .from("document_templates")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      await logAuditEvent({
        dealerId: dealerId || null,
        actorUserId: user?.id || null,
        actionType: "TEMPLATE_EDITED",
        entityType: "DocTemplates",
        entityId: id,
        summary: `Updated template "${data.name}"`,
      });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["document-templates"] });
      toast.success("Template updated");
    },
    onError: (e: any) => toast.error(e.message),
  });
}

// ─── Generated Documents ───
export function useGeneratedDocuments() {
  const { data: dealerId } = useUserDealerId();
  return useQuery({
    queryKey: ["generated-documents", dealerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("generated_documents")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!dealerId,
  });
}

// ─── Uploaded Files ───
export function useUploadedFiles() {
  const { data: dealerId } = useUserDealerId();
  return useQuery({
    queryKey: ["uploaded-files", dealerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("uploaded_files")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!dealerId,
  });
}

export function useUploadFile() {
  const { data: dealerId } = useUserDealerId();
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      if (!dealerId) throw new Error("No dealer");
      const filePath = `${dealerId}/${Date.now()}-${file.name}`;
      const { error: uploadErr } = await supabase.storage
        .from("dealer-uploads")
        .upload(filePath, file);
      if (uploadErr) throw uploadErr;

      const { data: { publicUrl } } = supabase.storage
        .from("dealer-uploads")
        .getPublicUrl(filePath);

      const { data, error } = await supabase
        .from("uploaded_files")
        .insert({
          dealer_id: dealerId,
          name: file.name,
          file_name: file.name,
          file_type: file.type,
          file_size: file.size,
          file_url: filePath,
          uploaded_by_user_id: user?.id!,
        })
        .select()
        .single();
      if (error) throw error;

      await logAuditEvent({
        dealerId,
        actorUserId: user?.id || null,
        actionType: "FILE_UPLOADED",
        entityType: "Documents",
        entityId: data.id,
        summary: `Uploaded file "${file.name}"`,
      });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["uploaded-files"] });
      toast.success("File uploaded");
    },
    onError: (e: any) => toast.error(e.message),
  });
}

export function useDeleteUploadedFile() {
  const { data: dealerId } = useUserDealerId();
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (file: { id: string; file_url: string; name: string }) => {
      await supabase.storage.from("dealer-uploads").remove([file.file_url]);
      const { error } = await supabase.from("uploaded_files").delete().eq("id", file.id);
      if (error) throw error;
      await logAuditEvent({
        dealerId: dealerId || null,
        actorUserId: user?.id || null,
        actionType: "DELETE",
        entityType: "Documents",
        entityId: file.id,
        summary: `Deleted file "${file.name}"`,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["uploaded-files"] });
      toast.success("File deleted");
    },
    onError: (e: any) => toast.error(e.message),
  });
}

// ─── Dealer info ───
export function useDealerInfo() {
  const { data: dealerId } = useUserDealerId();
  return useQuery({
    queryKey: ["dealer-info", dealerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dealers")
        .select("*")
        .eq("id", dealerId!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!dealerId,
  });
}
