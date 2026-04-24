import { createUploadthing, type FileRouter } from "uploadthing/next";
import { getSession, canCreateContent } from "@/lib/auth";

const f = createUploadthing();

// Define o roteador de arquivos
export const ourFileRouter = {
  // Define uma rota chamada "imageUploader"
  imageUploader: f({ image: { maxFileSize: "4MB" }, pdf: { maxFileSize: "16MB" } })
    // Middleware para verificar autenticação antes de liberar o upload
    .middleware(async ({ req }) => {
      const session = await getSession();
      if (!session) throw new Error("Não autorizado");

      if (!canCreateContent(session.role)) {
        throw new Error("Sem permissão para fazer upload");
      }

      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload completo para o usuário:", metadata.userId);
      console.log("URL do arquivo:", file.url);
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;