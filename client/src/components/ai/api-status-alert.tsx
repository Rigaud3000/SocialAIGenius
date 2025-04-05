import { useState } from "react";
import { AlertCircle, AlertTriangle, CheckCircle2, RefreshCcw } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export interface ApiStatusAlertProps {
  error?: string;
  onRetry?: () => void;
  provider?: "openai" | "gemini";
}

export default function ApiStatusAlert({ error, onRetry, provider = "openai" }: ApiStatusAlertProps) {
  const { toast } = useToast();
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [apiStatus, setApiStatus] = useState<"success" | "error" | "checking" | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [useGemini, setUseGemini] = useState(provider === "gemini");
  const [currentProvider, setCurrentProvider] = useState<"openai" | "gemini">(provider);
  
  // Show proper provider name in UI
  const providerName = useGemini ? "Google Gemini" : "OpenAI";

  // Mutation for checking API status
  const checkApiStatusMutation = useMutation({
    mutationFn: async () => {
      setApiStatus("checking");
      setIsCheckingStatus(true);
      setCurrentProvider(useGemini ? "gemini" : "openai");
      
      try {
        // Add query param to specify which provider to check
        const url = `/api/ai-api-status${useGemini ? '?provider=gemini' : ''}`;
        const response = await apiRequest("GET", url);
        const data = await response.json();
        return data;
      } catch (error) {
        throw error;
      } finally {
        setIsCheckingStatus(false);
      }
    },
    onSuccess: (data) => {
      if (data.status === "success") {
        setApiStatus("success");
        setStatusMessage(data.message || `API is working correctly`);
        toast({
          title: "API Check",
          description: `${providerName} API is working correctly`,
        });
      } else {
        setApiStatus("error");
        setStatusMessage(data.message || `There was a problem with the ${providerName} API`);
      }
    },
    onError: () => {
      setApiStatus("error");
      setStatusMessage(`Could not check ${providerName} API status. Please try again later.`);
      toast({
        title: "API Check Failed",
        description: `Could not verify ${providerName} API status`,
        variant: "destructive",
      });
    },
  });

  // Handle status check
  const handleCheckStatus = () => {
    checkApiStatusMutation.mutate();
  };

  // Handle retry
  const handleRetry = () => {
    setApiStatus(null);
    setStatusMessage(null);
    if (onRetry) onRetry();
  };
  
  // Toggle between OpenAI and Gemini API
  const handleToggleProvider = () => {
    setUseGemini(!useGemini);
    setApiStatus(null);
    setStatusMessage(null);
  };

  // If we have an error or have checked status and it's an error
  const showError = error || (apiStatus === "error" && statusMessage);

  if (!showError && apiStatus !== "checking") return null;

  return (
    <Card className="mb-6 border-orange-200 dark:border-orange-900 bg-orange-50 dark:bg-orange-900/20">
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 mt-0.5">
            {apiStatus === "checking" ? (
              <RefreshCcw className="h-5 w-5 text-orange-500 animate-spin" />
            ) : apiStatus === "success" ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-orange-500" />
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-medium text-orange-800 dark:text-orange-300">
                {apiStatus === "checking" 
                  ? "Checking API Status..." 
                  : apiStatus === "success"
                  ? "API Status Check Successful"
                  : "AI Service Issues Detected"}
              </h3>
              
              <div className="flex items-center space-x-2">
                <Label htmlFor="api-provider" className="text-xs">
                  Use Gemini
                </Label>
                <Switch
                  id="api-provider"
                  checked={useGemini}
                  onCheckedChange={handleToggleProvider}
                />
              </div>
            </div>
            
            <p className="mt-1 text-sm text-orange-700 dark:text-orange-400">
              {apiStatus === "checking" 
                ? `Verifying ${providerName} API connection...` 
                : statusMessage || error || `There may be issues with the ${providerName} API connection.`}
            </p>
            
            {(apiStatus === "error" || (error && !apiStatus)) && (
              <div className="mt-3 bg-orange-100 dark:bg-orange-900/30 p-3 rounded-md border border-orange-200 dark:border-orange-800">
                <h4 className="text-sm font-medium flex items-center mb-1">
                  <AlertCircle className="h-4 w-4 mr-1 text-orange-600" />
                  Troubleshooting Steps
                </h4>
                <ul className="list-disc list-inside text-xs text-orange-700 dark:text-orange-400 space-y-1">
                  <li>Verify your {providerName} API key is valid and has available quota</li>
                  <li>Check your {providerName} account billing settings</li>
                  <li>If on a free tier, consider upgrading your account</li>
                  <li>Wait some time and try again if you've hit rate limits</li>
                </ul>
              </div>
            )}
            
            <div className="mt-3 flex space-x-3">
              {apiStatus !== "checking" && (
                <Button 
                  variant="outline" 
                  size="sm"
                  className="bg-white dark:bg-gray-800"
                  onClick={handleCheckStatus}
                  disabled={isCheckingStatus}
                >
                  <RefreshCcw className={`h-3.5 w-3.5 mr-1.5 ${isCheckingStatus ? 'animate-spin' : ''}`} />
                  {isCheckingStatus ? "Checking..." : "Check API Status"}
                </Button>
              )}
              
              {(error || apiStatus === "error") && (
                <Button 
                  variant="outline" 
                  size="sm"
                  className="bg-white dark:bg-gray-800"
                  onClick={handleRetry}
                >
                  Try Again
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}