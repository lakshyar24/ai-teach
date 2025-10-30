import { Pool } from 'pg';

let pool;

export function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.POSTGRES_URL,
      ssl: {
        rejectUnauthorized: false
      }
    });
  }
  return pool;
}

export async function query(text, params) {
  const pool = getPool();
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  console.log('Executed query', { text, duration, rows: res.rowCount });
  return res;
}

// Initialize database tables
export async function initDatabase() {
  const createTablesQuery = `
    -- User Roadmaps table
    CREATE TABLE IF NOT EXISTS user_roadmaps (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title TEXT NOT NULL,
      goal TEXT,
      total_days INTEGER,
      hours_per_day DECIMAL(3,1),
      skill_level TEXT,
      focus_areas TEXT[],
      is_custom BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Roadmap Topics table
    CREATE TABLE IF NOT EXISTS roadmap_topics (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      roadmap_id UUID REFERENCES user_roadmaps(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT,
      order_index INTEGER NOT NULL,
      estimated_hours DECIMAL(4,1),
      learning_objectives TEXT[],
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Create indexes
    CREATE INDEX IF NOT EXISTS idx_roadmap_topics_roadmap ON roadmap_topics(roadmap_id);
    CREATE INDEX IF NOT EXISTS idx_roadmap_topics_order ON roadmap_topics(roadmap_id, order_index);
  `;

  try {
    await query(createTablesQuery);
    console.log('Database tables initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

export default { query, getPool, initDatabase };