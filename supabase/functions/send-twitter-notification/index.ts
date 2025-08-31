import { createHmac } from "node:crypto";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Twitter API credentials
const API_KEY = Deno.env.get("TWITTER_CONSUMER_KEY")?.trim();
const API_SECRET = Deno.env.get("TWITTER_CONSUMER_SECRET")?.trim();
const ACCESS_TOKEN = Deno.env.get("TWITTER_ACCESS_TOKEN")?.trim();
const ACCESS_TOKEN_SECRET = Deno.env.get("TWITTER_ACCESS_TOKEN_SECRET")?.trim();

// Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

function validateEnvironmentVariables() {
  if (!API_KEY) {
    throw new Error("Missing TWITTER_CONSUMER_KEY environment variable");
  }
  if (!API_SECRET) {
    throw new Error("Missing TWITTER_CONSUMER_SECRET environment variable");
  }
  if (!ACCESS_TOKEN) {
    throw new Error("Missing TWITTER_ACCESS_TOKEN environment variable");
  }
  if (!ACCESS_TOKEN_SECRET) {
    throw new Error("Missing TWITTER_ACCESS_TOKEN_SECRET environment variable");
  }
}

function generateOAuthSignature(
  method: string,
  url: string,
  params: Record<string, string>,
  consumerSecret: string,
  tokenSecret: string
): string {
  const signatureBaseString = `${method}&${encodeURIComponent(
    url
  )}&${encodeURIComponent(
    Object.entries(params)
      .sort()
      .map(([k, v]) => `${k}=${v}`)
      .join("&")
  )}`;
  const signingKey = `${encodeURIComponent(
    consumerSecret
  )}&${encodeURIComponent(tokenSecret)}`;
  const hmacSha1 = createHmac("sha1", signingKey);
  const signature = hmacSha1.update(signatureBaseString).digest("base64");

  return signature;
}

function generateOAuthHeader(method: string, url: string): string {
  const oauthParams = {
    oauth_consumer_key: API_KEY!,
    oauth_nonce: Math.random().toString(36).substring(2),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: ACCESS_TOKEN!,
    oauth_version: "1.0",
  };

  const signature = generateOAuthSignature(
    method,
    url,
    oauthParams,
    API_SECRET!,
    ACCESS_TOKEN_SECRET!
  );

  const signedOAuthParams = {
    ...oauthParams,
    oauth_signature: signature,
  };

  const entries = Object.entries(signedOAuthParams).sort((a, b) =>
    a[0].localeCompare(b[0])
  );

  return (
    "OAuth " +
    entries
      .map(([k, v]) => `${encodeURIComponent(k)}="${encodeURIComponent(v)}"`)
      .join(", ")
  );
}

async function sendTweet(tweetText: string): Promise<any> {
  const url = "https://api.x.com/2/tweets";
  const method = "POST";
  const params = { text: tweetText };

  const oauthHeader = generateOAuthHeader(method, url);
  console.log("📤 Sending tweet with OAuth header");

  const response = await fetch(url, {
    method: method,
    headers: {
      Authorization: oauthHeader,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  const responseText = await response.text();
  console.log("📥 Twitter API Response:", responseText);

  if (!response.ok) {
    throw new Error(
      `Twitter API error! status: ${response.status}, body: ${responseText}`
    );
  }

  return JSON.parse(responseText);
}

async function notifyUserOfMessage(recipientUsername: string, senderName: string) {
  try {
    console.log(`🐦 Sending Twitter notification to @${recipientUsername} from ${senderName}`);
    
    const tweetText = `📬 Hey @${recipientUsername}! You have a new message from ${senderName} on KOLHub. Check your inbox: https://kolhub.app/dashboard 🚀 #KOLHub #CryptoKOL`;
    
    const result = await sendTweet(tweetText);
    console.log("✅ Twitter notification sent successfully:", result);
    return result;
  } catch (error) {
    console.error("❌ Failed to send Twitter notification:", error);
    throw error;
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    validateEnvironmentVariables();
    
    console.log("🔔 Twitter notification request received");
    
    const { recipientId, senderId, messageContent } = await req.json();
    
    if (!recipientId || !senderId) {
      console.error("❌ Missing recipientId or senderId");
      return new Response(
        JSON.stringify({ error: 'Missing recipientId or senderId' }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get recipient and sender information from database
    console.log("🔍 Fetching user information...");
    
    const [recipientResult, senderResult] = await Promise.all([
      supabase
        .from('users')
        .select('twitter_username, kol_profiles(display_name), project_profiles(company_name)')
        .eq('id', recipientId)
        .single(),
      supabase
        .from('users')
        .select('twitter_username, kol_profiles(display_name), project_profiles(company_name)')
        .eq('id', senderId)
        .single()
    ]);

    if (recipientResult.error || senderResult.error) {
      console.error("❌ Error fetching user data:", {
        recipientError: recipientResult.error,
        senderError: senderResult.error
      });
      return new Response(
        JSON.stringify({ error: 'Failed to fetch user information' }), 
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const recipient = recipientResult.data;
    const sender = senderResult.data;

    if (!recipient.twitter_username) {
      console.log("⚠️ Recipient has no Twitter username, skipping notification");
      return new Response(
        JSON.stringify({ message: 'Recipient has no Twitter username' }), 
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get sender's display name
    const senderDisplayName = sender.kol_profiles?.[0]?.display_name || 
                             sender.project_profiles?.[0]?.company_name || 
                             sender.twitter_username || 
                             'Someone';

    console.log("👥 Notification details:", {
      recipientUsername: recipient.twitter_username,
      senderName: senderDisplayName,
      messagePreview: messageContent?.substring(0, 50) + (messageContent?.length > 50 ? '...' : '')
    });

    // Send the Twitter notification
    const notificationResult = await notifyUserOfMessage(
      recipient.twitter_username, 
      senderDisplayName
    );

    return new Response(
      JSON.stringify({ 
        success: true, 
        tweetId: notificationResult.data?.id,
        message: 'Twitter notification sent successfully' 
      }), 
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: any) {
    console.error("💥 Twitter notification error:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});