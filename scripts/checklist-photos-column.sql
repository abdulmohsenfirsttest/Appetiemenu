-- Add photo support to the daily branch checklist.
-- Run this ONCE in the Supabase SQL Editor.
-- (The 'checklist-photos' storage bucket is already created.)

ALTER TABLE branch_checklists
  ADD COLUMN IF NOT EXISTS photos JSONB DEFAULT '{}';   -- { itemKey: [imageUrl, ...] }
