import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import session from "express-session";
import { Resend } from "resend";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "strawberry-session-secret",
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 24 * 60 * 60 * 1000,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" as const : "lax" as const,
      },
      proxy: true,
    })
  );

  app.post("/api/admin/login", (req, res) => {
    const { password } = req.body;
    if (password === ADMIN_PASSWORD) {
      (req.session as any).isAdmin = true;
      res.json({ success: true });
    } else {
      res.status(401).json({ error: "Invalid password" });
    }
  });

  app.get("/api/admin/check", (req, res) => {
    if ((req.session as any).isAdmin) {
      res.json({ authenticated: true });
    } else {
      res.status(401).json({ error: "Not authenticated" });
    }
  });

  function requireAdmin(req: any, res: any, next: any) {
    if ((req.session as any)?.isAdmin) {
      next();
    } else {
      res.status(401).json({ error: "Unauthorized" });
    }
  }

  app.get("/api/forms", async (_req, res) => {
    const forms = await storage.getAllForms();
    res.json(forms);
  });

  app.get("/api/forms/popular", async (_req, res) => {
    const forms = await storage.getPopularForms();
    res.json(forms);
  });

  app.get("/api/forms/recent", async (_req, res) => {
    const forms = await storage.getRecentForms();
    res.json(forms);
  });

  app.get("/api/forms/search/:query", async (req, res) => {
    const forms = await storage.searchForms(req.params.query);
    res.json(forms);
  });

  app.get("/api/forms/by-slug/:slug", async (req, res) => {
    const form = await storage.getFormBySlug(req.params.slug);
    if (!form) {
      res.status(404).json({ error: "Form not found" });
      return;
    }
    res.json(form);
  });

  app.get("/api/forms/related/:slug", async (req, res) => {
    const form = await storage.getFormBySlug(req.params.slug);
    if (!form) {
      res.json([]);
      return;
    }
    const related = await storage.getRelatedForms(req.params.slug, form.category);
    const filtered = related.filter((r) => r.slug !== req.params.slug);
    res.json(filtered);
  });

  app.post("/api/forms/:slug/view", async (req, res) => {
    await storage.incrementViewCount(req.params.slug);
    res.json({ success: true });
  });

  app.post("/api/forms", requireAdmin, async (req, res) => {
    try {
      const form = await storage.createForm(req.body);
      res.json(form);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.put("/api/forms/:id", requireAdmin, async (req, res) => {
    try {
      const form = await storage.updateForm(parseInt(req.params.id), req.body);
      if (!form) {
        res.status(404).json({ error: "Form not found" });
        return;
      }
      res.json(form);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/forms/:id/visibility", requireAdmin, async (req, res) => {
    try {
      const { isVisible } = req.body;
      const form = await storage.updateForm(parseInt(req.params.id), { isVisible });
      if (!form) {
        res.status(404).json({ error: "Form not found" });
        return;
      }
      res.json(form);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/forms/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteForm(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/settings/:key", async (req, res) => {
    const setting = await storage.getSetting(req.params.key);
    if (!setting) {
      res.json(null);
      return;
    }
    res.json(setting);
  });

  app.put("/api/settings/:key", requireAdmin, async (req, res) => {
    const { value } = req.body;
    const setting = await storage.upsertSetting(req.params.key, value);
    res.json(setting);
  });

  const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.pdf', '.xlsx', '.xls', '.csv', '.hwp', '.hwpx', '.doc', '.docx', '.ppt', '.pptx', '.txt', '.rtf', '.odt', '.ods'];
  const MAX_FILE_SIZE = 10 * 1024 * 1024;

  app.post("/api/form-requests", async (req, res) => {
    try {
      const { title, content, fileName, fileData } = req.body;
      if (!title || !content) {
        res.status(400).json({ error: "제목과 내용을 입력해주세요." });
        return;
      }
      if (fileName) {
        const ext = '.' + fileName.split('.').pop()?.toLowerCase();
        if (!ALLOWED_EXTENSIONS.includes(ext)) {
          res.status(400).json({ error: "허용되지 않는 파일 형식입니다. 이미지, PDF, 엑셀, 한글 등의 파일만 첨부할 수 있습니다." });
          return;
        }
      }
      if (fileData && fileData.length > MAX_FILE_SIZE * 1.37) {
        res.status(400).json({ error: "파일 크기가 10MB를 초과합니다." });
        return;
      }
      const request = await storage.createFormRequest({ title, content, fileName: fileName || null, fileData: fileData || null });

      if (process.env.RESEND_API_KEY) {
        try {
          const resend = new Resend(process.env.RESEND_API_KEY);
          const emailOptions: any = {
            from: "딸기폼 알림 <onboarding@resend.dev>",
            to: "mcsoon4779@gmail.com",
            subject: `[딸기폼] 새 양식 신청: ${title}`,
            html: `
              <h2>새로운 양식 신청이 접수되었습니다</h2>
              <p><strong>제목:</strong> ${title}</p>
              <p><strong>내용:</strong></p>
              <p style="white-space:pre-wrap">${content}</p>
              ${fileName ? `<p><strong>첨부파일:</strong> ${fileName}</p>` : ""}
              <hr />
              <p style="color:#888;font-size:12px">딸기폼 관리자 페이지에서 확인하세요.</p>
            `,
          };

          if (fileData && fileName) {
            const base64Data = fileData.split(",")[1] || fileData;
            emailOptions.attachments = [
              {
                filename: fileName,
                content: Buffer.from(base64Data, "base64"),
              },
            ];
          }

          await resend.emails.send(emailOptions);
        } catch (emailError) {
          console.error("이메일 발송 실패:", emailError);
        }
      }

      res.json({ success: true, id: request.id });
    } catch (error: any) {
      res.status(500).json({ error: "신청 중 오류가 발생했습니다." });
    }
  });

  app.get("/api/form-requests", requireAdmin, async (_req, res) => {
    const requests = await storage.getAllFormRequests();
    res.json(requests);
  });

  app.delete("/api/form-requests/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteFormRequest(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/sitemap.xml", async (_req, res) => {
    const forms = await storage.getAllForms();
    const baseUrl = process.env.SITE_URL || "https://ttgform.kr";

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    xml += `  <url><loc>${baseUrl}/</loc><changefreq>daily</changefreq><priority>1.0</priority></url>\n`;
    xml += `  <url><loc>${baseUrl}/forms</loc><changefreq>daily</changefreq><priority>0.8</priority></url>\n`;

    for (const form of forms) {
      const lastmod = form.updatedAt ? new Date(form.updatedAt).toISOString().split("T")[0] : "";
      xml += `  <url><loc>${baseUrl}/forms/${form.slug}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ""}<changefreq>weekly</changefreq><priority>0.9</priority></url>\n`;
    }

    xml += `</urlset>`;
    res.set("Content-Type", "application/xml");
    res.send(xml);
  });

  app.get("/robots.txt", (_req, res) => {
    const baseUrl = process.env.SITE_URL || "https://ttgform.kr";
    const txt = `User-agent: *\nAllow: /\n\nSitemap: ${baseUrl}/sitemap.xml\n`;
    res.set("Content-Type", "text/plain");
    res.send(txt);
  });

  return httpServer;
}
