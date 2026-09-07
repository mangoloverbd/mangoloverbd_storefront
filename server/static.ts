import express, { type Express, type Request, type Response, type NextFunction } from "express";
import path from "node:path";
import fs from 'node:fs';

export function serveStatic(app: Express) {
  const distPath = path.resolve(process.cwd(), "dist/public");
  
  // Check if the build directory exists
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  // Set cache control headers for static files
  const setCustomHeaders = (req: Request, res: Response, next: NextFunction) => {
    if (req.path === "/step" || req.path.startsWith("/step/")) {
      res.setHeader("X-Robots-Tag", "noindex, nofollow");
    }

    const mimeTypes: Record<string, string> = {
      '.js': 'application/javascript',
      '.mjs': 'application/javascript',
      '.jsx': 'application/javascript',
      '.ts': 'application/typescript',
      '.tsx': 'application/typescript',
      '.css': 'text/css',
      '.html': 'text/html',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.ico': 'image/x-icon',
      '.woff': 'font/woff',
      '.woff2': 'font/woff2',
      '.ttf': 'font/ttf',
      '.eot': 'font/eot',
      '.webp': 'image/webp',
      '.webm': 'video/webm',
      '.mp4': 'video/mp4',
      '.mp3': 'audio/mpeg',
      '.wav': 'audio/wav',
      '.ogg': 'audio/ogg',
      '.pdf': 'application/pdf',
      '.zip': 'application/zip',
      '.gz': 'application/gzip',
      '.webmanifest': 'application/manifest+json'
    };

    const ext = path.extname(req.path).toLowerCase();
    if (mimeTypes[ext]) {
      res.setHeader('Content-Type', mimeTypes[ext]);
    }

    // Cache static assets for 1 year (31536000 seconds)
    if (req.path.match(/\.(js|m?jsx?|ts|tsx|css|png|jpe?g|gif|svg|ico|woff2?|ttf|eot|webp|webm|mp4|mp3|wav|ogg|pdf|zip|gz|webmanifest)$/i)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    } else {
      // No cache for HTML files and other assets
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }

    next();
  };

  // Apply custom headers middleware
  app.use(setCustomHeaders);

  // Serve static files
  app.use(express.static(distPath));

  // Handle SPA fallback - serve index.html for any route
  app.get('/{*path}', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'), {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Content-Type': 'text/html; charset=utf-8'
      }
    });
  });
}
