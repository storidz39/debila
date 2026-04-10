const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const pool = mysql.createPool({
  host: "mysql-159b2565-zinou.i.aivencloud.com",
  port: 27815,
  user: "avnadmin",
  password: "AVNS_SSRRxBV-lPuie7w_FAI",
  database: "defaultdb",
  ssl: { rejectUnauthorized: false }
});

module.exports = async (req, res) => {
  try {
    const schemaPath = path.join(process.cwd(), 'database', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    const queries = schema.split(';').filter(q => q.trim());
    
    for (let query of queries) {
      await pool.execute(query);
    }
    
    res.status(200).json({ success: true, message: "تم إنشاء كافة الجداول بنجاح في Aiven!" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
