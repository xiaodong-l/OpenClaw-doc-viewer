#!/usr/bin/env node
/**
 * OpenClaw Doc Viewer Backend Server
 */

import { buildApp } from './app.js'

async function main() {
  console.log('🚀 Starting OpenClaw Doc Viewer Backend...')

  try {
    const app = await buildApp()

    await app.listen({
      port: process.env.PORT || 3000,
      host: process.env.HOST || 'localhost'
    })

    console.log(`✅ Server running at http://${process.env.HOST || 'localhost'}:${process.env.PORT || 3000}`)
    console.log(`📊 Health check: http://${process.env.HOST || 'localhost'}:${process.env.PORT || 3000}/health`)
  } catch (err) {
    console.error('❌ Failed to start server:', err)
    process.exit(1)
  }
}

main()
