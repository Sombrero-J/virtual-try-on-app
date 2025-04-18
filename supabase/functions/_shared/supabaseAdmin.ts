import { createClient, SupabaseClient } from 'jsr:@supabase/supabase-js@^2';

console.log('Initializing Supabase Admin client...');

// Check for development override URL first
const devSupabaseUrl = Deno.env.get('REMOTE_SUPABASE_URL');
// Get the standard URL (used in production or local dev without override)
const prodSupabaseUrl = Deno.env.get('SUPABASE_URL');

const devServiceRoleKey = Deno.env.get('REMOTE_SUPABASE_SERVICE_ROLE_KEY');
const prodServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const supabaseUrl = devSupabaseUrl || prodSupabaseUrl;
const supabaseSRKey = devServiceRoleKey || prodServiceRoleKey;

// Log which URL is being attempted
console.log(
	`Attempting to use Supabase URL: ${devSupabaseUrl ? 'REMOTE_SUPABASE_URL' : 'SUPABASE_URL'}`
);
console.log(
	`Attempting to use Supabase Key: ${devServiceRoleKey ? 'REMOTE_SUPABASE_SERVICE_ROLE_KEY' : 'SUPABASE_SERVICE_ROLE_KEY'}`
);

if (!supabaseUrl) {
	console.error(
		'Missing Supabase URL. Ensure SUPABASE_URL (or REMOTE_SUPABASE_URL for dev override) is set.'
	);
	throw new Error('Server configuration error: Missing SUPABASE_URL environment variable.');
}

if (!supabaseSRKey) {
	console.error('Missing Supabase Service Role Key. Ensure SUPABASE_SERVICE_ROLE_KEY is set.');
	throw new Error(
		'Server configuration error: Missing SUPABASE_SERVICE_ROLE_KEY environment variable.'
	);
}

// --- Client Creation ---
let supabaseAdminClient: SupabaseClient;
try {
	supabaseAdminClient = createClient(supabaseUrl, supabaseSRKey);
	console.log('Supabase Admin client initialized successfully.');
} catch (error) {
	console.error('Failed to create Supabase Admin client:', error);
	throw new Error(`Server configuration error: Failed to initialize Supabase client. ${error}`);
}

export { supabaseAdminClient };
