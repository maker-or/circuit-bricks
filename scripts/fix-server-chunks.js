#!/usr/bin/env node

/**
 * Post-build script to remove "use client" directive from server-side chunks
 * This ensures that server-side modules can be used in Node.js environments
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

function removeUseClientFromFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Remove "use client"; from the beginning of the file
    const updatedContent = content.replace(/^"use client";\s*\n?/m, '');
    
    if (content !== updatedContent) {
      fs.writeFileSync(filePath, updatedContent, 'utf8');
      console.log(`✅ Removed "use client" from: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

function fixServerChunks() {
  console.log('🔧 Fixing server-side chunks...');
  
  // Find all server chunk files that contain server-side code
  const serverChunkPatterns = [
    'dist/chunks/server-*.mjs',
    'dist/chunks/server-*.cjs',
    'dist/llm.mjs',
    'dist/llm.cjs',
    'dist/registry-server.mjs',
    'dist/registry-server.cjs'
  ];
  
  let totalFixed = 0;
  
  for (const pattern of serverChunkPatterns) {
    const files = glob.sync(pattern);
    
    for (const file of files) {
      if (removeUseClientFromFile(file)) {
        totalFixed++;
      }
    }
  }
  
  console.log(`🎉 Fixed ${totalFixed} server-side files`);
  
  if (totalFixed === 0) {
    console.log('ℹ️  No files needed fixing');
  }
}

// Run the script
fixServerChunks();
