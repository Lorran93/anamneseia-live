export interface AudioChunk {
  blob: Blob;
  base64: string;
  index: number;
  timestamp: number;
}

export type AudioRecorderCallback = (chunk: AudioChunk) => void;

export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private stream: MediaStream | null = null;
  private chunkIndex: number = 0;
  private onChunkReady: AudioRecorderCallback;
  private isRecording: boolean = false;

  constructor(onChunkReady: AudioRecorderCallback) {
    this.onChunkReady = onChunkReady;
  }

  async start(): Promise<void> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100,
        },
      });

      // Determine supported MIME type
      const mimeType = this.getSupportedMimeType();
      
      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType,
        audioBitsPerSecond: 128000,
      });

      this.chunkIndex = 0;
      this.isRecording = true;

      this.mediaRecorder.ondataavailable = async (event) => {
        if (event.data.size > 0 && this.isRecording) {
          const base64 = await this.blobToBase64(event.data);
          this.chunkIndex++;
          
          this.onChunkReady({
            blob: event.data,
            base64,
            index: this.chunkIndex,
            timestamp: Date.now(),
          });
        }
      };

      this.mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
      };

      // Start recording with 5-second timeslice
      this.mediaRecorder.start(5000);
      console.log('Recording started with 5s timeslice');
    } catch (error) {
      console.error('Error starting recording:', error);
      throw error;
    }
  }

  stop(): void {
    this.isRecording = false;
    
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
    
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
    
    this.mediaRecorder = null;
    console.log('Recording stopped');
  }

  getIsRecording(): boolean {
    return this.isRecording;
  }

  getCurrentChunkIndex(): number {
    return this.chunkIndex;
  }

  private getSupportedMimeType(): string {
    const mimeTypes = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/mp4',
    ];

    for (const mimeType of mimeTypes) {
      if (MediaRecorder.isTypeSupported(mimeType)) {
        console.log('Using MIME type:', mimeType);
        return mimeType;
      }
    }

    console.warn('No preferred MIME type supported, using default');
    return '';
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // Remove the data URL prefix (e.g., "data:audio/webm;base64,")
        const base64Data = base64String.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}

export function generateSessionId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
