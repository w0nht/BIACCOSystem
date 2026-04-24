import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 });
    }

    // Definindo o caminho dentro do Volume montado
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    
    // Cria a pasta caso o volume esteja vazio
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = `${Date.now()}-${file.name.replace(/\s/g, '_')}`;
    const filePath = path.join(uploadDir, fileName);

    // Escreve o arquivo no disco (Volume do Railway)
    fs.writeFileSync(filePath, buffer);

    // A URL será o seu domínio + /uploads/nome-do-arquivo
    const fileUrl = `/uploads/${fileName}`;

    return NextResponse.json({ url: fileUrl });
  } catch (error: any) {
    console.error("Erro no upload local:", error);
    return NextResponse.json({ error: "Erro ao salvar arquivo no volume" }, { status: 500 });
  }
}