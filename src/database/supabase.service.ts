import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService implements OnModuleInit {
  private supabase: SupabaseClient;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_SERVICE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase URL and Service Key must be provided');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      db: {
        schema: 'public',
      },
    });

    console.log('🔌 Connecting to Supabase...');
    console.log(`📍 URL: ${supabaseUrl}`);

    try {
      // Test the connection with a simple query
      const { data, error } = await this.supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      if (error && error.code !== 'PGRST116') { // PGRST116 = table doesn't exist yet
        console.error('❌ Supabase connection failed:', error.message);
      } else {
        console.log('✅ Successfully connected to Supabase database');
      }
    } catch (err) {
      console.error('❌ Supabase connection test failed:', err.message);
    }
  }

  getClient(): SupabaseClient {
    return this.supabase;
  }

  from(table: string) {
    return this.supabase.from(table);
  }
}