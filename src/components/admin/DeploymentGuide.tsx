
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const DeploymentGuide = () => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Deployment Guide</CardTitle>
        <CardDescription>
          Step-by-step guide to deploy ThunderWin Casino to production
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Important</AlertTitle>
          <AlertDescription>
            Before deploying to production, run the Production Readiness Check to validate your configuration
          </AlertDescription>
        </Alert>
        
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="step1">
            <AccordionTrigger>Step 1: Environment Setup</AccordionTrigger>
            <AccordionContent>
              <ol className="list-decimal pl-5 space-y-2">
                <li>Configure all environment variables in your hosting environment:
                  <ul className="list-disc pl-5 mt-1">
                    <li>VITE_SUPABASE_URL</li>
                    <li>VITE_SUPABASE_ANON_KEY</li>
                  </ul>
                </li>
                <li>Ensure you have a secure domain with SSL certificate configured</li>
                <li>Update the <code>productionConfig.ts</code> file with your production API endpoints</li>
              </ol>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="step2">
            <AccordionTrigger>Step 2: Build the Application</AccordionTrigger>
            <AccordionContent>
              <ol className="list-decimal pl-5 space-y-2">
                <li>Run the production build command:
                  <pre className="bg-slate-800 p-2 rounded mt-1">npm run build</pre>
                </li>
                <li>Verify the build completes without errors</li>
                <li>Test the production build locally:
                  <pre className="bg-slate-800 p-2 rounded mt-1">npm run preview</pre>
                </li>
              </ol>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="step3">
            <AccordionTrigger>Step 3: Database Configuration</AccordionTrigger>
            <AccordionContent>
              <ol className="list-decimal pl-5 space-y-2">
                <li>Ensure all Supabase tables have appropriate Row Level Security (RLS) policies configured</li>
                <li>Verify indexing on frequently queried columns</li>
                <li>Set up scheduled database backups</li>
                <li>Configure rate limiting and security settings in Supabase</li>
              </ol>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="step4">
            <AccordionTrigger>Step 4: Game Provider Integration</AccordionTrigger>
            <AccordionContent>
              <ol className="list-decimal pl-5 space-y-2">
                <li>Configure the correct production API endpoints and credentials for each game provider in your admin settings</li>
                <li>Verify the callback URLs are correctly configured in the provider's dashboard</li>
                <li>Test each provider integration with a test account</li>
                <li>Enable IP whitelisting for callback endpoints if required by providers</li>
              </ol>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="step5">
            <AccordionTrigger>Step 5: Server Deployment</AccordionTrigger>
            <AccordionContent>
              <ol className="list-decimal pl-5 space-y-2">
                <li>Upload the built files to your web server or cloud hosting provider</li>
                <li>Configure your web server (nginx, Apache, etc.) to serve the application</li>
                <li>Set up proper caching headers for static assets</li>
                <li>Configure server-side redirects to handle SPA routing</li>
              </ol>
              
              <div className="mt-4 p-3 bg-slate-800 rounded">
                <strong>Example nginx configuration:</strong>
                <pre className="text-xs mt-2 overflow-x-auto">
{`server {
    listen 80;
    server_name your-casino-domain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name your-casino-domain.com;

    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;

    root /var/www/casino/dist;
    index index.html;

    # Caching for static assets
    location ~* \\.(?:css|js|jpg|jpeg|gif|png|ico|svg|woff2)$ {
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-XSS-Protection "1; mode=block";
    add_header X-Content-Type-Options "nosniff";
}`}
                </pre>
              </div>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="step6">
            <AccordionTrigger>Step 6: Monitoring and Analytics</AccordionTrigger>
            <AccordionContent>
              <ol className="list-decimal pl-5 space-y-2">
                <li>Set up error tracking and reporting (e.g., Sentry)</li>
                <li>Configure application performance monitoring</li>
                <li>Set up real-time alerts for critical system events</li>
                <li>Implement a logging strategy for user actions and system events</li>
                <li>Configure Google Analytics or other analytics tools</li>
              </ol>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="step7">
            <AccordionTrigger>Step 7: Testing and Verification</AccordionTrigger>
            <AccordionContent>
              <ol className="list-decimal pl-5 space-y-2">
                <li>Perform end-to-end testing of the entire gambling flow</li>
                <li>Test user registration and authentication</li>
                <li>Test payment processing and wallet operations</li>
                <li>Verify all game integrations are working correctly</li>
                <li>Test the application on different browsers and devices</li>
                <li>Perform load testing to ensure the system can handle expected traffic</li>
              </ol>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="step8">
            <AccordionTrigger>Step 8: Launch Preparation</AccordionTrigger>
            <AccordionContent>
              <ol className="list-decimal pl-5 space-y-2">
                <li>Create a rollback plan in case of critical issues</li>
                <li>Schedule the deployment during low-traffic hours</li>
                <li>Notify stakeholders about the deployment schedule</li>
                <li>Prepare social media and marketing announcements</li>
                <li>Have customer support ready to handle any user issues</li>
              </ol>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default DeploymentGuide;
