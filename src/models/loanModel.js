import { pool } from '../config/db.js';

export const LoanModel = {
  async createLoan(book_id, member_id, due_date) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const bookCheck = await client.query('SELECT available_copies FROM books WHERE id = $1', [book_id]);
      if (bookCheck.rows[0].available_copies <= 0) {
        throw new Error('Buku sedang tidak tersedia (stok habis).');
      }
      await client.query('UPDATE books SET available_copies = available_copies - 1 WHERE id = $1', [book_id]);
      const loanQuery = `
        INSERT INTO loans (book_id, member_id, due_date) 
        VALUES ($1, $2, $3) RETURNING *
      `;
      const result = await client.query(loanQuery, [book_id, member_id, due_date]);
      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  async getAllLoans() {
    const query = `
      SELECT l.*, b.title as book_title, m.full_name as member_name 
      FROM loans l
      JOIN books b ON l.book_id = b.id
      JOIN members m ON l.member_id = m.id
    `;
    const result = await pool.query(query);
    return result.rows;
  },

  // FUNGSI BARU UNTUK RESPONSI
  async getTopBorrowers() {
    const query = `
      WITH MemberStats AS (
          SELECT 
              m.id, m.full_name, m.email, m.member_type, m.joined_at,
              COUNT(l.id) as total_loans,
              MAX(l.loan_date) as last_loan
          FROM members m
          JOIN loans l ON m.id = l.member_id
          GROUP BY m.id
          ORDER BY total_loans DESC
          LIMIT 3
      ),
      BookCounts AS (
          SELECT 
              l.member_id, 
              b.title, 
              COUNT(*) as count,
              ROW_NUMBER() OVER(PARTITION BY l.member_id ORDER BY COUNT(*) DESC) as rank
          FROM loans l
          JOIN books b ON l.book_id = b.id
          GROUP BY l.member_id, b.title
      )
      SELECT 
          ms.*,
          bc.title as favorite_book
      FROM MemberStats ms
      LEFT JOIN BookCounts bc ON ms.id = bc.member_id AND bc.rank = 1
      ORDER BY ms.total_loans DESC;
    `;
    const result = await pool.query(query);
    return result.rows;
  }
};