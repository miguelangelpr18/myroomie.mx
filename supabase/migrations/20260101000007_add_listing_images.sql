-- Migration 007: Add image_urls to listings
-- Source: sql/add_listing_images.sql

alter table public.listings
add column if not exists image_urls text[] not null default '{}';
