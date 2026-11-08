import { Router, Request, Response } from 'express';
import { db } from '../../config/database';
import { v4 as uuidv4 } from 'uuid';

export const licensesRouter = Router();

// 1. Get all tenant licenses & availability
licensesRouter.get('/', (req: Request, res: Response) => {
  try {
    const licenses = db.prepare('SELECT * FROM software_licenses ORDER BY created_at DESC').all();
    res.json({ licenses });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Validate current client license status
licensesRouter.get('/check/:tenantSlug', (req: Request, res: Response) => {
  const { tenantSlug } = req.params;
  try {
    const license: any = db.prepare('SELECT * FROM software_licenses WHERE tenant_slug = ?').get(tenantSlug);
    if (!license) {
      return res.status(404).json({
        available: false,
        error: 'No valid license found for this outlet/tenant.'
      });
    }

    const today = new Date().toISOString().split('T')[0];
    const isExpired = license.expires_at < today;
    const isActive = license.status === 'active' && !isExpired;

    res.json({
      available: isActive,
      isExpired,
      status: license.status,
      expiresAt: license.expires_at,
      outletName: license.outlet_name,
      planName: license.plan_name,
      allowedModules: license.allowed_modules ? license.allowed_modules.split(',') : []
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Create or update tenant software license
licensesRouter.post('/', (req: Request, res: Response) => {
  const {
    id,
    tenant_slug,
    outlet_name,
    status = 'active',
    plan_name = 'Standard Unit',
    expires_at,
    max_terminals = 5,
    allowed_modules = 'pos,orders,wallet,menu,inventory,reports,settings,digital_menu',
    admin_notes = ''
  } = req.body;

  if (!tenant_slug || !outlet_name || !expires_at) {
    return res.status(400).json({ error: 'tenant_slug, outlet_name, and expires_at are required.' });
  }

  try {
    const existing: any = db.prepare('SELECT * FROM software_licenses WHERE tenant_slug = ?').get(tenant_slug);

    if (existing) {
      db.prepare(`
        UPDATE software_licenses SET
          outlet_name = ?,
          status = ?,
          plan_name = ?,
          expires_at = ?,
          max_terminals = ?,
          allowed_modules = ?,
          admin_notes = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE tenant_slug = ?
      `).run(
        outlet_name,
        status,
        plan_name,
        expires_at,
        Number(max_terminals),
        allowed_modules,
        admin_notes,
        tenant_slug
      );
    } else {
      const licId = id || `lic-${uuidv4().slice(0, 8)}`;
      db.prepare(`
        INSERT INTO software_licenses (
          id, tenant_slug, outlet_name, status, plan_name, expires_at, max_terminals, allowed_modules, admin_notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        licId,
        tenant_slug,
        outlet_name,
        status,
        plan_name,
        expires_at,
        Number(max_terminals),
        allowed_modules,
        admin_notes
      );
    }

    const updated = db.prepare('SELECT * FROM software_licenses WHERE tenant_slug = ?').get(tenant_slug);
    res.json({ success: true, license: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Quick status toggle (active / suspended)
licensesRouter.patch('/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status || !['active', 'suspended', 'expired'].includes(status)) {
    return res.status(400).json({ error: 'Valid status is required (active, suspended, expired).' });
  }

  try {
    db.prepare('UPDATE software_licenses SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(status, id);
    const updated = db.prepare('SELECT * FROM software_licenses WHERE id = ?').get(id);
    res.json({ success: true, license: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
