import { and, desc, eq, gte, like, lte, or, count, asc, isNotNull } from "drizzle-orm";
import {
  conversations,
  users,
} from "../../drizzle/schema";
import { getDb } from "./connection";

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}


/**
 * Get paginated conversations with dual-database support
 * - Admin users: Query Manus database
 * - Regular users: Query Supabase database with RLS
 */
export async function getConversationsPaginated(
  userId: number,
  userRole: string,
  params: PaginationParams
): Promise<PaginatedResult<typeof conversations.$inferSelect>> {
  const { page, pageSize } = params;
  const offset = (page - 1) * pageSize;

  // Admin users: Use Manus database
  if (userRole === 'admin') {
    const db = await getDb();
    if (!db) {
      throw new Error('Database not available');
    }

    // Get total count
    const [{ total }] = await db
      .select({ total: count() })
      .from(conversations)
      .where(eq(conversations.userId, userId));

    // Get paginated data
    const data = await db
      .select()
      .from(conversations)
      .where(eq(conversations.userId, userId))
      .orderBy(desc(conversations.createdAt))
      .limit(pageSize)
      .offset(offset);

    const totalPages = Math.ceil(total / pageSize);

    return {
      data,
      pagination: {
        page,
        pageSize,
        totalItems: total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  // Regular users: Use Supabase database with RLS
  const { getSupabaseAdminClient } = await import('../supabaseClient');
  const supabase = getSupabaseAdminClient();
  
  // Get total count
  const { count: total, error: countError } = await supabase
    .from('conversations')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  if (countError) {
    console.error('[Pagination] Count error:', countError);
    throw new Error('Failed to count conversations');
  }

  // Get paginated data
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (error) {
    console.error('[Pagination] Query error:', error);
    throw new Error('Failed to fetch conversations');
  }

  const totalPages = Math.ceil((total || 0) / pageSize);

  // Transform Supabase data to match Manus schema
  const transformedData = (data || []).map((conv: any) => ({
    id: conv.id,
    userId: conv.user_id,
    userMessage: conv.user_message,
    assistantResponse: conv.assistant_response,
    audioUrl: conv.audio_url,
    createdAt: new Date(conv.created_at),
  }));

  return {
    data: transformedData as any,
    pagination: {
      page,
      pageSize,
      totalItems: total || 0,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
}


/**
 * Get conversations by date range with dual-database support
 */
export async function getConversationsByDateRange(
  userId: number,
  userRole: string,
  startDate: Date,
  endDate: Date,
  params: PaginationParams
): Promise<PaginatedResult<typeof conversations.$inferSelect>> {
  const { page, pageSize } = params;
  const offset = (page - 1) * pageSize;

  // Admin users: Use Manus database
  if (userRole === 'admin') {
    const db = await getDb();
    if (!db) {
      throw new Error('Database not available');
    }

    const [{ total }] = await db
      .select({ total: count() })
      .from(conversations)
      .where(
        and(
          eq(conversations.userId, userId),
          gte(conversations.createdAt, startDate),
          lte(conversations.createdAt, endDate)
        )
      );

    const data = await db
      .select()
      .from(conversations)
      .where(
        and(
          eq(conversations.userId, userId),
          gte(conversations.createdAt, startDate),
          lte(conversations.createdAt, endDate)
        )
      )
      .orderBy(desc(conversations.createdAt))
      .limit(pageSize)
      .offset(offset);

    const totalPages = Math.ceil(total / pageSize);

    return {
      data,
      pagination: {
        page,
        pageSize,
        totalItems: total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  // Regular users: Use Supabase database
  const { getSupabaseAdminClient } = await import('../supabaseClient');
  const supabase = getSupabaseAdminClient();

  const { count: total, error: countError } = await supabase
    .from('conversations')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString());

  if (countError) {
    console.error('[Pagination] Date range count error:', countError);
    throw new Error('Failed to count conversations');
  }

  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (error) {
    console.error('[Pagination] Date range query error:', error);
    throw new Error('Failed to fetch conversations');
  }

  const totalPages = Math.ceil((total || 0) / pageSize);

  const transformedData = (data || []).map((conv: any) => ({
    id: conv.id,
    userId: conv.user_id,
    userMessage: conv.user_message,
    assistantResponse: conv.assistant_response,
    audioUrl: conv.audio_url,
    createdAt: new Date(conv.created_at),
  }));

  return {
    data: transformedData as any,
    pagination: {
      page,
      pageSize,
      totalItems: total || 0,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
}


/**
 * Get conversation statistics with dual-database support
 */
export async function getConversationStats(userId: number, userRole: string) {
  // Admin users: Use Manus database
  if (userRole === 'admin') {
    const db = await getDb();
    if (!db) {
      throw new Error('Database not available');
    }

    const [stats] = await db
      .select({
        total: count(),
      })
      .from(conversations)
      .where(eq(conversations.userId, userId));

    // Count conversations with audio
    const [audioStats] = await db
      .select({
        withAudio: count(),
      })
      .from(conversations)
      .where(
        and(
          eq(conversations.userId, userId),
          isNotNull(conversations.audioUrl)
        )
      );

    const [firstConv] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.userId, userId))
      .orderBy(asc(conversations.createdAt))
      .limit(1);

    const [lastConv] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.userId, userId))
      .orderBy(desc(conversations.createdAt))
      .limit(1);

    return {
      totalConversations: stats.total,
      conversationsWithAudio: audioStats.withAudio,
      firstConversation: firstConv?.createdAt || null,
      lastConversation: lastConv?.createdAt || null,
    };
  }

  // Regular users: Use Supabase database
  const { getSupabaseAdminClient } = await import('../supabaseClient');
  const supabase = getSupabaseAdminClient();

  const { count: total } = await supabase
    .from('conversations')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  const { count: withAudio } = await supabase
    .from('conversations')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .not('audio_url', 'is', null);

  const { data: firstConv } = await supabase
    .from('conversations')
    .select('created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
    .limit(1)
    .single();

  const { data: lastConv } = await supabase
    .from('conversations')
    .select('created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  return {
    totalConversations: total || 0,
    conversationsWithAudio: withAudio || 0,
    firstConversation: firstConv ? new Date(firstConv.created_at) : null,
    lastConversation: lastConv ? new Date(lastConv.created_at) : null,
  };
}


/**
 * Search conversations by message content with dual-database support
 */
export async function searchConversations(
  userId: number,
  userRole: string,
  searchQuery: string,
  params: PaginationParams
): Promise<PaginatedResult<typeof conversations.$inferSelect>> {
  const { page, pageSize } = params;
  const offset = (page - 1) * pageSize;
  const searchPattern = `%${searchQuery}%`;

  // Admin users: Use Manus database
  if (userRole === 'admin') {
    const db = await getDb();
    if (!db) {
      throw new Error('Database not available');
    }

    const [{ total }] = await db
      .select({ total: count() })
      .from(conversations)
      .where(
        and(
          eq(conversations.userId, userId),
          or(
            like(conversations.userMessage, searchPattern),
            like(conversations.assistantResponse, searchPattern)
          )
        )
      );

    const data = await db
      .select()
      .from(conversations)
      .where(
        and(
          eq(conversations.userId, userId),
          or(
            like(conversations.userMessage, searchPattern),
            like(conversations.assistantResponse, searchPattern)
          )
        )
      )
      .orderBy(desc(conversations.createdAt))
      .limit(pageSize)
      .offset(offset);

    const totalPages = Math.ceil(total / pageSize);

    return {
      data,
      pagination: {
        page,
        pageSize,
        totalItems: total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  // Regular users: Use Supabase database with text search
  const { getSupabaseAdminClient } = await import('../supabaseClient');
  const supabase = getSupabaseAdminClient();

  const { count: total, error: countError } = await supabase
    .from('conversations')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .or(`user_message.ilike.%${searchQuery}%,assistant_response.ilike.%${searchQuery}%`);

  if (countError) {
    console.error('[Search] Count error:', countError);
    throw new Error('Failed to count search results');
  }

  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('user_id', userId)
    .or(`user_message.ilike.%${searchQuery}%,assistant_response.ilike.%${searchQuery}%`)
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (error) {
    console.error('[Search] Query error:', error);
    throw new Error('Failed to search conversations');
  }

  const totalPages = Math.ceil((total || 0) / pageSize);

  const transformedData = (data || []).map((conv: any) => ({
    id: conv.id,
    userId: conv.user_id,
    userMessage: conv.user_message,
    assistantResponse: conv.assistant_response,
    audioUrl: conv.audio_url,
    createdAt: new Date(conv.created_at),
  }));

  return {
    data: transformedData as any,
    pagination: {
      page,
      pageSize,
      totalItems: total || 0,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
}
