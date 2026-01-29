import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL!);

async function fixSchema() {
  console.log('Adding missing columns...');
  
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS title TEXT`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS department TEXT`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS can_receive_calls BOOLEAN DEFAULT false`;
  
  console.log('Done!');
  await sql.end();
}

fixSchema();
