// Vercel serverless entry for the NestJS API.
// Served at /api (Root Directory = apps/api). vercel.json rewrites all paths
// here; Nest's global prefix "api" then routes /api/health etc.
// Local dev still uses src/main.ts (`bun run api`).
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import express, { type Request, type Response } from 'express';
import { AppModule } from '../src/app.module';

const server = express();
let ready: Promise<void> | null = null;

async function bootstrap() {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));
  const origins = (process.env.CORS_ORIGINS ?? '').split(',').filter(Boolean);
  app.enableCors({ origin: origins.length ? origins : true, credentials: true });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.setGlobalPrefix('api');
  await app.init();
}

export default async function handler(req: Request, res: Response) {
  if (!ready) ready = bootstrap();
  await ready;
  server(req, res);
}
