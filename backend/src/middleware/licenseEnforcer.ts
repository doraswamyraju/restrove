import { Request, Response, NextFunction } from 'express';
import { db } from '../config/database';

export function enforceSoftwareLicense(req: Request, res: Response, next: NextFunction) {
  // Always permit master admin, health check, and license validation endpoints
  if (
    req.path.startsWith('/licenses') ||
    req.path === '/health' ||
    req.baseUrl === '/api/licenses'
  ) {
    return next();
  }

  // Get vendor slug from request header, query, or default to Chai Wala Original
  const tenantSlug = (req.headers['x-tenant-slug'] as string) || (req.query.tenant as string) || 'chaiwala-original';

  try {
    const license: any = db.prepare('SELECT * FROM software_licenses WHERE tenant_slug = ?').get(tenantSlug);

    if (!license) {
      return res.status(403).json({
        licenseBlocked: true,
        error: `Restrove license not found for vendor: '${tenantSlug}'. Access suspended.`
      });
    }

    // Check manual administrative suspension
    if (license.status === 'suspended') {
      return res.status(403).json({
        licenseBlocked: true,
        reason: 'suspended',
        error: `Software access for '${license.outlet_name}' has been suspended by Restrove Administration. Please contact support.`
      });
    }

    // Check automatic date expiration
    const today = new Date().toISOString().split('T')[0];
    if (license.expires_at < today || license.status === 'expired') {
      // Auto-update status to expired in db
      if (license.status !== 'expired') {
        db.prepare("UPDATE software_licenses SET status = 'expired', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(license.id);
      }

      return res.status(403).json({
        licenseBlocked: true,
        reason: 'expired',
        expiresAt: license.expires_at,
        error: `Software license for '${license.outlet_name}' expired on ${license.expires_at}. Access disabled.`
      });
    }

    // License is active and within valid date
    (req as any).tenantLicense = license;
    next();
  } catch (err: any) {
    next();
  }
}
