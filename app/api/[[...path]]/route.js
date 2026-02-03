import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { supabaseAdmin } from '@/lib/supabase/server';
import { getClientIP } from '@/lib/utils/getClientIP';
import { v4 as uuidv4 } from 'uuid';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const MODEL_NAME = 'llama-3.3-70b-versatile';

// Helper to get user from session
async function getUser(request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return null;
  
  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  
  if (error || !user) return null;
  return user;
}

// POST /api/auth/signup - Create user
export async function POST(request) {
  const path = new URL(request.url).pathname;
  
  if (path === '/api/auth/signup') {
    try {
      const { id, email, name, password } = await request.json();
      
      // Insert user into users table
      const { data, error } = await supabaseAdmin
        .from('users')
        .insert([
          {
            id,
            email,
            name,
            password, // Plain text as per requirement
            created_at: new Date().toISOString(),
          }
        ])
        .select()
        .single();
      
      if (error) throw error;
      
      return NextResponse.json({ user: data });
    } catch (error) {
      console.error('Signup error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
  }
  
  // POST /api/chat - Send message
  if (path === '/api/chat') {
    try {
      const { message, chatId, customGPTId, messages: previousMessages } = await request.json();
      const authHeader = request.headers.get('authorization');
      
      let userId = null;
      let guestIp = null;
      
      // Check if user is authenticated
      if (authHeader) {
        const token = authHeader.replace('Bearer ', '');
        const { data: { user } } = await supabaseAdmin.auth.getUser(token);
        if (user) userId = user.id;
      }
      
      // If not authenticated, use IP
      if (!userId) {
        guestIp = getClientIP(request);
      }
      
      let currentChatId = chatId;
      let chatTitle = 'New Chat';
      
      // Create new chat if needed
      if (!currentChatId) {
        // Generate title from first message
        chatTitle = message.substring(0, 50) + (message.length > 50 ? '...' : '');
        
        const { data: newChat, error: chatError } = await supabaseAdmin
          .from('chats')
          .insert([
            {
              id: uuidv4(),
              user_id: userId,
              guest_ip: guestIp,
              title: chatTitle,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }
          ])
          .select()
          .single();
        
        if (chatError) throw chatError;
        currentChatId = newChat.id;
      }
      
      // Save user message
      const { error: userMsgError } = await supabaseAdmin
        .from('messages')
        .insert([
          {
            id: uuidv4(),
            chat_id: currentChatId,
            role: 'user',
            content: message,
            created_at: new Date().toISOString(),
          }
        ]);
      
      if (userMsgError) throw userMsgError;
      
      // Get custom GPT system prompt if selected
      let systemPrompt = 'You are a helpful AI assistant.';
      if (customGPTId) {
        const { data: customGPT } = await supabaseAdmin
          .from('custom_gpts')
          .select('system_prompt')
          .eq('id', customGPTId)
          .single();
        
        if (customGPT) {
          systemPrompt = customGPT.system_prompt;
        }
      }
      
      // Build messages for Groq
      const groqMessages = [
        { role: 'system', content: systemPrompt },
      ];
      
      // Add previous messages for context
      if (previousMessages && previousMessages.length > 0) {
        previousMessages.forEach(msg => {
          if (msg.role && msg.content) {
            groqMessages.push({
              role: msg.role,
              content: msg.content,
            });
          }
        });
      }
      
      // Add current message
      groqMessages.push({ role: 'user', content: message });
      
      // Get AI response from Groq
      const completion = await groq.chat.completions.create({
        model: MODEL_NAME,
        messages: groqMessages,
        temperature: 0.7,
        max_tokens: 2000,
      });
      
      const aiMessage = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
      
      // Save AI message
      const { error: aiMsgError } = await supabaseAdmin
        .from('messages')
        .insert([
          {
            id: uuidv4(),
            chat_id: currentChatId,
            role: 'assistant',
            content: aiMessage,
            created_at: new Date().toISOString(),
          }
        ]);
      
      if (aiMsgError) throw aiMsgError;
      
      return NextResponse.json({
        message: aiMessage,
        chatId: currentChatId,
        title: chatTitle,
      });
    } catch (error) {
      console.error('Chat error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }
  
  // POST /api/custom-gpts - Create custom GPT
  if (path === '/api/custom-gpts') {
    try {
      const { name, description, system_prompt } = await request.json();
      const authHeader = request.headers.get('authorization');
      
      if (!authHeader) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabaseAdmin.auth.getUser(token);
      
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      
      const { data, error } = await supabaseAdmin
        .from('custom_gpts')
        .insert([
          {
            id: uuidv4(),
            user_id: user.id,
            name,
            description,
            system_prompt,
            created_at: new Date().toISOString(),
          }
        ])
        .select()
        .single();
      
      if (error) throw error;
      
      return NextResponse.json({ customGPT: data });
    } catch (error) {
      console.error('Create custom GPT error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }
  
  return NextResponse.json({ message: 'API endpoint' });
}

// GET requests
export async function GET(request) {
  const path = new URL(request.url).pathname;
  
  // GET /api/chats - Get user's chats
  if (path === '/api/chats') {
    try {
      const authHeader = request.headers.get('authorization');
      let userId = null;
      let guestIp = null;
      
      if (authHeader) {
        const token = authHeader.replace('Bearer ', '');
        const { data: { user } } = await supabaseAdmin.auth.getUser(token);
        if (user) userId = user.id;
      }
      
      if (!userId) {
        guestIp = getClientIP(request);
      }
      
      let query = supabaseAdmin
        .from('chats')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(50);
      
      if (userId) {
        query = query.eq('user_id', userId);
      } else {
        query = query.eq('guest_ip', guestIp);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      return NextResponse.json({ chats: data || [] });
    } catch (error) {
      console.error('Get chats error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }
  
  // GET /api/chats/:id/messages - Get messages for a chat
  const chatMessagesMatch = path.match(/^\/api\/chats\/([^\/]+)\/messages$/);
  if (chatMessagesMatch) {
    try {
      const chatId = chatMessagesMatch[1];
      
      const { data, error } = await supabaseAdmin
        .from('messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      return NextResponse.json({ messages: data || [] });
    } catch (error) {
      console.error('Get messages error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }
  
  // GET /api/custom-gpts - Get user's custom GPTs
  if (path === '/api/custom-gpts') {
    try {
      const authHeader = request.headers.get('authorization');
      
      if (!authHeader) {
        return NextResponse.json({ customGPTs: [] });
      }
      
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabaseAdmin.auth.getUser(token);
      
      if (!user) {
        return NextResponse.json({ customGPTs: [] });
      }
      
      const { data, error } = await supabaseAdmin
        .from('custom_gpts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return NextResponse.json({ customGPTs: data || [] });
    } catch (error) {
      console.error('Get custom GPTs error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }
  
  return NextResponse.json({ message: 'AI Chat API' });
}
