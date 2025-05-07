
import { useState } from "react";
import ProductionReadinessCheck from "@/components/admin/ProductionReadinessCheck";
import DeploymentGuide from "@/components/admin/DeploymentGuide";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const DeploymentChecklist = () => {
  const [activeTab, setActiveTab] = useState("check");
  
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Deployment & Production Readiness</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="check">Readiness Check</TabsTrigger>
          <TabsTrigger value="guide">Deployment Guide</TabsTrigger>
        </TabsList>
        
        <TabsContent value="check" className="space-y-6">
          <p className="text-white/70 mb-4">
            Run these checks to verify that the casino application is ready for production deployment.
            Address any issues before proceeding with deployment.
          </p>
          
          <ProductionReadinessCheck />
        </TabsContent>
        
        <TabsContent value="guide" className="space-y-6">
          <p className="text-white/70 mb-4">
            Follow this guide for successfully deploying the casino application to a production environment.
            Make sure to complete all steps to ensure a smooth deployment.
          </p>
          
          <DeploymentGuide />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DeploymentChecklist;
