import { pool } from '../lib/db';
import fs from 'fs';
import path from 'path';

async function rodarMigracao() {
  try {
    // Lê o conteúdo do seu schema.sql
    const sqlPath = path.join(__dirname, 'schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log("Executando migração do banco de dados...");
    
    // O pool.query pode executar múltiplos comandos de uma vez
    await pool.query(sql); 
    
    console.log("✅ Banco de dados criado/atualizado com sucesso!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Erro ao rodar migração:", err);
    process.exit(1);
  }
}

rodarMigracao();