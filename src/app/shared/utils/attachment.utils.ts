import { AttachmentInfo } from '../models/attachment.model';

const PDF_JS_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js';
const PDF_JS_WORKER = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

/**
 * Stato condiviso per la gestione degli allegati.
 * Utilizzato da NoteSpese e RegistroNote per evitare duplicazione.
 */
export interface AttachmentState {
  mostraAttachmentPopup: boolean;
  attachmentPreviewUrl: string | null;
  attachmentPreviewType: 'image' | 'pdf' | null;
  attachmentFileName: string;
  currentAttachmentTarget: { tab: number; field: string } | null;
}

/** Crea lo stato iniziale per la gestione degli allegati */
export function createAttachmentState(): AttachmentState {
  return {
    mostraAttachmentPopup: false,
    attachmentPreviewUrl: null,
    attachmentPreviewType: null,
    attachmentFileName: '',
    currentAttachmentTarget: null,
  };
}

/** Revoca una object URL se è di tipo blob: */
export function revokeIfObjectUrl(url?: string | null): void {
  if (!url || !url.startsWith('blob:')) return;
  try { URL.revokeObjectURL(url); } catch { /* ignore */ }
}

/** Garantisce che il container attachments esista sul dettaglio */
export function ensureAttachmentContainer<T extends { attachments?: Record<string, AttachmentInfo> }>(
  dettagli: T[],
  tabIndex: number
): Record<string, AttachmentInfo> {
  const dett = dettagli[tabIndex];
  if (!dett) return {};
  if (!dett.attachments) dett.attachments = {};
  return dett.attachments;
}

/** Imposta un allegato nel container, revocando eventuali URL precedenti */
export function setAttachment<T extends { attachments?: Record<string, AttachmentInfo> }>(
  dettagli: T[],
  tabIndex: number,
  field: string,
  info: AttachmentInfo
): void {
  const container = ensureAttachmentContainer(dettagli, tabIndex);
  const existing = container[field];
  if (existing && existing.previewUrl !== info.previewUrl) {
    revokeIfObjectUrl(existing.previewUrl);
  }
  container[field] = info;
}

/** Legge un allegato dal container */
export function getAttachment<T extends { attachments?: Record<string, AttachmentInfo> }>(
  dettagli: T[],
  tabIndex: number,
  field: string
): AttachmentInfo | null {
  const dett = dettagli[tabIndex];
  return dett?.attachments?.[field] || null;
}

/** Rimuove un allegato dal container e revoca l'URL */
export function removeAttachmentFromContainer<T extends { attachments?: Record<string, AttachmentInfo> }>(
  dettagli: T[],
  tabIndex: number,
  field: string
): AttachmentInfo | null {
  const dett = dettagli[tabIndex];
  if (!dett?.attachments?.[field]) return null;
  const att = dett.attachments[field];
  revokeIfObjectUrl(att.previewUrl);
  delete dett.attachments[field];
  return att;
}

/** Pulisce tutti gli allegati di un singolo dettaglio */
export function cleanupAttachmentForDettaglio<T extends { attachments?: Record<string, AttachmentInfo> }>(
  dett: T | undefined
): void {
  if (!dett?.attachments) return;
  Object.values(dett.attachments).forEach(att => revokeIfObjectUrl(att.previewUrl));
  dett.attachments = {};
}

/** Pulisce gli allegati di tutti i dettagli */
export function cleanupAllAttachments<T extends { attachments?: Record<string, AttachmentInfo> }>(
  dettagli: T[]
): void {
  dettagli.forEach(d => cleanupAttachmentForDettaglio(d));
}

/** Apre la popup del file input per un campo specifico */
export function openFileUploader(
  state: AttachmentState,
  tabIndex: number,
  field: string,
  inputElementId: string
): void {
  state.currentAttachmentTarget = { tab: tabIndex, field };
  const input = document.getElementById(inputElementId) as HTMLInputElement | null;
  if (input) {
    input.value = '';
    input.click();
  }
}

/** Popola lo stato per mostrare l'anteprima dell'allegato */
export function showAttachmentPreview(state: AttachmentState, info: AttachmentInfo): void {
  state.attachmentFileName = info.fileName;
  state.attachmentPreviewUrl = info.previewUrl;
  state.attachmentPreviewType = info.previewType;
  state.mostraAttachmentPopup = true;
}

/** Chiude la popup dell'anteprima allegato */
export function closeAttachmentPreview(state: AttachmentState, clearTarget: boolean = false): void {
  state.mostraAttachmentPopup = false;
  state.attachmentPreviewUrl = null;
  state.attachmentPreviewType = null;
  state.attachmentFileName = '';
  if (clearTarget) state.currentAttachmentTarget = null;
}

/**
 * Gestisce la selezione del file e genera l'anteprima.
 * Utilizzabile sia da NoteSpese che da RegistroNote.
 */
export function handleFileSelected<T extends { attachments?: Record<string, AttachmentInfo> }>(
  event: Event,
  state: AttachmentState,
  dettagli: T[],
  onComplete?: () => void
): void {
  const input = event.target as HTMLInputElement;
  const file = input?.files && input.files[0];
  const target = state.currentAttachmentTarget;
  if (!file || !target) return;
  const { tab, field } = target;
  if (!dettagli[tab]) return;

  const finalizeAttachment = (previewUrl: string, previewType: 'image' | 'pdf') => {
    const info: AttachmentInfo = { fileName: file.name, previewUrl, previewType };
    setAttachment(dettagli, tab, field, info);
    showAttachmentPreview(state, info);
    onComplete?.();
  };

  const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
  if (isPdf) {
    const blobUrl = URL.createObjectURL(file);
    renderPdfAsImage(blobUrl)
      .then((dataUrl) => {
        if (dataUrl) {
          finalizeAttachment(dataUrl, 'image');
          revokeIfObjectUrl(blobUrl);
        } else {
          finalizeAttachment(blobUrl, 'pdf');
        }
      })
      .catch(() => finalizeAttachment(blobUrl, 'pdf'));
  } else if (file.type.startsWith('image/')) {
    finalizeAttachment(URL.createObjectURL(file), 'image');
  } else {
    finalizeAttachment(URL.createObjectURL(file), 'image');
  }
}

/**
 * Renderizza la prima pagina di un PDF come immagine (data URL) usando pdf.js.
 * Carica la libreria pdf.js dal CDN se non ancora disponibile.
 */
export function renderPdfAsImage(pdfUrl: string): Promise<string | null> {
  return new Promise((resolve) => {
    const finishRender = () => {
      const pdfjsLib = (window as any).pdfjsLib;
      if (!pdfjsLib || !pdfjsLib.getDocument) {
        resolve(null);
        return;
      }
      try {
        pdfjsLib.GlobalWorkerOptions.workerSrc = PDF_JS_WORKER;
        pdfjsLib.getDocument(pdfUrl).promise.then((pdf: any) => {
          pdf.getPage(1).then((page: any) => {
            const viewport = page.getViewport({ scale: 1.5 });
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            page.render({ canvasContext: ctx, viewport }).promise.then(() => {
              try {
                resolve(canvas.toDataURL('image/png'));
              } catch {
                resolve(null);
              }
            }).catch(() => resolve(null));
          }).catch(() => resolve(null));
        }).catch(() => resolve(null));
      } catch {
        resolve(null);
      }
    };

    if (!(window as any).pdfjsLib) {
      const script = document.createElement('script');
      script.src = PDF_JS_CDN;
      script.onload = () => finishRender();
      script.onerror = () => resolve(null);
      document.head.appendChild(script);
    } else {
      finishRender();
    }
  });
}
