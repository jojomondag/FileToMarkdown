// Type definitions for FileToMarkdown server API
// Server routes, middleware, and API response types

import { Request, Response, NextFunction } from 'express';
import { Multer } from 'multer';

// API Response types
export interface ApiResponse<T = any> {
  status: number;
  data?: T;
  error?: string;
  message?: string;
}

export interface FileTypesResponse {
  fileTypes: string[];
  descriptions: Record<string, string>;
  status: number;
}

export interface ConvertResponse {
  markdown: string;
  status: number;
}

export interface RenderResponse {
  html: string;
  status: number;
  message?: string;
}

export interface HealthResponse {
  status: 'ok' | 'error';
  uptime?: number;
  timestamp?: string;
}

// Request types
export interface ConvertRequest extends Request {
  file?: Express.Multer.File;
}

export interface RenderRequest extends Request {
  body: {
    markdown: string;
    options?: {
      theme?: string;
      [key: string]: any;
    };
  };
}

// Route handler types
export type RouteHandler<TReq = Request, TRes = Response> = (
  req: TReq,
  res: TRes,
  next?: NextFunction
) => void | Promise<void>;

export type ConvertHandler = RouteHandler<ConvertRequest, Response>;
export type RenderHandler = RouteHandler<RenderRequest, Response>;
export type FileTypesHandler = RouteHandler<Request, Response>;
export type HealthHandler = RouteHandler<Request, Response>;

// Server setup types
export interface ServerOptions {
  port?: number;
  host?: string;
  cors?: boolean;
  uploadDir?: string;
  maxFileSize?: number;
}

export interface RouteRegistration {
  registerRoutes(
    app: any, 
    api: any, 
    upload: Multer
  ): void;
}

// Server setup and creation types
export interface CreateServerOptions {
  port?: number;
  staticPath?: string;
  cors?: any;
  allowedOrigins?: string | string[];
  maxFileSize?: number;
}

export interface ServerInstance {
  app: any;
  start(): Promise<any>;
}

export declare function createServer(options?: CreateServerOptions): ServerInstance;

// Express middleware extensions
declare global {
  namespace Express {
    interface Request {
      filetomarkdown?: {
        originalName?: string;
        convertedMarkdown?: string;
      };
    }
  }
} 