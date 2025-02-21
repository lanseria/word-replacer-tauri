import { execSync } from 'node:child_process'
import fs from 'node:fs'
import fsp from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import fetch from 'node-fetch'
import { ProxyAgent } from 'proxy-agent'
import { extract } from 'tar'

// Logging utilities
const log_info = (...args) => console.log('💬', ...args)
const log_success = (...args) => console.log('✅', ...args)
const log_error = (...args) => console.error('❌', ...args)
const log_debug = (...args) => console.log('🐛', ...args)

const cwd = process.cwd()
const TEMP_DIR = path.join(cwd, '.wr-cl')
const FORCE = process.argv.includes('--force')

// Platform mapping similar to your reference
const PLATFORM_MAP = {
  'x86_64-pc-windows-msvc': 'windows',
  'i686-pc-windows-msvc': 'windows',
  'aarch64-pc-windows-msvc': 'windows',
  'x86_64-apple-darwin': 'macos',
  'aarch64-apple-darwin': 'macos',
  'x86_64-unknown-linux-gnu': 'linux',
  'i686-unknown-linux-gnu': 'linux',
  'aarch64-unknown-linux-gnu': 'linux',
}

// Get target platform
const arg1 = process.argv.slice(2)[0]
const arg2 = process.argv.slice(2)[1]
const target = arg1 === '--force' ? arg2 : arg1
// log_debug('target:', target)
// Get host triple
const SIDECAR_HOST = target || execSync('rustc -vV')
  .toString()
  // eslint-disable-next-line regexp/no-empty-lookarounds-assertion
  .match(/(?<=host: ).+(?=)/g)[0]

const platform = target ? PLATFORM_MAP[target] : process.platform === 'win32' ? 'windows' : process.platform
log_debug('platform:', platform)
const WR_CL_VERSION = 'v1.1.0'
const REPO_BASE = 'https://github.com/lanseria/wr-cl/releases/download'

function getWrClInfo() {
  const isWin = platform === 'windows'
  const isMac = platform === 'darwin'
  const platformSuffix = isWin ? 'windows.exe' : isMac ? 'macos' : 'linux'
  const downloadURL = `${REPO_BASE}/${WR_CL_VERSION}/wr-cl-${platformSuffix}.tar.gz`

  return {
    name: 'wr-cl',
    targetBinaryName: isWin ? 'wr-cl.exe' : 'wr-cl',
    targetBinaryPath: `wr-cl-${SIDECAR_HOST}${isWin ? '.exe' : ''}`,
    configTemplate: 'config.json.template',
    configTarget: 'config.json',
    downloadURL,
    isWin,
  }
}

async function downloadFile(url, path) {
  const options = {}
  const httpProxy
    = process.env.HTTP_PROXY
      || process.env.http_proxy
      || process.env.HTTPS_PROXY
      || process.env.https_proxy

  if (httpProxy) {
    // 修改这里的代理agent创建方式
    log_debug('Using proxy:', ProxyAgent)
    const proxyAgent = new ProxyAgent()
    options.agent = proxyAgent
    log_debug('Using proxy:', httpProxy)
  }

  const response = await fetch(url, {
    ...options,
    method: 'GET',
    headers: { 'Content-Type': 'application/octet-stream' },
  })

  if (!response.ok) {
    throw new Error(`Failed to download ${url}: ${response.statusText}`)
  }

  const buffer = await response.arrayBuffer()
  await fsp.writeFile(path, new Uint8Array(buffer))
  log_success(`download finished: ${url}`)
}

async function resolveWrCl() {
  const info = getWrClInfo()
  const tempDir = TEMP_DIR
  const tempTarGz = path.join(tempDir, 'wr-cl.tar.gz')

  // Create directories
  const binariesDir = path.join(cwd, 'src-tauri/binaries')
  const resourcesDir = path.join(cwd, 'src-tauri/resources')

  await fsp.mkdir(binariesDir, { recursive: true })
  await fsp.mkdir(resourcesDir, { recursive: true })
  await fsp.mkdir(tempDir, { recursive: true })
  // await fsp.mkdir(tempDir, { recursive: true })

  const binaryPath = path.join(binariesDir, info.targetBinaryPath)
  const configPath = path.join(resourcesDir, info.configTarget)

  // Skip if files exist and not forced
  if (!FORCE && fs.existsSync(binaryPath) && fs.existsSync(configPath)) {
    log_info('Files already exist, skipping download')
    return
  }

  try {
    // Download the tar.gz file
    log_debug('downloading...')
    await downloadFile(info.downloadURL, tempTarGz)
    log_debug('tempTarGz: ', tempTarGz)
    // return
    // Extract the archive
    await extract({
      file: tempTarGz,
      cwd: tempDir,
    })

    // Move files to their destinations
    const extractedBinary = path.join(tempDir, info.targetBinaryName)
    const extractedConfig = path.join(tempDir, info.configTemplate)

    await fsp.rename(extractedBinary, binaryPath)
    await fsp.rename(extractedConfig, configPath)

    // Set executable permissions on Unix-like systems
    if (!info.isWin) {
      execSync(`chmod 755 ${binaryPath}`)
      log_success(`chmod finished: ${binaryPath}`)
    }

    log_success('wr-cl setup completed successfully')
  }
  catch (err) {
    log_error('Error during wr-cl setup:', err.message)
    // Cleanup on error
    // await fsp.rm(binaryPath, { force: true })
    // await fsp.rm(configPath, { force: true })
    throw err
  }
  finally {
    // Cleanup temp directory
    // await fsp.rm(tempDir, { recursive: true, force: true })
  }
}

// Main execution
resolveWrCl().catch((err) => {
  log_error('Fatal error:', err)
  process.exit(1)
})
