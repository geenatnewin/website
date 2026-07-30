import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { randomUUID } from 'crypto'

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
})

const BUCKET = process.env.R2_BUCKET_NAME

// Receipts live under receipts/ in the same bucket as the public site videos, but are
// never uploaded with public access — only reachable via a short-lived signed URL from
// getReceiptUrl(), so they stay behind the ledger's password gate.
export async function uploadReceipt(bytes, contentType) {
  const ext = contentType.split('/')[1] || 'jpg'
  const key = `receipts/${Date.now()}-${randomUUID()}.${ext}`
  await s3.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: bytes,
    ContentType: contentType,
  }))
  return key
}

export async function getReceiptUrl(key) {
  return getSignedUrl(s3, new GetObjectCommand({ Bucket: BUCKET, Key: key }), { expiresIn: 3600 })
}
