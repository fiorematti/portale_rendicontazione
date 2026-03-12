/** Informazioni su un allegato caricato */
export interface AttachmentInfo {
  fileName: string;
  previewUrl: string;
  previewType: 'image' | 'pdf';
}
