
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Camera, Upload, CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

enum KycStatus {
  NOT_SUBMITTED = "not_submitted",
  PENDING = "pending",
  VERIFIED = "verified",
  REJECTED = "rejected"
}

const KycForm = () => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: user?.name || "",
    dateOfBirth: "",
    nationality: "",
    address: "",
    city: "",
    zipCode: "",
    country: "",
    phoneNumber: "",
    documentType: "passport",
    documentFront: null as File | null,
    documentBack: null as File | null,
    selfie: null as File | null,
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  if (!isAuthenticated) {
    return (
      <Card className="w-full max-w-lg mx-auto bg-casino-thunder-dark border-white/10">
        <CardHeader>
          <CardTitle>Identity Verification Required</CardTitle>
          <CardDescription>Please login to access KYC verification</CardDescription>
        </CardHeader>
        <CardFooter>
          <Button onClick={() => navigate("/login")} className="w-full">
            Login to Continue
          </Button>
        </CardFooter>
      </Card>
    );
  }
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, [field]: e.target.files[0] });
    }
  };
  
  const handleNext = () => {
    if (step === 1) {
      // Validate personal information
      if (!formData.fullName || !formData.dateOfBirth || !formData.nationality || 
          !formData.address || !formData.city || !formData.zipCode || !formData.country || !formData.phoneNumber) {
        toast({
          title: "Missing Information",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }
    }
    
    setStep(step + 1);
  };
  
  const handlePrevious = () => {
    setStep(step - 1);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Validate document uploads
    if (!formData.documentFront || !formData.documentBack || !formData.selfie) {
      toast({
        title: "Missing Documents",
        description: "Please upload all required documents",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }
    
    // Simulate API call
    setTimeout(() => {
      // Update the user's KYC status in localStorage
      if (user) {
        const usersDb = JSON.parse(localStorage.getItem("users") || "[]");
        const userIndex = usersDb.findIndex((u: any) => u.id === user.id);
        
        if (userIndex !== -1) {
          usersDb[userIndex] = {
            ...usersDb[userIndex],
            kycStatus: KycStatus.PENDING,
            kycSubmittedAt: new Date().toISOString(),
            kycData: {
              ...formData,
              documentFront: formData.documentFront?.name,
              documentBack: formData.documentBack?.name,
              selfie: formData.selfie?.name,
            }
          };
          
          localStorage.setItem("users", JSON.stringify(usersDb));
          
          // Store the KYC requests in a separate collection
          const kycRequests = JSON.parse(localStorage.getItem("kycRequests") || "[]");
          kycRequests.push({
            id: `kyc-${Date.now()}`,
            userId: user.id,
            userName: user.name,
            email: user.email,
            status: KycStatus.PENDING,
            submittedAt: new Date().toISOString(),
            data: {
              ...formData,
              documentFront: formData.documentFront?.name,
              documentBack: formData.documentBack?.name,
              selfie: formData.selfie?.name,
            }
          });
          
          localStorage.setItem("kycRequests", JSON.stringify(kycRequests));
        }
      }
      
      setIsSubmitting(false);
      toast({
        title: "KYC Submitted Successfully",
        description: "Your documents are under review. We'll notify you once verified.",
      });
      
      // Redirect to KYC status page
      navigate("/kyc/status");
    }, 1500);
  };
  
  return (
    <Card className="w-full max-w-4xl mx-auto bg-casino-thunder-dark border-white/10">
      <CardHeader>
        <CardTitle className="text-2xl">Identity Verification (KYC)</CardTitle>
        <CardDescription>
          To enhance security and comply with regulations, we need to verify your identity
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            <div className={`flex-1 pb-2 border-b-2 ${step >= 1 ? "border-casino-thunder-green" : "border-white/20"}`}>
              <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full mr-2 ${step >= 1 ? "bg-casino-thunder-green text-black" : "bg-white/10"}`}>1</span>
              Personal Information
            </div>
            <div className={`flex-1 pb-2 border-b-2 ${step >= 2 ? "border-casino-thunder-green" : "border-white/20"}`}>
              <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full mr-2 ${step >= 2 ? "bg-casino-thunder-green text-black" : "bg-white/10"}`}>2</span>
              Document Verification
            </div>
            <div className={`flex-1 pb-2 border-b-2 ${step >= 3 ? "border-casino-thunder-green" : "border-white/20"}`}>
              <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full mr-2 ${step >= 3 ? "bg-casino-thunder-green text-black" : "bg-white/10"}`}>3</span>
              Review & Submit
            </div>
          </div>
        </div>
        
        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name (as per ID)</Label>
                  <Input 
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="thunder-input"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input 
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    className="thunder-input"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="nationality">Nationality</Label>
                <Select
                  value={formData.nationality}
                  onValueChange={(value) => handleSelectChange("nationality", value)}
                >
                  <SelectTrigger className="thunder-input">
                    <SelectValue placeholder="Select nationality" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="us">United States</SelectItem>
                    <SelectItem value="ca">Canada</SelectItem>
                    <SelectItem value="uk">United Kingdom</SelectItem>
                    <SelectItem value="au">Australia</SelectItem>
                    <SelectItem value="de">Germany</SelectItem>
                    <SelectItem value="fr">France</SelectItem>
                    <SelectItem value="jp">Japan</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input 
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="thunder-input"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input 
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="thunder-input"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zipCode">Zip/Postal Code</Label>
                  <Input 
                    id="zipCode"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    className="thunder-input"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Select
                    value={formData.country}
                    onValueChange={(value) => handleSelectChange("country", value)}
                  >
                    <SelectTrigger className="thunder-input">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="us">United States</SelectItem>
                      <SelectItem value="ca">Canada</SelectItem>
                      <SelectItem value="uk">United Kingdom</SelectItem>
                      <SelectItem value="au">Australia</SelectItem>
                      <SelectItem value="de">Germany</SelectItem>
                      <SelectItem value="fr">France</SelectItem>
                      <SelectItem value="jp">Japan</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input 
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  className="thunder-input"
                  required
                />
              </div>
            </div>
          )}
          
          {step === 2 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="documentType">ID Document Type</Label>
                <Select
                  value={formData.documentType}
                  onValueChange={(value) => handleSelectChange("documentType", value)}
                >
                  <SelectTrigger className="thunder-input">
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="passport">Passport</SelectItem>
                    <SelectItem value="driverLicense">Driver's License</SelectItem>
                    <SelectItem value="idCard">National ID Card</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="documentFront">Document Front Side</Label>
                  <div className="flex flex-col items-center justify-center border-2 border-dashed border-white/20 rounded-lg p-6 h-40 bg-casino-thunder-gray/30 hover:bg-casino-thunder-gray/50 transition-colors cursor-pointer relative">
                    <input
                      type="file"
                      id="documentFront"
                      onChange={(e) => handleFileChange(e, "documentFront")}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      accept="image/*"
                    />
                    {formData.documentFront ? (
                      <div className="text-center text-green-400">
                        <CheckCircle className="h-10 w-10 mx-auto mb-2" />
                        <p className="text-sm text-green-400">{formData.documentFront.name}</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Upload className="h-10 w-10 mx-auto text-white/60 mb-2" />
                        <p className="text-sm text-white/60">Click or drag to upload</p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="documentBack">Document Back Side</Label>
                  <div className="flex flex-col items-center justify-center border-2 border-dashed border-white/20 rounded-lg p-6 h-40 bg-casino-thunder-gray/30 hover:bg-casino-thunder-gray/50 transition-colors cursor-pointer relative">
                    <input
                      type="file"
                      id="documentBack"
                      onChange={(e) => handleFileChange(e, "documentBack")}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      accept="image/*"
                    />
                    {formData.documentBack ? (
                      <div className="text-center text-green-400">
                        <CheckCircle className="h-10 w-10 mx-auto mb-2" />
                        <p className="text-sm text-green-400">{formData.documentBack.name}</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Upload className="h-10 w-10 mx-auto text-white/60 mb-2" />
                        <p className="text-sm text-white/60">Click or drag to upload</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="selfie">Selfie with Document</Label>
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-white/20 rounded-lg p-6 h-40 bg-casino-thunder-gray/30 hover:bg-casino-thunder-gray/50 transition-colors cursor-pointer relative">
                  <input
                    type="file"
                    id="selfie"
                    onChange={(e) => handleFileChange(e, "selfie")}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    accept="image/*"
                  />
                  {formData.selfie ? (
                    <div className="text-center text-green-400">
                      <CheckCircle className="h-10 w-10 mx-auto mb-2" />
                      <p className="text-sm text-green-400">{formData.selfie.name}</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Camera className="h-10 w-10 mx-auto text-white/60 mb-2" />
                      <p className="text-sm text-white/60">Upload a selfie holding your ID</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {step === 3 && (
            <div className="space-y-6">
              <div className="bg-casino-thunder-gray/30 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Review Your Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-white/60 text-sm">Full Name</p>
                    <p>{formData.fullName}</p>
                  </div>
                  <div>
                    <p className="text-white/60 text-sm">Date of Birth</p>
                    <p>{formData.dateOfBirth}</p>
                  </div>
                  <div>
                    <p className="text-white/60 text-sm">Nationality</p>
                    <p>{formData.nationality}</p>
                  </div>
                  <div>
                    <p className="text-white/60 text-sm">Phone Number</p>
                    <p>{formData.phoneNumber}</p>
                  </div>
                  <div>
                    <p className="text-white/60 text-sm">Address</p>
                    <p>{formData.address}</p>
                  </div>
                  <div>
                    <p className="text-white/60 text-sm">City, Zip, Country</p>
                    <p>{formData.city}, {formData.zipCode}, {formData.country}</p>
                  </div>
                </div>
                
                <div className="mt-4">
                  <p className="text-white/60 text-sm">Document Type</p>
                  <p>{formData.documentType.charAt(0).toUpperCase() + formData.documentType.slice(1)}</p>
                </div>
                
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-white/60 text-sm">Document Front</p>
                    <p className="text-green-400">
                      {formData.documentFront ? "✓ Uploaded" : "✗ Missing"}
                    </p>
                  </div>
                  <div>
                    <p className="text-white/60 text-sm">Document Back</p>
                    <p className="text-green-400">
                      {formData.documentBack ? "✓ Uploaded" : "✗ Missing"}
                    </p>
                  </div>
                  <div>
                    <p className="text-white/60 text-sm">Selfie with ID</p>
                    <p className="text-green-400">
                      {formData.selfie ? "✓ Uploaded" : "✗ Missing"}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-casino-thunder-gray/30 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Terms & Conditions</h3>
                <p className="text-white/70 text-sm mb-4">
                  By submitting this form, you certify that all information provided is accurate and authentic. 
                  You consent to the processing of this information for verification purposes in accordance 
                  with our Privacy Policy.
                </p>
                <div className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    id="consent"
                    className="mr-2"
                    required
                  />
                  <Label htmlFor="consent" className="text-sm">
                    I agree to the Terms and Conditions and confirm that all provided information is accurate
                  </Label>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex justify-between mt-6">
            {step > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevious}
                disabled={isSubmitting}
              >
                Previous
              </Button>
            )}
            
            {step < 3 ? (
              <Button
                type="button"
                className="ml-auto bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black"
                onClick={handleNext}
              >
                Next
              </Button>
            ) : (
              <Button
                type="submit"
                className="ml-auto bg-casino-thunder-green hover:bg-casino-thunder-highlight text-black"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit Verification"}
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default KycForm;
