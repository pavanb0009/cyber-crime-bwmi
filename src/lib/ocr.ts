// Client-side text extraction for the Notice Verifier.
// Digital PDFs use the embedded text layer. Scanned PDFs and images fall back
// to Tesseract OCR in the browser. The caller never has to know which path ran.

import * as pdfjsLib from 'pdfjs-dist'
import PdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import { createWorker, type Worker } from 'tesseract.js'

pdfjsLib.GlobalWorkerOptions.workerSrc = PdfWorker

const OCR_LANGS = 'eng+hin'
const TEXT_LAYER_MIN_CHARS = 40
const OCR_RENDER_SCALE = 2
const MAX_PAGES = 12

export interface ExtractionResult {
  text: string
  method: 'pdf-text' | 'pdf-ocr' | 'mixed' | 'image-ocr' | 'plain-text'
  pages: number
}

export type ExtractionProgress = (stage: string, ratio?: number) => void

let workerPromise: Promise<Worker> | null = null

async function getOcrWorker(onProgress?: ExtractionProgress): Promise<Worker> {
  if (!workerPromise) {
    onProgress?.('Preparing on-device reader')
    workerPromise = createWorker(OCR_LANGS, undefined, {
      logger: (m) => {
        if (m.status === 'recognizing text' && onProgress) {
          onProgress('Reading printed text', m.progress)
        }
      },
    }).catch((error: unknown) => {
      workerPromise = null
      throw error
    })
  }
  return workerPromise
}

export async function disposeOcr(): Promise<void> {
  if (!workerPromise) return
  try {
    const worker = await workerPromise
    await worker.terminate()
  } catch {
    // Worker may already have failed to start.
  } finally {
    workerPromise = null
  }
}

function layerTextFromPage(items: Array<{ str?: string } | Record<string, unknown>>): string {
  return items
    .map((item) => ('str' in item && typeof item.str === 'string' ? item.str : ''))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()
}

async function renderPageToCanvas(page: pdfjsLib.PDFPageProxy): Promise<HTMLCanvasElement> {
  const viewport = page.getViewport({ scale: OCR_RENDER_SCALE })
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.ceil(viewport.width))
  canvas.height = Math.max(1, Math.ceil(viewport.height))
  const context = canvas.getContext('2d', { willReadFrequently: true })
  if (!context) throw new Error('This browser cannot render the PDF page.')
  await page.render({ canvas, canvasContext: context, viewport }).promise
  return canvas
}

async function ocrCanvas(canvas: HTMLCanvasElement, onProgress?: ExtractionProgress): Promise<string> {
  const worker = await getOcrWorker(onProgress)
  const { data } = await worker.recognize(canvas)
  return (data.text || '').replace(/\s+/g, ' ').trim()
}

async function extractFromPdf(file: File, onProgress?: ExtractionProgress): Promise<ExtractionResult> {
  const data = new Uint8Array(await file.arrayBuffer())
  if (data.byteLength < 5 || String.fromCharCode(...data.slice(0, 4)) !== '%PDF') {
    throw new Error('This file is not a readable PDF.')
  }

  const loadingTask = pdfjsLib.getDocument({ data, disableFontFace: false })
  const pdf = await loadingTask.promise
  const numPages = Math.min(pdf.numPages, MAX_PAGES)
  const pageTexts: string[] = []
  let textPages = 0
  let ocrPages = 0

  try {
    for (let pageNumber = 1; pageNumber <= numPages; pageNumber++) {
      onProgress?.(`Reading page ${pageNumber} of ${numPages}`, (pageNumber - 1) / numPages)
      const page = await pdf.getPage(pageNumber)

      let layerText = ''
      try {
        const content = await page.getTextContent()
        layerText = layerTextFromPage(content.items)
      } catch {
        layerText = ''
      }

      if (layerText.length >= TEXT_LAYER_MIN_CHARS) {
        pageTexts.push(layerText)
        textPages += 1
        continue
      }

      onProgress?.(`Scanning page ${pageNumber} of ${numPages}`)
      try {
        const canvas = await renderPageToCanvas(page)
        const ocrText = await ocrCanvas(canvas, onProgress)
        pageTexts.push(ocrText || layerText)
        if (ocrText) ocrPages += 1
        else if (layerText) textPages += 1
      } catch (error) {
        if (layerText) {
          pageTexts.push(layerText)
          textPages += 1
        } else {
          throw error
        }
      }
    }
  } finally {
    await loadingTask.destroy()
  }

  const text = pageTexts.join('\n\n').trim()
  if (!text) {
    throw new Error('No readable text was found in this PDF. Try a clearer scan.')
  }

  const method = textPages && ocrPages ? 'mixed' : ocrPages ? 'pdf-ocr' : 'pdf-text'
  return { text, method, pages: numPages }
}

async function extractFromImage(file: File, onProgress?: ExtractionProgress): Promise<ExtractionResult> {
  onProgress?.('Scanning image')
  const worker = await getOcrWorker(onProgress)
  const { data } = await worker.recognize(file)
  const text = (data.text || '').trim()
  if (!text) throw new Error('No readable text was found in this image. Try a clearer photo.')
  return { text, method: 'image-ocr', pages: 1 }
}

export async function extractTextFromFile(
  file: File,
  onProgress?: ExtractionProgress,
): Promise<ExtractionResult> {
  const name = file.name.toLowerCase()
  if (name.endsWith('.txt') || file.type === 'text/plain') {
    const text = (await file.text()).trim()
    if (!text) throw new Error('The text file is empty.')
    return { text, method: 'plain-text', pages: 1 }
  }
  if (name.endsWith('.pdf') || file.type === 'application/pdf') {
    return extractFromPdf(file, onProgress)
  }
  if (/\.(png|jpe?g|webp|bmp|gif|tiff?)$/.test(name) || file.type.startsWith('image/')) {
    return extractFromImage(file, onProgress)
  }
  throw new Error('Use a PDF, PNG, JPG, WEBP or TXT file.')
}
