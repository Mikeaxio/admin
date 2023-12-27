import { Upload } from '@aws-sdk/lib-storage';
import { S3Client } from '@aws-sdk/client-s3';
import { NextResponse } from 'next/server';

const s3Client = new S3Client({
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export async function POST(req) {
  const formData = await req.formData();
  const Bucket = formData.get('bucket');
  const file = formData.get('file');
  const fileExtension = file.name.substring(file.name.lastIndexOf('.'));
  const id = formData.get('name');
  const filename = `${id}${fileExtension}`;

  const key = `receipts/${filename}`;
  const isPdf = file.name.toLowerCase().endsWith('.pdf');

  const upload = new Upload({
    client: s3Client,
    params: {
      Bucket,
      Key: key,
      Body: file.stream(),
    },
  });

  try {
    await upload.done();
    const fileUrl = `https://${Bucket}.s3.amazonaws.com/receipts/${encodeURIComponent(`${id}${fileExtension}`)}`;
    const pdfUrl = `https://${Bucket}.s3.amazonaws.com/temp-pdfs/${encodeURIComponent(`${id}.pdf`)}`;
    const tempPdfUrl = isPdf ? fileUrl : pdfUrl;

    return NextResponse.json({ fileUrl, tempPdfUrl }, { status: 200 });
  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
