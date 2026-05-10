require('./src/config/env');
const pool = require('./src/config/db');
const bcrypt = require('bcryptjs');

const seed = async () => {
  try {
    console.log('Seeding database...');

    // Create users
    const hashedPassword = await bcrypt.hash('password123', 12);

    await pool.query(`
      INSERT INTO users (name, email, password, role) VALUES
      ('Alex Creator', 'alex@test.com', $1, 'admin'),
      ('Sam Analyst', 'sam@test.com', $1, 'analyst'),
      ('Jay Viewer', 'jay@test.com', $1, 'viewer')
      ON CONFLICT (email) DO NOTHING
    `, [hashedPassword]);

    const userResult = await pool.query("SELECT id FROM users WHERE email = 'alex@test.com'");
    const userId = userResult.rows[0].id;

    // Create records
    await pool.query(`
      INSERT INTO records (user_id, amount, type, category, platform, status, currency, date, notes) VALUES
      ($1, 45000, 'income', 'Ad Revenue', 'youtube', 'received', 'INR', '2026-03-01', 'March AdSense payout'),
      ($1, 30000, 'income', 'Sponsorship', 'instagram', 'received', 'INR', '2026-03-05', 'Nike collab post'),
      ($1, 25000, 'income', 'Project', 'freelance', 'received', 'INR', '2026-03-10', 'Website for client'),
      ($1, 15000, 'income', 'Sponsorship', 'brand_deal', 'pending', 'INR', '2026-03-15', 'Boat earphones deal - awaiting payment'),
      ($1, 8000, 'income', 'Commission', 'affiliate', 'received', 'INR', '2026-03-20', 'Amazon affiliate March'),
      ($1, 5000, 'expense', 'Equipment', 'other', 'received', 'INR', '2026-03-08', 'Ring light purchase'),
      ($1, 2000, 'expense', 'Software', 'other', 'received', 'INR', '2026-03-12', 'Adobe subscription'),
      ($1, 50000, 'income', 'Ad Revenue', 'youtube', 'received', 'INR', '2026-04-01', 'April AdSense payout'),
      ($1, 20000, 'income', 'Sponsorship', 'brand_deal', 'overdue', 'INR', '2026-04-05', 'Myntra collab - payment overdue'),
      ($1, 12000, 'income', 'Project', 'freelance', 'pending', 'INR', '2026-04-10', 'Logo design - 50% pending'),
      ($1, 3500, 'expense', 'Travel', 'other', 'received', 'INR', '2026-04-08', 'Travel for shoot'),
      ($1, 1500, 'expense', 'Software', 'other', 'received', 'INR', '2026-04-12', 'Canva pro')
      ON CONFLICT DO NOTHING
    `, [userId]);

    console.log('Database seeded successfully');
    console.log('Test accounts:');
    console.log('  Admin:   alex@test.com / password123');
    console.log('  Analyst: sam@test.com / password123');
    console.log('  Viewer:  jay@test.com / password123');
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exit(1);
  }
};

seed();