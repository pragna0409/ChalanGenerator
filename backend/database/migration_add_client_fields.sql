-- Migration: Add new fields to clients and chalans tables
-- Run this SQL to update existing database

-- Add new columns to clients table
ALTER TABLE clients 
ADD COLUMN pincode VARCHAR(10) AFTER email,
ADD COLUMN gstin VARCHAR(15) AFTER pincode,
ADD COLUMN arn VARCHAR(50) AFTER gstin;

-- Add arn column to chalans table
ALTER TABLE chalans 
ADD COLUMN arn VARCHAR(50) AFTER remarks;
