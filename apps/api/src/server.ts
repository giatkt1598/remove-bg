import 'dotenv/config';
import express, { type Request } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import multer from 'multer';
import axios from 'axios';
import sharp from 'sharp';
import { MAX_FILE_SIZE, MAX_IMAGE_SIDE } from '@remove-bg/shared';

const app = express();
const port = Number(process.env.PORT ?? 3001);
const processorUrl = process.env.PROCESSOR_URL ?? 'http://processor:5000';
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: MAX_FILE_SIZE, files: 1 } });

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: process.env.WEB_ORIGIN?.split(',') ?? true }));
app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'api' }));

app.post('/api/v1/remove-background', upload.single('image'), async (req: Request, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Please upload an image.', code: 'MISSING_IMAGE' });
    const metadata = await sharp(req.file.buffer).metadata();
    if (!['jpeg', 'png', 'webp'].includes(metadata.format ?? '')) {
      return res.status(415).json({ error: 'Only JPG, PNG and WebP images are supported.', code: 'UNSUPPORTED_TYPE' });
    }
    if (!metadata.width || !metadata.height || metadata.width > MAX_IMAGE_SIDE || metadata.height > MAX_IMAGE_SIDE) {
      return res.status(422).json({ error: `Images must be no larger than ${MAX_IMAGE_SIDE}×${MAX_IMAGE_SIDE}px.`, code: 'IMAGE_TOO_LARGE' });
    }
    const response = await axios.post(`${processorUrl}/remove`, req.file.buffer, {
      headers: { 'content-type': `image/${metadata.format}` }, responseType: 'stream', timeout: 120_000,
      maxContentLength: MAX_FILE_SIZE * 2, maxBodyLength: MAX_FILE_SIZE,
    });
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'no-store');
    response.data.pipe(res);
  } catch (error) {
    const status = axios.isAxiosError(error) && error.response?.status === 413 ? 413 : 502;
    res.status(status).json({ error: 'Background removal failed. Please try again.', code: 'PROCESSING_FAILED' });
  }
});

app.use((error: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (error?.code === 'LIMIT_FILE_SIZE') return res.status(413).json({ error: 'Image must be 15 MB or smaller.', code: 'FILE_TOO_LARGE' });
  res.status(500).json({ error: 'Unexpected server error.', code: 'INTERNAL_ERROR' });
});

app.listen(port, () => console.log(`API listening on :${port}`));
export { app };
