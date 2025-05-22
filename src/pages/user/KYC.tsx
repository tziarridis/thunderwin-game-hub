import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { KycStatus, KycDocumentTypeEnum, KycDocument, KycAttempt } from '@/types/kyc'; // Use correct types
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { UploadCloud, FileText, CheckCircle2, AlertTriangle, Loader2, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';


// Placeholder KycForm component - needs implementation for file uploads etc.
interface KycFormProps {
  onSubmit: (formData: { documentType: KycDocumentTypeEnum; file: File }[]) => Promise<void>;
  isLoading: boolean;
  currentKycStatus?: KycStatus;
  rejectionReason?: string;
  resubmitInstructions?: string;
}

const KycForm: React.FC<KycFormProps> = ({ onSubmit, isLoading, currentKycStatus, rejectionReason, resubmitInstructions }) => {
  const [documents, setDocuments] = useState<{ type: KycDocumentTypeEnum; file: File | null }[]>([
    { type: KycDocumentTypeEnum.ID_CARD_FRONT, file: null },
  ]);

  const handleFileChange = (index: number, file: File | null) => {
    const newDocuments = [...documents];
    newDocuments[index].file = file;
    setDocuments(newDocuments);
  };

  const handleAddDocumentSlot = () => {
    // Default to ID_CARD_BACK if adding a second slot, or allow user to pick
    const defaultNewType = documents.length === 1 && documents[0].type === KycDocumentTypeEnum.ID_CARD_FRONT 
                           ? KycDocumentTypeEnum.ID_CARD_BACK 
                           : KycDocumentTypeEnum.PROOF_OF_ADDRESS;
    setDocuments([...documents, { type: defaultNewType, file: null }]);
  };

  const handleDocumentTypeChange = (index: number, type: KycDocumentTypeEnum) => {
    const newDocuments = [...documents];
    newDocuments[index].type = type;
    setDocuments(newDocuments);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const filesToSubmit = documents.filter(doc => doc.file).map(doc => ({ documentType: doc.type, file: doc.file! }));
    if (filesToSubmit.length === 0) {
      toast.error("Please select at least one file to upload.");
      return;
    }
    onSubmit(filesToSubmit);
  };
  
  // Get available document types, excluding those already selected (if unique types are enforced per submission)
  // For simplicity, allowing multiple of same type for now, or user can change type.
  const availableDocumentTypes = Object.values(KycDocumentTypeEnum);


  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {currentKycStatus === 'rejected' && rejectionReason && (
          <div className="p-3 bg-destructive/10 border border-destructive text-destructive rounded-md text-sm">
              <strong>Rejection Reason:</strong> {rejectionReason}
          </div>
      )}
       {currentKycStatus === 'resubmit_required' && resubmitInstructions && (
          <div className="p-3 bg-yellow-500/10 border border-yellow-500 text-yellow-700 rounded-md text-sm">
              <strong>Resubmission Required:</strong> {resubmitInstructions}
          </div>
      )}

      {documents.map((doc, index) => (
        <div key={index} className="space-y-2 p-4 border rounded-md">
          <Label htmlFor={`document-type-${index}`}>Document Type</Label>
          <Select 
            value={doc.type} 
            onValueChange={(value) => handleDocumentTypeChange(index, value as KycDocumentTypeEnum)}
          >
            <SelectTrigger id={`document-type-${index}`}>
              <SelectValue placeholder="Select document type" />
            </SelectTrigger>
            <SelectContent>
              {availableDocumentTypes.map(type => (
                <SelectItem key={type} value={type}>
                  {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Label htmlFor={`file-upload-${index}`}>Upload File</Label>
          <Input
            id={`file-upload-${index}`}
            type="file"
            onChange={(e) => handleFileChange(index, e.target.files ? e.target.files[0] : null)}
            className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
          />
          {doc.file && <p className="text-xs text-muted-foreground">Selected: {doc.file.name}</p>}
        </div>
      ))}
      
      <Button type="button" variant="outline" onClick={handleAddDocumentSlot} className="text-sm">Add Another Document</Button>

      <Button type="submit" disabled={isLoading || documents.every(d => !d.file)} className="w-full">
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
        Submit Documents
      </Button>
    </form>
  );
};


const KYCPage: React.FC = () => {
// ... keep existing code (state, fetchKycStatus)
  const { user, isAuthenticated } = useAuth();
  const [kycStatus, setKycStatus] = useState<KycStatus | null>(null);
  const [lastAttempt, setLastAttempt] = useState<KycAttempt | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchKycStatus = useCallback(async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      // Fetch the latest KYC attempt for the user
      const { data, error } = await supabase
        .from('kyc_attempts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single(); // Assuming one main attempt, or adjust logic

      if (error && error.code !== 'PGRST116') { // PGRST116: no rows found
        throw error;
      }
      if (data) {
        setLastAttempt(data as KycAttempt);
        setKycStatus(data.status as KycStatus);
      } else {
        setKycStatus('not_started');
      }
    } catch (error: any) {
      toast.error("Failed to fetch KYC status: " + error.message);
      setKycStatus(null); // Error state
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchKycStatus();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, fetchKycStatus]);

  const handleSubmitKyc = async (formData: { documentType: KycDocumentTypeEnum; file: File }[]) => {
// ... keep existing code (handleSubmitKyc logic)
    if (!user?.id) {
      toast.error("User not authenticated.");
      return;
    }
    setIsSubmitting(true);
    try {
      // 1. Upload files to Supabase Storage (example path: kyc_documents/{user_id}/{file_name})
      const uploadedDocuments: Pick<KycDocument, 'document_type' | 'file_url' | 'status'>[] = [];
      for (const item of formData) {
        const fileName = `${Date.now()}_${item.file.name.replace(/\s+/g, '_')}`;
        const filePath = `kyc_documents/${user.id}/${fileName}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('kyc-bucket') // Ensure this bucket exists and has RLS policies
          .upload(filePath, item.file);

        if (uploadError) throw new Error(`Failed to upload ${item.file.name}: ${uploadError.message}`);
        
        // Get public URL. Ensure RLS allows authenticated users to read their own files.
        const { data: publicUrlData } = supabase.storage.from('kyc-bucket').getPublicUrl(filePath);
        
        uploadedDocuments.push({
          document_type: item.documentType,
          file_url: publicUrlData.publicUrl,
          status: 'pending', // Initial status for uploaded doc
        });
      }

      // 2. Create a new KYC attempt or update an existing one
      const attemptPayload = {
        user_id: user.id,
        status: 'pending_review' as KycStatus, // New submission goes to pending
        // documents: uploadedDocuments, // If 'documents' is a JSONB column on kyc_attempts
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data: attemptData, error: attemptError } = await supabase
        .from('kyc_attempts')
        .insert(attemptPayload)
        .select()
        .single();
      
      if (attemptError) throw attemptError;

      // 3. If documents are stored in a separate table, insert them linking to the attemptData.id
      // Example: (if kyc_documents table exists with attempt_id FK)
      if (attemptData) {
        const kycDocsToInsert = uploadedDocuments.map(doc => ({
            // id: auto-generated
            user_id: user.id,
            attempt_id: attemptData.id, // Link to the created attempt
            document_type: doc.document_type,
            file_url: doc.file_url,
            status: doc.status,
            // uploaded_at: auto-generated
        }));
        // const { error: docsInsertError } = await supabase.from('kyc_documents').insert(kycDocsToInsert);
        // if (docsInsertError) throw docsInsertError;
        console.log("Docs to insert (if separate table):", kycDocsToInsert); // Placeholder
      }


      toast.success("KYC documents submitted successfully. We will review them shortly.");
      fetchKycStatus(); // Refresh status
    } catch (error: any) {
      toast.error("KYC submission failed: " + error.message);
      console.error("KYC Submission Error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };


  if (!isAuthenticated) {
    return <div className="container mx-auto py-10 px-4 text-center"><p>Please <Link to="/login" className="text-primary hover:underline">log in</Link> to proceed with KYC verification.</p></div>;
  }
  if (isLoading) {
    return <div className="container mx-auto py-10 px-4 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto" /> <p>Loading KYC status...</p></div>;
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">KYC Verification</CardTitle>
          <CardDescription>Verify your identity to access all platform features and ensure security.</CardDescription>
        </CardHeader>
        <CardContent>
          {kycStatus === 'approved' || kycStatus === 'verified' ? (
            <div className="text-center py-6">
              <CheckCircle2 className="h-16 w-16 text-success mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-success">Your Identity is Verified!</h3>
              <p className="text-muted-foreground mt-2">You have full access to all features.</p>
            </div>
          ) : kycStatus === 'pending_review' ? (
            <div className="text-center py-6">
              <Info className="h-16 w-16 text-blue-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-blue-500">Submission Under Review</h3>
              <p className="text-muted-foreground mt-2">Your documents are being reviewed. This usually takes 1-2 business days. We'll notify you once completed.</p>
            </div>
          ) : (
            <>
              {kycStatus === 'not_started' && (
                 <p className="mb-4 text-sm text-muted-foreground">Please upload the required documents to verify your identity. This helps us keep the platform secure for everyone.</p>
              )}
              {(kycStatus === 'rejected' || kycStatus === 'resubmit_required' || kycStatus === 'failed') && (
                 <div className="mb-6 p-4 bg-destructive/10 border border-destructive text-destructive rounded-md">
                    <div className="flex items-start">
                        <AlertTriangle className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" />
                        <div>
                            <h4 className="font-semibold">Verification {kycStatus === 'failed' ? 'Failed' : 'Update Required'}</h4>
                            <p className="text-sm">
                                {kycStatus === 'rejected' && (lastAttempt as any)?.rejection_reason && `Reason: ${(lastAttempt as any).rejection_reason}. Please correct and resubmit.`}
                                {kycStatus === 'resubmit_required' && (lastAttempt as any)?.resubmit_instructions && `Instructions: ${(lastAttempt as any).resubmit_instructions}.`}
                                {kycStatus === 'failed' && "There was an issue with your submission. Please try again or contact support."}
                                {!((lastAttempt as any)?.rejection_reason || (lastAttempt as any)?.resubmit_instructions) && kycStatus !== 'failed' && "Please review the requirements and submit your documents again."}
                            </p>
                        </div>
                    </div>
                </div>
              )}
              <KycForm 
                onSubmit={handleSubmitKyc} 
                isLoading={isSubmitting} 
                currentKycStatus={kycStatus || undefined}
                rejectionReason={(lastAttempt as any)?.rejection_reason}
                resubmitInstructions={(lastAttempt as any)?.resubmit_instructions} // Assuming these fields might exist on KycAttempt
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default KYCPage;
