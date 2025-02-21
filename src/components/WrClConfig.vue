<script setup lang="ts">
import { executeSidecar } from '~/composables/sidecarExecutor'

const config = reactive<WrClConfig>({
  replacements: {
    pattern_type: 'plain',
    rules: [{
      old_text: '小沙街道',
      new_text: '新城街道',
      options: {
        case_sensitive: false,
        whole_word: false,
        preserve_format: false,
      },
    }],
  },
  file_settings: {
    input_path: '/Users/zhangchao/Documents/Code/Supeset/wr-cl/input',
    file_types: ['.docx'],
    output_path: '/Users/zhangchao/Documents/Code/Supeset/wr-cl/output',
  },
  advanced: {
    max_workers: 4,
    timeout: 30,
  },
})

const fileTypes = ref('.docx')
const isProcessing = ref(false)
const consoleOutput = ref<Array<{ type: 'info' | 'error', message: string }>>([])

function updateFileTypes() {
  config.file_settings.file_types = fileTypes.value.split(',').map(t => t.trim())
}

function addRule() {
  config.replacements.rules.push({
    old_text: '',
    new_text: '',
    options: {
      case_sensitive: false,
      whole_word: false,
      preserve_format: false,
    },
  })
}

function removeRule(index: number) {
  config.replacements.rules.splice(index, 1)
}

function log(message: string, type: 'info' | 'error' = 'info') {
  consoleOutput.value.push({ type, message })
  nextTick(() => {
    const console = document.querySelector('.console-output')
    if (console)
      console.scrollTop = console.scrollHeight
  })
}

async function executeReplacement() {
  isProcessing.value = true
  consoleOutput.value = []
  log('Starting word replacement...')

  try {
    const result = await executeSidecar(config)
    if (result.success) {
      log('✅ Process completed successfully')
      if (result.details) {
        log(`📁 Files processed: ${result.details}`)
        log(`🔄 Replacements made: ${result.details}`)
      }
    }
    else {
      throw new Error(result.message)
    }
  }
  catch (error) {
    log(error instanceof Error ? error.message : 'Unknown error occurred', 'error')
  }
  finally {
    isProcessing.value = false
  }
}
</script>

<template>
  <div class="mx-auto p-4">
    <div class="grid grid-cols-5 gap-4">
      <!-- Left Column (3/5) - Configuration -->
      <div class="col-span-3 space-y-3">
        <!-- Replacements -->
        <section class="card">
          <div class="flex items-center justify-between mb-2">
            <h2 class="card-title">
              Replacements
            </h2>
            <select v-model="config.replacements.pattern_type" class="select-mini">
              <option value="plain">
                Plain
              </option>
              <option value="regex">
                Regex
              </option>
            </select>
          </div>

          <div class="space-y-2">
            <!-- Rules Header -->
            <div class="flex justify-between items-center">
              <h3 class="text-sm font-medium">
                Rules
              </h3>
              <button class="btn-primary-sm" @click="addRule">
                Add Rule
              </button>
            </div>

            <!-- Rules List -->
            <div
              v-for="(rule, index) in config.replacements.rules"
              :key="index"
              class="rule-card"
            >
              <div class="flex justify-end">
                <button class="text-red-400 hover:text-red-600 text-sm" @click="removeRule(index)">
                  ×
                </button>
              </div>
              <div class="space-y-2">
                <input
                  v-model="rule.old_text"
                  class="input-mini"
                  placeholder="Old text"
                >
                <input
                  v-model="rule.new_text"
                  class="input-mini"
                  placeholder="New text"
                >
                <div class="flex gap-3 text-sm">
                  <label class="option">
                    <input v-model="rule.options.case_sensitive" type="checkbox">
                    <span>Case</span>
                  </label>
                  <label class="option">
                    <input v-model="rule.options.whole_word" type="checkbox">
                    <span>Word</span>
                  </label>
                  <label class="option">
                    <input v-model="rule.options.preserve_format" type="checkbox">
                    <span>Format</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- File Settings -->
        <section class="card">
          <h2 class="card-title">
            File Settings
          </h2>
          <div class="grid grid-cols-2 gap-2">
            <div class="col-span-2">
              <input
                v-model="fileTypes"
                class="input-mini"
                placeholder="File types (e.g., .docx,.txt)"
                @input="updateFileTypes"
              >
            </div>
            <input
              v-model="config.file_settings.input_path"
              class="input-mini"
              placeholder="Input path"
            >
            <input
              v-model="config.file_settings.output_path"
              class="input-mini"
              placeholder="Output path"
            >
          </div>
        </section>

        <!-- Advanced Settings -->
        <section class="card">
          <h2 class="card-title">
            Advanced
          </h2>
          <div class="grid grid-cols-2 gap-2">
            <div>
              <input
                v-model.number="config.advanced.max_workers"
                type="number"
                class="input-mini"
                min="1"
                placeholder="Max workers"
              >
            </div>
            <div>
              <input
                v-model.number="config.advanced.timeout"
                type="number"
                class="input-mini"
                min="1"
                placeholder="Timeout (s)"
              >
            </div>
          </div>
        </section>
      </div>

      <!-- Right Column (2/5) - Execution and Output -->
      <div class="col-span-2 space-y-3">
        <!-- Execute Button -->
        <section class="card">
          <div class="flex justify-between items-center">
            <h2 class="card-title">
              Execution
            </h2>
            <button
              class="btn-primary"
              :disabled="isProcessing"
              @click="executeReplacement"
            >
              {{ isProcessing ? 'Processing...' : 'Execute' }}
            </button>
          </div>
        </section>

        <!-- Console Output -->
        <section class="card flex-1">
          <h2 class="card-title">
            Console Output
          </h2>
          <div class="console-output">
            <div
              v-for="(log, index) in consoleOutput"
              :key="index"
              :class="{ 'text-red-400': log.type === 'error' }"
            >
              {{ log.message }}
            </div>
          </div>
        </section>

        <!-- Config Preview -->
        <section class="card">
          <h2 class="card-title">
            Configuration
          </h2>
          <pre class="config-preview">{{ JSON.stringify(config, null, 2) }}</pre>
        </section>
      </div>
    </div>
  </div>
</template>
