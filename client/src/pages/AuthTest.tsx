import { useState } from 'react'
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'

export default function AuthTest() {
  const { user, loading, signIn, signUp, signOut, signInWithGoogle } = useSupabaseAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  const handleSignUp = async () => {
    setActionLoading(true)
    setMessage(null)
    const { error } = await signUp(email, password)
    setActionLoading(false)
    
    if (error) {
      setMessage({ type: 'error', text: error.message })
    } else {
      setMessage({ type: 'success', text: 'Account created! Check your email for confirmation (if enabled).' })
      setEmail('')
      setPassword('')
    }
  }

  const handleSignIn = async () => {
    setActionLoading(true)
    setMessage(null)
    const { error } = await signIn(email, password)
    setActionLoading(false)
    
    if (error) {
      setMessage({ type: 'error', text: error.message })
    } else {
      setMessage({ type: 'success', text: 'Signed in successfully!' })
      setEmail('')
      setPassword('')
    }
  }

  const handleSignOut = async () => {
    setActionLoading(true)
    await signOut()
    setActionLoading(false)
    setMessage({ type: 'success', text: 'Signed out successfully!' })
  }

  const handleGoogleSignIn = async () => {
    setActionLoading(true)
    setMessage(null)
    try {
      await signInWithGoogle()
    } catch (error) {
      setMessage({ type: 'error', text: 'Google sign-in failed. Make sure it\'s enabled in Supabase.' })
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">🧪 Supabase Auth Test</h1>
          <p className="text-slate-300">Test your Supabase authentication integration</p>
        </div>

        {/* Connection Status */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              {user ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-green-400" />
                  Connected to Supabase
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-slate-400" />
                  Not Authenticated
                </>
              )}
            </CardTitle>
            <CardDescription className="text-slate-400">
              {user ? 'You are signed in' : 'Sign in or create an account to test'}
            </CardDescription>
          </CardHeader>
          {user && (
            <CardContent className="space-y-2">
              <div className="bg-slate-900/50 p-4 rounded-lg">
                <p className="text-sm text-slate-400 mb-2">User Information:</p>
                <pre className="text-xs text-green-400 overflow-auto">
                  {JSON.stringify(user, null, 2)}
                </pre>
              </div>
              <Button 
                onClick={handleSignOut} 
                variant="destructive" 
                className="w-full"
                disabled={actionLoading}
              >
                {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Sign Out'}
              </Button>
            </CardContent>
          )}
        </Card>

        {/* Messages */}
        {message && (
          <Alert className={message.type === 'success' ? 'bg-green-900/20 border-green-500' : 'bg-red-900/20 border-red-500'}>
            <AlertDescription className={message.type === 'success' ? 'text-green-400' : 'text-red-400'}>
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        {/* Auth Forms */}
        {!user && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Sign Up */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Create Account</CardTitle>
                <CardDescription className="text-slate-400">
                  Sign up with email and password
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-slate-900/50 border-slate-600 text-white"
                />
                <Input
                  type="password"
                  placeholder="Password (min 6 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-slate-900/50 border-slate-600 text-white"
                />
                <Button 
                  onClick={handleSignUp} 
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  disabled={actionLoading || !email || !password}
                >
                  {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Sign Up'}
                </Button>
              </CardContent>
            </Card>

            {/* Sign In */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Sign In</CardTitle>
                <CardDescription className="text-slate-400">
                  Login with existing account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-slate-900/50 border-slate-600 text-white"
                />
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-slate-900/50 border-slate-600 text-white"
                />
                <Button 
                  onClick={handleSignIn} 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={actionLoading || !email || !password}
                >
                  {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Sign In'}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Social Sign In */}
        {!user && (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Social Sign In</CardTitle>
              <CardDescription className="text-slate-400">
                Sign in with OAuth providers (must be enabled in Supabase)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={handleGoogleSignIn} 
                variant="outline" 
                className="w-full bg-white hover:bg-slate-100 text-slate-900"
                disabled={actionLoading}
              >
                {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : '🔍 Sign in with Google'}
              </Button>
              <p className="text-xs text-slate-500 text-center">
                Note: Social providers must be configured in Supabase dashboard
              </p>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">✅ Test Checklist</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-slate-300">
              <li>Create an account with email/password</li>
              <li>Check if you see user information displayed above</li>
              <li>Sign out</li>
              <li>Sign in with the same credentials</li>
              <li>Verify the user info appears again</li>
              <li>(Optional) Try Google sign-in if you enabled it</li>
            </ol>
            <div className="mt-4 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
              <p className="text-sm text-blue-300">
                <strong>💡 Tip:</strong> Check the Supabase dashboard → Authentication → Users to see registered users
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
