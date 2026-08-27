const DB_NAME = 'rakshak-files-v1'
const STORE = 'files'

interface StoredFile {
  name: string
  type: string
  lastModified: number
  buffer: ArrayBuffer
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1)
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE)) {
        request.result.createObjectStore(STORE)
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

function toStored(file: File): Promise<StoredFile> {
  return file.arrayBuffer().then((buffer) => ({
    name: file.name,
    type: file.type,
    lastModified: file.lastModified,
    buffer,
  }))
}

function fromStored(record: StoredFile): File {
  return new File([record.buffer], record.name, {
    type: record.type,
    lastModified: record.lastModified,
  })
}

export async function putFiles(key: string, files: File[]): Promise<void> {
  const records = await Promise.all(files.map(toStored))
  const db = await openDb()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).put(records, key)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function getFiles(key: string): Promise<File[]> {
  const db = await openDb()
  const records = await new Promise<StoredFile[] | undefined>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly')
    const request = tx.objectStore(STORE).get(key)
    request.onsuccess = () => resolve(request.result as StoredFile[] | undefined)
    request.onerror = () => reject(request.error)
  })
  return records?.map(fromStored) ?? []
}

export async function clearFiles(key: string): Promise<void> {
  const db = await openDb()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).delete(key)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}
