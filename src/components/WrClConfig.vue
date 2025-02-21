<script setup lang="ts">
const config = reactive<WrClConfig>({
  replacements: {
    pattern_type: 'plain',
    rules: [
      {
        old_text: '',
        new_text: '',
        options: {
          case_sensitive: false,
          whole_word: false,
          preserve_format: false,
        },
      },
    ],
  },
  file_settings: {
    input_path: './docs',
    file_types: ['.docx'],
    output_path: './modified',
  },
  advanced: {
    max_workers: 4,
    timeout: 30,
  },
})

const fileTypes = ref('')

// 监听fileTypes的变化并更新到config中
function updateFileTypes() {
  config.file_settings.file_types = fileTypes.value.split(',').map(type => type.trim())
}

// 添加新规则
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

// 删除规则
function removeRule(index: number) {
  config.replacements.rules.splice(index, 1)
}
</script>

<template>
  <div class="max-w-4xl mx-auto p-6">
    <h1 class="text-2xl font-bold mb-6">
      WR-CL Configuration
    </h1>

    <!-- Replacements Section -->
    <div class="form-section">
      <h2 class="text-xl font-semibold mb-4">
        Replacements
      </h2>

      <div class="form-group">
        <label class="form-label">Pattern Type</label>
        <select v-model="config.replacements.pattern_type" class="input-base">
          <option value="plain">
            Plain
          </option>
          <option value="regex">
            Regex
          </option>
        </select>
      </div>

      <!-- Replacement Rules -->
      <div class="mb-4">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-medium">
            Rules
          </h3>
          <button
            class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            @click="addRule"
          >
            Add Rule
          </button>
        </div>

        <div
          v-for="(rule, index) in config.replacements.rules"
          :key="index"
          class="border p-4 rounded mb-4"
        >
          <div class="flex justify-end mb-2">
            <button
              class="text-red-500 hover:text-red-700"
              @click="removeRule(index)"
            >
              Remove
            </button>
          </div>

          <div class="form-group">
            <label class="form-label">Old Text</label>
            <input
              v-model="rule.old_text"
              type="text"
              class="input-base"
              placeholder="Text to replace"
            >
          </div>

          <div class="form-group">
            <label class="form-label">New Text</label>
            <input
              v-model="rule.new_text"
              type="text"
              class="input-base"
              placeholder="Replacement text"
            >
          </div>

          <div class="grid grid-cols-3 gap-4">
            <div class="checkbox-wrapper">
              <input
                v-model="rule.options.case_sensitive"
                type="checkbox"
                class="form-checkbox"
              >
              <label>Case Sensitive</label>
            </div>
            <div class="checkbox-wrapper">
              <input
                v-model="rule.options.whole_word"
                type="checkbox"
                class="form-checkbox"
              >
              <label>Whole Word</label>
            </div>
            <div class="checkbox-wrapper">
              <input
                v-model="rule.options.preserve_format"
                type="checkbox"
                class="form-checkbox"
              >
              <label>Preserve Format</label>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- File Settings Section -->
    <div class="form-section">
      <h2 class="text-xl font-semibold mb-4">
        File Settings
      </h2>

      <div class="form-group">
        <label class="form-label">Input Path</label>
        <input
          v-model="config.file_settings.input_path"
          type="text"
          class="input-base"
          placeholder="./docs"
        >
      </div>

      <div class="form-group">
        <label class="form-label">File Types (comma-separated)</label>
        <input
          v-model="fileTypes"
          type="text"
          class="input-base"
          placeholder=".docx,.txt"
          @input="updateFileTypes"
        >
      </div>

      <div class="form-group">
        <label class="form-label">Output Path</label>
        <input
          v-model="config.file_settings.output_path"
          type="text"
          class="input-base"
          placeholder="./modified"
        >
      </div>
    </div>

    <!-- Advanced Settings Section -->
    <div class="form-section">
      <h2 class="text-xl font-semibold mb-4">
        Advanced Settings
      </h2>

      <div class="form-group">
        <label class="form-label">Max Workers</label>
        <input
          v-model.number="config.advanced.max_workers"
          type="number"
          class="input-base"
          min="1"
        >
      </div>

      <div class="form-group">
        <label class="form-label">Timeout (seconds)</label>
        <input
          v-model.number="config.advanced.timeout"
          type="number"
          class="input-base"
          min="1"
        >
      </div>
    </div>

    <!-- Configuration Preview -->
    <div class="form-section">
      <h2 class="text-xl font-semibold mb-4">
        Configuration Preview
      </h2>
      <pre class="bg-gray-800 text-white p-4 rounded overflow-x-auto">{{ JSON.stringify(config, null, 2) }}</pre>
    </div>
  </div>
</template>
