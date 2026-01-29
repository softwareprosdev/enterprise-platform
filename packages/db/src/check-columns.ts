import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL!);

async function checkColumns() {
  const result = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'users' ORDER BY ordinal_position`;
  console.log('Users table columns:');
  console.log(result.map(r => r.column_name).join(', '));
  await sql.end();
}

checkColumns();
