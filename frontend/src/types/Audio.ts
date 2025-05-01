export interface Audio {
    _id: string;
    text: string;
    generatedScript: string;
    audioUrl: string;
    createdAt: Date;
}

export type CreateAudioInput = Omit<Audio, '_id' | 'createdAt'>; 