import { eq, desc, ilike, or, and, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import {
  formTemplates,
  siteSettings,
  formRequests,
  type FormTemplate,
  type InsertFormTemplate,
  type SiteSetting,
  type InsertSiteSetting,
  type FormRequest,
  type InsertFormRequest,
} from "@shared/schema";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool);

export interface IStorage {
  getAllForms(): Promise<FormTemplate[]>;
  getPopularForms(): Promise<FormTemplate[]>;
  getRecentForms(): Promise<FormTemplate[]>;
  getFormBySlug(slug: string): Promise<FormTemplate | undefined>;
  getFormById(id: number): Promise<FormTemplate | undefined>;
  searchForms(query: string): Promise<FormTemplate[]>;
  getRelatedForms(slug: string, category: string | null): Promise<FormTemplate[]>;
  createForm(form: InsertFormTemplate): Promise<FormTemplate>;
  updateForm(id: number, form: Partial<InsertFormTemplate>): Promise<FormTemplate | undefined>;
  deleteForm(id: number): Promise<void>;
  incrementViewCount(slug: string): Promise<void>;
  getSetting(key: string): Promise<SiteSetting | undefined>;
  upsertSetting(key: string, value: string): Promise<SiteSetting>;
  createFormRequest(request: InsertFormRequest): Promise<FormRequest>;
  getAllFormRequests(): Promise<FormRequest[]>;
  deleteFormRequest(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getAllForms(): Promise<FormTemplate[]> {
    return db.select().from(formTemplates).orderBy(desc(formTemplates.createdAt));
  }

  async getPopularForms(): Promise<FormTemplate[]> {
    return db
      .select()
      .from(formTemplates)
      .where(and(eq(formTemplates.isPopular, true), eq(formTemplates.isVisible, true)))
      .orderBy(desc(formTemplates.viewCount))
      .limit(6);
  }

  async getRecentForms(): Promise<FormTemplate[]> {
    return db
      .select()
      .from(formTemplates)
      .where(eq(formTemplates.isVisible, true))
      .orderBy(desc(formTemplates.createdAt))
      .limit(6);
  }

  async getFormBySlug(slug: string): Promise<FormTemplate | undefined> {
    const [form] = await db
      .select()
      .from(formTemplates)
      .where(eq(formTemplates.slug, slug))
      .limit(1);
    return form;
  }

  async getFormById(id: number): Promise<FormTemplate | undefined> {
    const [form] = await db
      .select()
      .from(formTemplates)
      .where(eq(formTemplates.id, id))
      .limit(1);
    return form;
  }

  async searchForms(query: string): Promise<FormTemplate[]> {
    const pattern = `%${query}%`;
    return db
      .select()
      .from(formTemplates)
      .where(
        and(
          eq(formTemplates.isVisible, true),
          or(
            ilike(formTemplates.title, pattern),
            ilike(formTemplates.metaDescription, pattern),
            ilike(formTemplates.category, pattern)
          )
        )
      )
      .orderBy(desc(formTemplates.viewCount));
  }

  async getRelatedForms(slug: string, category: string | null): Promise<FormTemplate[]> {
    if (!category) return [];
    return db
      .select()
      .from(formTemplates)
      .where(and(eq(formTemplates.category, category), eq(formTemplates.isVisible, true)))
      .limit(4);
  }

  async createForm(form: InsertFormTemplate): Promise<FormTemplate> {
    const [created] = await db.insert(formTemplates).values(form).returning();
    return created;
  }

  async updateForm(id: number, form: Partial<InsertFormTemplate>): Promise<FormTemplate | undefined> {
    const [updated] = await db
      .update(formTemplates)
      .set({ ...form, updatedAt: new Date() })
      .where(eq(formTemplates.id, id))
      .returning();
    return updated;
  }

  async deleteForm(id: number): Promise<void> {
    await db.delete(formTemplates).where(eq(formTemplates.id, id));
  }

  async incrementViewCount(slug: string): Promise<void> {
    await db
      .update(formTemplates)
      .set({ viewCount: sql`${formTemplates.viewCount} + 1` })
      .where(eq(formTemplates.slug, slug));
  }

  async getSetting(key: string): Promise<SiteSetting | undefined> {
    const [setting] = await db
      .select()
      .from(siteSettings)
      .where(eq(siteSettings.key, key))
      .limit(1);
    return setting;
  }

  async upsertSetting(key: string, value: string): Promise<SiteSetting> {
    const existing = await this.getSetting(key);
    if (existing) {
      const [updated] = await db
        .update(siteSettings)
        .set({ value, updatedAt: new Date() })
        .where(eq(siteSettings.key, key))
        .returning();
      return updated;
    }
    const [created] = await db
      .insert(siteSettings)
      .values({ key, value })
      .returning();
    return created;
  }

  async createFormRequest(request: InsertFormRequest): Promise<FormRequest> {
    const [created] = await db.insert(formRequests).values(request).returning();
    return created;
  }

  async getAllFormRequests(): Promise<FormRequest[]> {
    return db.select().from(formRequests).orderBy(desc(formRequests.createdAt));
  }

  async deleteFormRequest(id: number): Promise<void> {
    await db.delete(formRequests).where(eq(formRequests.id, id));
  }
}

export const storage = new DatabaseStorage();
