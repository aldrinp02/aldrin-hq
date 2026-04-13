// =============================================
// Aldrin HQ — Types
// =============================================

// --- Auth ---

export interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  plan: 'personal' | 'pro' | 'team'
  created_at: string
  updated_at: string
}

// --- Daily Focus ---

export interface DailyFocus {
  id: string
  user_id: string
  date: string // ISO date: YYYY-MM-DD
  goal_1: string | null
  goal_2: string | null
  goal_3: string | null
  theme: string | null
  created_at: string
}

export type CreateDailyFocusInput = Pick<DailyFocus, 'date' | 'goal_1' | 'goal_2' | 'goal_3' | 'theme'>

// --- Projects ---

export type ProjectStatus = 'active' | 'paused' | 'completed' | 'archived'
export type Priority = 'high' | 'medium' | 'low'

export interface Project {
  id: string
  user_id: string
  name: string
  description: string | null
  status: ProjectStatus
  color: string
  progress: number // 0-100
  priority: Priority
  created_at: string
  updated_at: string
}

export type CreateProjectInput = Omit<Project, 'id' | 'user_id' | 'created_at' | 'updated_at'>
export type UpdateProjectInput = Partial<CreateProjectInput>

// --- Tasks ---

export type TaskStatus = 'todo' | 'in_progress' | 'done'
export type TaskCategory = 'sacred' | 'work' | 'personal' | 'content'

export interface Task {
  id: string
  user_id: string
  project_id: string | null
  title: string
  notes: string | null
  status: TaskStatus
  priority: Priority
  category: TaskCategory | null
  due_date: string | null // ISO date
  created_at: string
  updated_at: string
}

export type CreateTaskInput = Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>
export type UpdateTaskInput = Partial<CreateTaskInput>

// --- Content Pipeline ---

export type Platform = 'instagram' | 'tiktok' | 'youtube' | 'twitter' | 'linkedin'
export type ContentFormat = 'reel' | 'post' | 'story' | 'video' | 'thread'
export type ContentStage = 'idea' | 'scripting' | 'recording' | 'editing' | 'scheduled' | 'published'

export interface ContentItem {
  id: string
  user_id: string
  title: string
  platform: Platform
  format: ContentFormat
  stage: ContentStage
  script: string | null
  publish_date: string | null
  order_index: number
  created_at: string
  updated_at: string
}

export type CreateContentInput = Omit<ContentItem, 'id' | 'user_id' | 'created_at' | 'updated_at'>
export type UpdateContentInput = Partial<CreateContentInput>

// --- CRM / Contacts ---

export type ContactType = 'lead' | 'client'
export type LeadStage = 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiating' | 'won' | 'lost'
export type ClientStage = 'active' | 'paused' | 'churned'

export interface Contact {
  id: string
  user_id: string
  type: ContactType
  name: string
  business: string | null
  email: string | null
  phone: string | null
  stage: string // LeadStage | ClientStage
  monthly_value: number | null
  start_date: string | null
  last_contact: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export type CreateContactInput = Omit<Contact, 'id' | 'user_id' | 'created_at' | 'updated_at'>
export type UpdateContactInput = Partial<CreateContactInput>

// --- UI / Shared ---

export interface ApiError {
  error: string
  status?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  pageSize: number
}
