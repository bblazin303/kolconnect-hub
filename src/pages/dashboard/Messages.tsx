import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { 
  Search, 
  Send, 
  MessageCircle, 
  Clock,
  CheckCircle2,
  MoreHorizontal
} from 'lucide-react'

interface Message {
  id: string
  content: string
  created_at: string
  sender_id: string
  recipient_id: string
  read: boolean
  sender?: {
    twitter_username: string
    twitter_profile_image_url: string
  }
  recipient?: {
    twitter_username: string
    twitter_profile_image_url: string
  }
}

interface Conversation {
  user_id: string
  username: string
  avatar_url: string
  last_message: string
  last_message_time: string
  unread_count: number
}

export default function Messages() {
  const { user } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.id) {
      loadConversations()
    }
  }, [user?.id])

  const loadConversations = async () => {
    try {
      // Get all conversations where user is sender or recipient
      const { data: messagesData } = await supabase
        .from('messages')
        .select(`
          *,
          sender:users!sender_id(twitter_username, twitter_profile_image_url),
          recipient:users!recipient_id(twitter_username, twitter_profile_image_url)
        `)
        .or(`sender_id.eq.${user?.id},recipient_id.eq.${user?.id}`)
        .order('created_at', { ascending: false })

      if (messagesData) {
        // Group messages by conversation partner
        const conversationMap = new Map<string, Conversation>()
        
        messagesData.forEach((msg: any) => {
          const partnerId = msg.sender_id === user?.id ? msg.recipient_id : msg.sender_id
          const partner = msg.sender_id === user?.id ? msg.recipient : msg.sender
          
          if (!conversationMap.has(partnerId)) {
            conversationMap.set(partnerId, {
              user_id: partnerId,
              username: partner?.twitter_username || 'Unknown User',
              avatar_url: partner?.twitter_profile_image_url || '',
              last_message: msg.content,
              last_message_time: msg.created_at,
              unread_count: 0
            })
          }
          
          // Count unread messages
          if (msg.recipient_id === user?.id && !msg.read) {
            const conv = conversationMap.get(partnerId)!
            conv.unread_count += 1
          }
        })

        setConversations(Array.from(conversationMap.values()))
      }
    } catch (error) {
      console.error('Error loading conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadMessages = async (partnerId: string) => {
    try {
      const { data } = await supabase
        .from('messages')
        .select(`
          *,
          sender:users!sender_id(twitter_username, twitter_profile_image_url),
          recipient:users!recipient_id(twitter_username, twitter_profile_image_url)
        `)
        .or(`and(sender_id.eq.${user?.id},recipient_id.eq.${partnerId}),and(sender_id.eq.${partnerId},recipient_id.eq.${user?.id})`)
        .order('created_at', { ascending: true })

      if (data) {
        setMessages(data)
        
        // Mark messages as read
        await supabase
          .from('messages')
          .update({ read: true })
          .eq('recipient_id', user?.id)
          .eq('sender_id', partnerId)
      }
    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: user?.id,
          recipient_id: selectedConversation,
          content: newMessage.trim()
        })

      if (!error) {
        setNewMessage('')
        await loadMessages(selectedConversation)
        await loadConversations()
      }
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = diffMs / (1000 * 60 * 60)
    
    if (diffHours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      })
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      })
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-48"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-96">
            <div className="bg-muted rounded-lg"></div>
            <div className="lg:col-span-2 bg-muted rounded-lg"></div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Messages</h1>
          <p className="text-muted-foreground">Communicate with projects and other KOLs</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
          {/* Conversations List */}
          <Card className="flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Conversations
              </CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search conversations..."
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-0">
              <ScrollArea className="h-full">
                {conversations.length === 0 ? (
                  <div className="p-6 text-center text-muted-foreground">
                    <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No conversations yet</p>
                    <p className="text-sm">Start messaging other users!</p>
                  </div>
                ) : (
                  <div className="space-y-1 p-2">
                    {conversations.map((conv) => (
                      <div
                        key={conv.user_id}
                        onClick={() => {
                          setSelectedConversation(conv.user_id)
                          loadMessages(conv.user_id)
                        }}
                        className={`p-3 rounded-lg cursor-pointer transition-colors hover:bg-accent ${
                          selectedConversation === conv.user_id ? 'bg-accent' : ''
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={conv.avatar_url} />
                            <AvatarFallback>
                              {conv.username.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="font-medium text-sm truncate">
                                @{conv.username}
                              </p>
                              {conv.unread_count > 0 && (
                                <Badge variant="secondary" className="h-5 px-2 text-xs">
                                  {conv.unread_count}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground truncate">
                              {conv.last_message}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatTime(conv.last_message_time)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Chat Area */}
          <div className="lg:col-span-2">
            {selectedConversation ? (
              <Card className="flex flex-col h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={conversations.find(c => c.user_id === selectedConversation)?.avatar_url} />
                        <AvatarFallback>
                          {conversations.find(c => c.user_id === selectedConversation)?.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">
                          @{conversations.find(c => c.user_id === selectedConversation)?.username}
                        </h3>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                
                <Separator />
                
                <CardContent className="flex-1 p-0">
                  <ScrollArea className="h-full p-4">
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${
                            message.sender_id === user?.id ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-2 rounded-2xl ${
                              message.sender_id === user?.id
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <div className="flex items-center justify-end mt-1 space-x-1">
                              <p className="text-xs opacity-70">
                                {formatTime(message.created_at)}
                              </p>
                              {message.sender_id === user?.id && (
                                <CheckCircle2 className="h-3 w-3 opacity-70" />
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>

                <Separator />
                
                <div className="p-4">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          sendMessage()
                        }
                      }}
                      className="flex-1"
                    />
                    <Button 
                      onClick={sendMessage}
                      disabled={!newMessage.trim()}
                      size="sm"
                      className="px-4"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="flex items-center justify-center h-full">
                <div className="text-center">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Select a conversation</h3>
                  <p className="text-muted-foreground">
                    Choose a conversation from the sidebar to start messaging
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}