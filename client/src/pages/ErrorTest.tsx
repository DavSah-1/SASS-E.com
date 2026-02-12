import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { AlertTriangle, Bug, Database, Network, Shield } from "lucide-react";

/**
 * Error Testing Page
 * This page is used to test error handling and toast notifications
 * by triggering various API errors intentionally.
 */
export default function ErrorTest() {
  const addDeviceMutation = trpc.iot.addDevice.useMutation();
  const transcribeMutation = trpc.assistant.transcribe.useMutation();
  const enable2FAMutation = trpc.auth.enable2FA.useMutation();
  const translateMutation = trpc.translationApp.translate.useMutation();
  const getDeviceStatusQuery = trpc.iot.getDeviceStatus.useQuery(
    { deviceId: "non-existent-device-12345" },
    { enabled: false } // Don't run automatically
  );

  // Test different error scenarios
  const testDatabaseError = () => {
    // Try to get a non-existent device to trigger database error
    getDeviceStatusQuery.refetch();
  };

  const testValidationError = () => {
    // Try to add device with invalid data
    addDeviceMutation.mutate({
      name: "", // Empty name should trigger validation error
      type: "light",
      protocol: "mqtt",
      connectionDetails: {},
    } as any);
  };

  const testAPIError = () => {
    // Try to transcribe without audio data
    transcribeMutation.mutate({
      audioUrl: "", // Empty audio URL should trigger API error
    } as any);
  };

  const testAuthError = () => {
    // Try to enable 2FA with invalid token
    enable2FAMutation.mutate({
      secret: "invalid-secret",
      token: "000000",
    });
  };

  const testTranslationError = () => {
    // Try to translate with invalid language code
    translateMutation.mutate({
      text: "Hello",
      sourceLanguage: "invalid-lang-code",
      targetLanguage: "es",
    } as any);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 p-4">
      <div className="container mx-auto py-8 max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-2">Error Testing Lab</h1>
          <p className="text-purple-200">
            Test Bob's sarcastic error messages and toast notifications
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="bg-purple-950/50 border-purple-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Database className="h-5 w-5 text-red-400" />
                Database Error
              </CardTitle>
              <CardDescription className="text-purple-300">
                Trigger a database-related error
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={testDatabaseError}
                variant="destructive"
                className="w-full"
              >
                Test Database Error
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-purple-950/50 border-purple-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Shield className="h-5 w-5 text-yellow-400" />
                Validation Error
              </CardTitle>
              <CardDescription className="text-purple-300">
                Trigger a validation error with invalid input
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={testValidationError}
                variant="destructive"
                className="w-full"
              >
                Test Validation Error
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-purple-950/50 border-purple-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Network className="h-5 w-5 text-blue-400" />
                API Error
              </CardTitle>
              <CardDescription className="text-purple-300">
                Trigger an external API error
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={testAPIError}
                variant="destructive"
                className="w-full"
              >
                Test API Error
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-purple-950/50 border-purple-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <AlertTriangle className="h-5 w-5 text-orange-400" />
                Auth Error
              </CardTitle>
              <CardDescription className="text-purple-300">
                Trigger an authentication error
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={testAuthError}
                variant="destructive"
                className="w-full"
              >
                Test Auth Error
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-purple-950/50 border-purple-700 md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Bug className="h-5 w-5 text-pink-400" />
                Translation Error
              </CardTitle>
              <CardDescription className="text-purple-300">
                Trigger a translation service error
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={testTranslationError}
                variant="destructive"
                className="w-full"
              >
                Test Translation Error
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-8 bg-purple-950/50 border-purple-700">
          <CardHeader>
            <CardTitle className="text-white">Instructions</CardTitle>
          </CardHeader>
          <CardContent className="text-purple-200 space-y-2">
            <p>
              Click any button above to trigger different types of errors. Each error should:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Display a toast notification in the top-right corner</li>
              <li>Show Bob's sarcastic error message</li>
              <li>Auto-dismiss after 5 seconds</li>
              <li>Log the error to the browser console</li>
            </ul>
            <p className="mt-4 text-sm text-purple-400">
              Note: This page is for testing purposes only and should be removed in production.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
