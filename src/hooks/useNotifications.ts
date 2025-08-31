import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from './useAuth'
import { useToast } from './use-toast'

export interface Notification {
  id: string
  type: 'message' | 'campaign' | 'application'
  title: string
  message: string
  read: boolean
  created_at: string
  sender?: {
    id: string
    name: string
    avatar?: string
  }
  campaign_id?: string
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { toast } = useToast()

  // Fetch existing notifications
  const fetchNotifications = async () => {
    if (!user?.id) return

    try {
      // Get recent unread messages as notifications
      const { data: messages, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:users!messages_sender_id_fkey(
            id,
            twitter_username,
            avatar_url,
            twitter_profile_image_url
          )
        `)
        .eq('recipient_id', user.id)
        .eq('read', false)
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error

      const messageNotifications: Notification[] = (messages || []).map(msg => ({
        id: msg.id,
        type: 'message' as const,
        title: 'New Message',
        message: msg.subject || 'You have a new message',
        read: msg.read,
        created_at: msg.created_at,
        sender: msg.sender ? {
          id: msg.sender.id,
          name: `@${msg.sender.twitter_username || 'user'}`,
          avatar: msg.sender.twitter_profile_image_url || msg.sender.avatar_url
        } : undefined
      }))

      setNotifications(messageNotifications)
      setUnreadCount(messageNotifications.filter(n => !n.read).length)
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  // Set up real-time listener
  useEffect(() => {
    if (!user?.id) return

    fetchNotifications()

    // Listen for new messages
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `recipient_id=eq.${user.id}`
        },
        async (payload) => {
          console.log('New message received:', payload)
          
          // Fetch sender info for the notification
          const { data: sender } = await supabase
            .from('users')
            .select('id, twitter_username, avatar_url, twitter_profile_image_url')
            .eq('id', payload.new.sender_id)
            .single()

          const newNotification: Notification = {
            id: payload.new.id,
            type: 'message',
            title: 'New Message',
            message: payload.new.subject || 'You have a new message',
            read: false,
            created_at: payload.new.created_at,
            sender: sender ? {
              id: sender.id,
              name: `@${sender.twitter_username || 'user'}`,
              avatar: sender.twitter_profile_image_url || sender.avatar_url
            } : undefined
          }

          setNotifications(prev => [newNotification, ...prev])
          setUnreadCount(prev => prev + 1)

          // Show toast notification
          toast({
            title: "New Message",
            description: `${newNotification.sender?.name || 'Someone'} sent you a message`,
          })
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `recipient_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Message updated:', payload)
          
          // If a message was marked as read, update local state
          if (payload.new.read === true && payload.old.read === false) {
            setNotifications(prev =>
              prev.map(n =>
                n.id === payload.new.id ? { ...n, read: true } : n
              )
            )
            setUnreadCount(prev => Math.max(0, prev - 1))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user?.id, toast])

  const markAsRead = async (notificationId: string) => {
    try {
      // Mark message as read in database
      const { error } = await supabase
        .from('messages')
        .update({ read: true })
        .eq('id', notificationId)

      if (error) {
        console.error('Error marking message as read:', error)
        return
      }

      // Update local state immediately
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, read: true } : n
        )
      )
      setUnreadCount(prev => Math.max(0, prev - 1))

      // Refetch to ensure consistency
      setTimeout(() => fetchNotifications(), 1000)
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      if (!user?.id) return

      // Mark all messages as read
      const { error } = await supabase
        .from('messages')
        .update({ read: true })
        .eq('recipient_id', user.id)
        .eq('read', false)

      if (error) {
        console.error('Error marking all messages as read:', error)
        return
      }

      // Update local state immediately
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      setUnreadCount(0)

      // Refetch to ensure consistency
      setTimeout(() => fetchNotifications(), 1000)
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  const clearNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId))
    setUnreadCount(prev => {
      const notification = notifications.find(n => n.id === notificationId)
      return notification && !notification.read ? prev - 1 : prev
    })
  }

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    clearNotification,
    refetch: fetchNotifications
  }
}