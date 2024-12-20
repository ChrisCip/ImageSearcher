import sql from 'mssql';

const dbConfig = {
  server: 'localhost',
  database: 'ImageSearcher',
  user: 'chrismi',
  password: 'chrismi123',
  options: {
    trustServerCertificate: true,
    multiSubnetFailover: true,
    encrypt: false
  }
};


export const getConnection = async () => {
  try {
    const pool = await sql.connect(dbConfig);
    return pool;
  } catch (error) {
    console.error('Error de conexión:', error);
    throw error;
  }
}
