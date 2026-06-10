import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

const ALLOWED_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/svg+xml',
  'image/gif',
];

function getExtension(file) {
  const contentType = file.type;
  if (contentType && contentType.includes('/')) {
    return contentType.split('/')[1] === 'svg+xml' ? 'svg' : contentType.split('/')[1];
  }
  const match = file.name?.match(/\.([a-zA-Z0-9]+)$/);
  return match ? match[1] : 'png';
}

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('logo');

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ success: false, message: 'Logo file is required.' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ success: false, message: 'Unsupported file type.' }, { status: 400 });
    }

    const publicDir = path.join(process.cwd(), 'public', 'logo');
    await fs.promises.mkdir(publicDir, { recursive: true });

    const extension = getExtension(file);
    const filename = `logo-${Date.now()}.${extension}`;
    const filePath = path.join(publicDir, filename);
    const buffer = Buffer.from(await file.arrayBuffer());

    await fs.promises.writeFile(filePath, buffer);

    return NextResponse.json({ success: true, url: `/logo/${filename}` }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
