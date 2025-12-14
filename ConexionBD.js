const express = require('express');
const sql = require('mssql/msnodesqlv8'); 
const cors = require('cors');

const app = express();
app.use(cors()); 

// TU CONFIGURACIÓN EXACTA
const config = {
    server: 'GRUPO-CCALLOHUA\\SQLEXPRESS', 
    database: 'Pagina_Educativa',
    driver: 'msnodesqlv8',
    options: {
        trustedConnection: true, 
        trustServerCertificate: true
    }
};

// RUTA PARA VER LOS CURSOS
app.get('/api/cursos', async (req, res) => {
    try {
        let pool = await sql.connect(config);
        let result = await pool.request().query('SELECT * FROM Cursos');
        console.log("✅ Datos consultados exitosamente");
        res.json(result.recordset);
    } catch (err) {
        console.error("❌ Error conectando a SQL:", err);
        res.status(500).send(err.message);
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo. Entra aquí: http://localhost:${PORT}/api/cursos`);
});