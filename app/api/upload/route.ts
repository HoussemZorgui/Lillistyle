import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import { existsSync, mkdirSync } from 'fs';

export async function POST(request: Request) {
    try {
        const data = await request.formData();
        const file: File | null = data.get('file') as unknown as File;

        if (!file) {
            return NextResponse.json({ success: false, message: 'No file uploaded' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Ensure uploads directory exists
        const uploadDir = path.join(process.cwd(), 'public/uploads');
        if (!existsSync(uploadDir)) {
            mkdirSync(uploadDir, { recursive: true });
        }

        // Create unique filename
        const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '-')}`;
        const filepath = path.join(uploadDir, filename);

        await writeFile(filepath, buffer);

        return NextResponse.json({ success: true, url: `/uploads/${filename}` });
    } catch (error) {
        console.error('Error saving file:', error);
        return NextResponse.json({ success: false, message: 'Error saving file' }, { status: 500 });
    }
}
