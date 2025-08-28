import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/hooks/useAuth'
import { toast } from '@/hooks/use-toast'
import { useNavigate } from 'react-router-dom'
import { Header } from '@/components/layout/Header'

export default function EmailAuthPage() {
  const [activeTab, setActiveTab] = useState<'kol' | 'project'>('kol')
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { signInWithEmail, signUpWithEmail } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data, error } = isSignUp 
        ? await signUpWithEmail(email, password, activeTab)
        : await signInWithEmail(email, password)

      if (error) {
        toast({
          variant: "destructive",
          title: "Authentication Failed",
          description: error.message
        })
      } else if (isSignUp) {
        toast({
          title: "Account Created!",
          description: "Check your email to verify your account, then sign in."
        })
        setIsSignUp(false)
      } else {
        toast({
          title: "Welcome back!",
          description: "Successfully signed in."
        })
        navigate(`/dashboard/${activeTab}`)
      }
    } catch (error: any) {
      toast({
        variant: "destructive", 
        title: "Error",
        description: error.message || "An unexpected error occurred"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle>
                {isSignUp ? 'Create Account' : 'Sign In'}
              </CardTitle>
            </CardHeader>
            
            <CardContent>
                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'kol' | 'project')}>
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="kol">KOL</TabsTrigger>
                  <TabsTrigger value="project">Project</TabsTrigger>
                </TabsList>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={6}
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Sign In')}
                  </Button>

                  <Button 
                    type="button" 
                    variant="ghost" 
                    className="w-full"
                    onClick={() => setIsSignUp(!isSignUp)}
                  >
                    {isSignUp ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
                  </Button>
                </form>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}