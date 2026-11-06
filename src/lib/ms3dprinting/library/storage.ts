export const PROJECT_FILE_EXTENSIONS = [".stl", ".3mf", ".obj", ".step", ".stp"] as const;
export const MAX_PROJECT_FILE_BYTES = 250 * 1024 * 1024;
const DATABASE_NAME = "ms3dprinting-library";
const STORE_NAME = "project-files";
const DATABASE_VERSION = 1;

export type ProjectFileRecord = {
  id: string;
  name: string;
  extension: string;
  mimeType: string;
  sizeBytes: number;
  lastModified: number;
  importedAt: string;
  blob: Blob;
};

export function getSupportedProjectExtension(fileName: string): string | null {
  const normalized = fileName.toLowerCase();
  return PROJECT_FILE_EXTENSIONS.find((extension) => normalized.endsWith(extension)) ?? null;
}

export function validateProjectFile(file: Pick<File, "name" | "size">): string | null {
  if (!getSupportedProjectExtension(file.name)) {
    return "Formato não suportado. Importe STL, 3MF, OBJ, STEP ou STP.";
  }
  if (file.size <= 0) return "O arquivo está vazio.";
  if (file.size > MAX_PROJECT_FILE_BYTES) return "O arquivo excede o limite local de 250 MB.";
  return null;
}

function openDatabase(): Promise<IDBDatabase> {
  if (typeof indexedDB === "undefined") {
    return Promise.reject(new Error("Armazenamento local não está disponível neste ambiente."));
  }
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Falha ao abrir a biblioteca local."));
  });
}

export async function saveProjectFile(file: File): Promise<ProjectFileRecord> {
  const validationError = validateProjectFile(file);
  if (validationError) throw new Error(validationError);
  const extension = getSupportedProjectExtension(file.name);
  if (!extension) throw new Error("Formato de arquivo inválido.");

  const record: ProjectFileRecord = {
    id: crypto.randomUUID(),
    name: file.name,
    extension,
    mimeType: file.type || "application/octet-stream",
    sizeBytes: file.size,
    lastModified: file.lastModified,
    importedAt: new Date().toISOString(),
    blob: file,
  };
  const database = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readwrite");
    transaction.objectStore(STORE_NAME).put(record);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error("Falha ao salvar o arquivo."));
    transaction.onabort = () => reject(transaction.error ?? new Error("Importação cancelada."));
  });
  database.close();
  return record;
}

export async function listProjectFiles(): Promise<ProjectFileRecord[]> {
  const database = await openDatabase();
  const records = await new Promise<ProjectFileRecord[]>((resolve, reject) => {
    const request = database.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).getAll();
    request.onsuccess = () => resolve(request.result as ProjectFileRecord[]);
    request.onerror = () => reject(request.error ?? new Error("Falha ao carregar a biblioteca."));
  });
  database.close();
  return records.sort((a, b) => b.importedAt.localeCompare(a.importedAt));
}

export async function deleteProjectFile(id: string): Promise<void> {
  const database = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readwrite");
    transaction.objectStore(STORE_NAME).delete(id);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error("Falha ao excluir o arquivo."));
  });
  database.close();
}
