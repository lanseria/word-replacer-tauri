import { join, tempDir } from '@tauri-apps/api/path'
import { writeTextFile } from '@tauri-apps/plugin-fs'
import { Command } from '@tauri-apps/plugin-shell'

export interface ExecutionResult {
  success: boolean
  message: string
  details?: {
    filesProcessed?: number
    replacementsMade?: number
    errors?: string[]
  }
}

export async function executeSidecar(
  config: WrClConfig,
): Promise<ExecutionResult> {
  try {
    // 创建临时配置文件
    const tempDirPath = await tempDir()
    const configPath = await join(tempDirPath, 'word-replacement-config.json')
    await writeTextFile(configPath, JSON.stringify(config, null, 2))
    // eslint-disable-next-line no-console
    console.debug('configPath', configPath)
    // 执行 sidecar
    const command = Command.sidecar('sidecar/wr-cl', [
      '--config',
      configPath,
    ])
    // const command = Command.sidecar('sidecar/wr-cl', ['--help'])

    // 执行命令并等待结果
    const output = await command.execute()

    if (output.code !== 0) {
      throw new Error(output.stderr)
    }

    // 解析输出结果
    const result = output.stdout
    return {
      success: true,
      message: 'Word replacement completed successfully',
      details: result,
    }
  }
  catch (error) {
    console.error('Sidecar execution failed:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}
