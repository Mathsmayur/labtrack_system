import mysql from 'mysql2/promise';

async function testDb() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'abcd1234',
      database: 'labtrack'
    });

    const [pcs] = await connection.execute('SELECT * FROM pcs WHERE lab_id = 1');
    console.log("PCs in Lab 1:", pcs);

    await connection.end();
  } catch (error) {
    console.error("DB Error:", error.message);
  }
}

testDb();
