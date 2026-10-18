<template>
  <!-- ===================================================== -->
  <!-- HEADING -->
  <!-- ===================================================== -->

  <component
    :is="`h${Math.min(block.level || 2, 6)}`"
    v-if="block?.type === 'heading'"
    class="max-w-[75ch] break-words font-bold leading-tight tracking-tight text-[#0B2F6B]"
    :class="{
      'mb-2 mt-7 text-lg sm:text-2xl': (block.level || 2) === 2,
      'mb-2 mt-6 text-base sm:text-xl': (block.level || 2) === 3,
      'mb-2 mt-5 text-[15px] sm:text-lg': (block.level || 2) >= 4
    }"
  >
    {{ block.text }}
  </component>

  <!-- ===================================================== -->
  <!-- PARAGRAPH -->
  <!-- ===================================================== -->

  <div
    v-else-if="block.type === 'paragraph'"
    class="mt-3 min-w-0 sm:mt-4"
  >
    <div
      class="lesson-text max-w-[75ch] text-slate-700"
      v-html="block.text_html || block.text"
    ></div>

    <div v-if="block.math?.latex" class="math-box">
      <div
        class="flex min-w-max justify-center text-[#0B2F6B]"
        v-html="renderedMath(block.math.latex, block.math.display !== false)"
      ></div>
    </div>
  </div>

  <!-- ===================================================== -->
  <!-- DEFINITION -->
  <!-- ===================================================== -->

  <div
    v-else-if="block.type === 'definition'"
    class="mt-4 overflow-hidden rounded-2xl bg-white shadow-[0_8px_24px_rgba(20,49,109,0.07)] ring-1 ring-blue-50 sm:mt-5"
  >
    <div class="flex items-center gap-2.5 bg-blue-50 px-3 py-2.5 sm:px-4">
      <div
        class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600"
      >
        <Icon name="lucide:book-open" class="h-4 w-4" />
      </div>

      <span class="text-[13px] font-bold text-[#0B2F6B] sm:text-sm">
        {{ block.title || 'Definition' }}
      </span>
    </div>

    <div class="px-3 py-3 sm:px-4 sm:py-4">
      <div
        class="lesson-text text-slate-700"
        v-html="block.text_html || block.text"
      ></div>

      <div v-if="block.math?.latex" class="math-box">
        <div
          class="flex min-w-max justify-center text-[#0B2F6B]"
          v-html="renderedMath(block.math.latex, block.math.display !== false)"
        ></div>
      </div>
    </div>
  </div>

  <!-- ===================================================== -->
  <!-- NOTE -->
  <!-- ===================================================== -->

  <div
    v-else-if="block.type === 'note'"
    class="mt-4 rounded-2xl bg-blue-50 px-3 py-3 ring-1 ring-blue-100 sm:mt-5 sm:px-4 sm:py-4"
  >
    <div class="flex items-start gap-3">
      <div
        class="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700"
      >
        <Icon name="lucide:info" class="h-4 w-4" />
      </div>

      <div class="min-w-0 flex-1">
        <div
          class="lesson-text text-slate-700"
          v-html="block.text_html || block.text"
        ></div>

        <div v-if="block.math?.latex" class="math-box math-box--on-tint">
          <div
            class="flex min-w-max justify-center text-[#0B2F6B]"
            v-html="renderedMath(block.math.latex, block.math.display !== false)"
          ></div>
        </div>
      </div>
    </div>
  </div>

  <!-- ===================================================== -->
  <!-- TIP -->
  <!-- ===================================================== -->

  <div
    v-else-if="block.type === 'tip'"
    class="mt-4 flex items-start gap-3 rounded-2xl bg-blue-50 px-3 py-3 ring-1 ring-blue-100 sm:mt-5 sm:px-4 sm:py-4"
  >
    <div
      class="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#0A6CFF] text-white"
    >
      <Icon name="lucide:lightbulb" class="h-4 w-4" />
    </div>

    <div class="min-w-0 flex-1">
      <p class="mb-1 text-[13px] font-bold text-[#0B2F6B] sm:text-sm">
        {{ block.title || 'Tip' }}
      </p>

      <div
        class="lesson-text text-slate-700"
        v-html="block.text_html || block.text"
      ></div>

      <div v-if="block.math?.latex" class="math-box math-box--on-tint">
        <div
          class="flex min-w-max justify-center text-[#0B2F6B]"
          v-html="renderedMath(block.math.latex, block.math.display !== false)"
        ></div>
      </div>
    </div>
  </div>

  <!-- ===================================================== -->
  <!-- WARNING -->
  <!-- ===================================================== -->

  <div
    v-else-if="block.type === 'warning'"
    class="mt-4 flex items-start gap-3 rounded-2xl bg-slate-100 px-3 py-3 ring-1 ring-slate-200 sm:mt-5 sm:px-4 sm:py-4"
  >
    <div
      class="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#0B2F6B] text-white"
    >
      <Icon name="lucide:triangle-alert" class="h-4 w-4" />
    </div>

    <div class="min-w-0 flex-1">
      <p class="mb-1 text-[13px] font-bold text-[#0B2F6B] sm:text-sm">
        {{ block.title || 'Important' }}
      </p>

      <div
        class="lesson-text text-slate-700"
        v-html="block.text_html || block.text"
      ></div>

      <div v-if="block.math?.latex" class="math-box math-box--on-tint">
        <div
          class="flex min-w-max justify-center text-[#0B2F6B]"
          v-html="renderedMath(block.math.latex, block.math.display !== false)"
        ></div>
      </div>
    </div>
  </div>

  <!-- ===================================================== -->
  <!-- EXAMPLE -->
  <!-- ===================================================== -->

  <div
    v-else-if="block.type === 'example'"
    class="mt-4 overflow-hidden rounded-2xl border-l-4 border-l-[#0A6CFF] bg-white px-3 py-3 shadow-[0_8px_24px_rgba(20,49,109,0.07)] ring-1 ring-blue-50 sm:mt-5 sm:px-4 sm:py-4"
  >
    <p
      v-if="block.title"
      class="mb-2 text-[13px] font-bold text-[#0B2F6B] sm:text-sm"
    >
      {{ block.title }}
    </p>

    <div
      v-if="block.text_html || block.text"
      class="lesson-text text-slate-700"
      v-html="block.text_html || block.text"
    ></div>

    <div v-if="block.math?.latex" class="math-box">
      <div
        class="flex min-w-max justify-center text-[#0B2F6B]"
        v-html="renderedMath(block.math.latex, block.math.display !== false)"
      ></div>
    </div>
  </div>

  <!-- ===================================================== -->
  <!-- STEPS -->
  <!-- ===================================================== -->

  <div
    v-else-if="block.type === 'steps'"
    class="mt-4 rounded-2xl bg-white p-3 shadow-[0_8px_24px_rgba(20,49,109,0.07)] ring-1 ring-blue-50 sm:mt-5 sm:p-4"
  >
    <p
      v-if="block.title"
      class="mb-3 text-[13px] font-bold text-[#0B2F6B] sm:mb-4 sm:text-sm"
    >
      {{ block.title }}
    </p>

    <ol class="m-0 list-none space-y-4 p-0">
      <li
        v-for="(step, i) in (block.items || block.steps || [])"
        :key="i"
        class="flex items-start gap-3"
      >
        <div
          class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#0A6CFF] text-xs font-bold text-white"
        >
          {{ i + 1 }}
        </div>

        <div class="min-w-0 flex-1 pt-0.5">
          <div
            v-if="typeof step === 'string'"
            class="lesson-text text-slate-700"
            v-html="step"
          ></div>

          <div
            v-else-if="step?.text_html || step?.text"
            class="lesson-text text-slate-700"
            v-html="step.text_html || step.text"
          ></div>

          <div v-if="step?.math?.latex" class="math-box">
            <div
              class="flex min-w-max justify-center text-[#0B2F6B]"
              v-html="renderedMath(step.math.latex, step.math.display !== false)"
            ></div>
          </div>
        </div>
      </li>
    </ol>
  </div>

  <!-- ===================================================== -->
  <!-- TABLE -->
  <!-- ===================================================== -->

  <div
    v-else-if="block.type === 'table'"
    class="mt-4 max-w-full overflow-hidden rounded-2xl bg-white shadow-[0_8px_24px_rgba(20,49,109,0.07)] ring-1 ring-blue-50 sm:mt-5"
  >
    <div class="w-full overflow-x-auto">
      <table class="min-w-full border-collapse text-left text-[13px] sm:text-sm">
        <thead>
          <tr class="bg-[#0B2F6B] text-white">
            <th
              v-for="(head, i) in (block.headers || [])"
              :key="i"
              class="whitespace-nowrap px-3 py-2.5 font-bold sm:px-4"
            >
              {{ head }}
            </th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="(row, ri) in (block.rows || [])"
            :key="ri"
            class="border-t border-blue-50"
            :class="ri % 2 === 1 ? 'bg-blue-50/60' : 'bg-white'"
          >
            <td
              v-for="(cell, ci) in row"
              :key="ci"
              class="min-w-[100px] px-3 py-2.5 leading-5 text-slate-700 sm:px-4"
              v-html="cell"
            ></td>
          </tr>
        </tbody>
      </table>
    </div>

    <p
      v-if="block.caption"
      class="border-t border-blue-50 bg-blue-50/60 px-3 py-2 text-xs leading-5 text-slate-500 sm:px-4"
    >
      {{ block.caption }}
    </p>
  </div>

  <!-- ===================================================== -->
  <!-- LIST -->
  <!-- ===================================================== -->

  <component
    :is="block.ordered ? 'ol' : 'ul'"
    v-else-if="block.type === 'list'"
    class="lesson-text mt-3 max-w-[75ch] space-y-1.5 pl-5 text-slate-700 marker:font-bold marker:text-[#0A6CFF] sm:mt-4"
    :class="block.ordered ? 'list-decimal' : 'list-disc'"
  >
    <li
      v-for="(item, i) in (block.items_html || block.items || [])"
      :key="i"
      class="pl-1"
    >
      <div v-if="typeof item === 'string'" v-html="item"></div>

      <template v-else>
        <div
          v-if="item.text_html || item.text"
          v-html="item.text_html || item.text"
        ></div>

        <div v-if="item.math?.latex" class="math-box">
          <div
            class="flex min-w-max justify-center text-[#0B2F6B]"
            v-html="renderedMath(item.math.latex, item.math.display !== false)"
          ></div>
        </div>
      </template>
    </li>
  </component>

  <!-- ===================================================== -->
  <!-- QUESTION -->
  <!-- ===================================================== -->

  <div
    v-else-if="block.type === 'question'"
    class="mt-5 overflow-hidden rounded-2xl bg-white shadow-[0_8px_24px_rgba(20,49,109,0.07)] ring-1 ring-blue-50 sm:mt-6"
  >
    <div class="flex items-center gap-2.5 bg-blue-50 px-3 py-2.5 sm:px-4 sm:py-3">
      <div
        class="flex h-7 w-7 items-center justify-center rounded-full bg-[#0A6CFF] text-xs font-bold text-white"
      >
        ?
      </div>

      <span class="text-[13px] font-bold text-[#0B2F6B] sm:text-sm">
        {{ block.title || 'Question' }}
      </span>
    </div>

    <div class="px-3 py-3 sm:px-4 sm:py-4">
      <div
        v-if="block.text_html || block.text"
        class="lesson-text text-slate-700"
        v-html="block.text_html || block.text"
      ></div>

      <div v-if="block.math?.latex" class="math-box">
        <div
          class="flex min-w-max justify-center text-[#0B2F6B]"
          v-html="renderedMath(block.math.latex, block.math.display !== false)"
        ></div>
      </div>
    </div>
  </div>

  <!-- ===================================================== -->
  <!-- ANSWER -->
  <!-- ===================================================== -->

  <div
    v-else-if="block.type === 'answer'"
    class="mt-3 overflow-hidden rounded-2xl bg-blue-50 px-3 py-3 ring-1 ring-blue-100 sm:px-4 sm:py-4"
  >
    <div class="mb-2 flex items-center gap-2">
      <Icon name="lucide:check-circle-2" class="h-5 w-5 text-[#0A6CFF]" />

      <span class="text-[13px] font-bold text-[#0B2F6B] sm:text-sm">
        {{ block.title || 'Answer' }}
      </span>
    </div>

    <div
      v-if="block.text_html || block.text"
      class="lesson-text text-slate-700"
      v-html="block.text_html || block.text"
    ></div>

    <div v-if="block.math?.latex" class="math-box math-box--on-tint">
      <div
        class="flex min-w-max justify-center text-[#0B2F6B]"
        v-html="renderedMath(block.math.latex, block.math.display !== false)"
      ></div>
    </div>
  </div>

  <!-- ===================================================== -->
  <!-- DIAGRAM -->
  <!-- ===================================================== -->

  <figure
    v-else-if="block.type === 'diagram'"
    class="m-0 mt-4 min-w-0 sm:mt-5"
    :class="{
      'text-center': (block.align || 'center') === 'center',
      'text-left': block.align === 'left',
      'text-right': block.align === 'right'
    }"
  >
    <div
      class="inline-block max-w-full overflow-x-auto rounded-2xl bg-white p-2.5 shadow-[0_8px_24px_rgba(20,49,109,0.07)] ring-1 ring-blue-50 sm:p-4"
    >
      <div
        class="[&_svg]:mx-auto [&_svg]:h-auto [&_svg]:max-w-full"
        :style="{
          width: block.width ? `min(${block.width}px, 100%)` : '100%'
        }"
        v-html="sanitizedSvg(block.svg || block.markup || block.drawing || '')"
      ></div>
    </div>

    <figcaption v-if="block.caption" class="mt-2 text-xs leading-5 text-slate-500">
      {{ block.caption }}
    </figcaption>
  </figure>

  <!-- ===================================================== -->
  <!-- IMAGE -->
  <!-- ===================================================== -->

  <figure
    v-else-if="block.type === 'image'"
    class="m-0 mt-4 min-w-0 sm:mt-5"
    :class="{
      'text-center': (block.align || 'center') === 'center',
      'text-left': block.align === 'left',
      'text-right': block.align === 'right'
    }"
  >
    <img
      v-if="block.src"
      :src="block.src"
      :alt="block.alt || ''"
      loading="lazy"
      class="inline-block h-auto max-w-full rounded-2xl object-contain shadow-[0_8px_24px_rgba(20,49,109,0.07)] ring-1 ring-blue-50"
    />

    <figcaption v-if="block.caption" class="mt-2 text-xs leading-5 text-slate-500">
      {{ block.caption }}
    </figcaption>
  </figure>

  <!-- ===================================================== -->
  <!-- SVG -->
  <!-- ===================================================== -->

  <figure
    v-else-if="block.type === 'svg'"
    class="m-0 mt-4 min-w-0 sm:mt-5"
    :class="{
      'text-center': (block.align || 'center') === 'center',
      'text-left': block.align === 'left',
      'text-right': block.align === 'right'
    }"
  >
    <div
      class="inline-block max-w-full overflow-x-auto rounded-2xl bg-white p-2.5 shadow-[0_8px_24px_rgba(20,49,109,0.07)] ring-1 ring-blue-50 sm:p-4 [&_svg]:mx-auto [&_svg]:h-auto [&_svg]:max-w-full"
      v-html="sanitizedSvg(block.markup || block.svg?.svg || block.svg)"
    ></div>

    <figcaption v-if="block.caption" class="mt-2 text-xs leading-5 text-slate-500">
      {{ block.caption }}
    </figcaption>
  </figure>

  <!-- ===================================================== -->
  <!-- CODE -->
  <!-- ===================================================== -->

  <div
    v-else-if="block.type === 'code'"
    class="mt-4 max-w-full overflow-hidden rounded-2xl bg-slate-900 sm:mt-5"
  >
    <div
      v-if="block.title || block.language"
      class="flex min-w-0 items-center justify-between gap-3 bg-slate-800 px-3 py-2 sm:px-4"
    >
      <span class="min-w-0 truncate text-xs font-medium text-slate-300">
        {{ block.title || block.language }}
      </span>

      <span
        v-if="block.language"
        class="shrink-0 text-[10px] uppercase tracking-wide text-slate-500 sm:text-xs"
      >
        {{ block.language }}
      </span>
    </div>

    <pre class="m-0 max-w-full overflow-x-auto p-3 text-xs leading-6 sm:p-4 sm:text-[13px]"><code
      class="hljs !bg-transparent"
      v-html="highlightedCode(block.code || block.text, block.language)"
    ></code></pre>
  </div>

  <!-- ===================================================== -->
  <!-- FORMULA / MATH -->
  <!-- ===================================================== -->

  <div
    v-else-if="block.type === 'formula' || block.type === 'math'"
    class="math-box math-box--card"
    :class="block.display === false ? 'text-left' : 'text-center'"
  >
    <p
      v-if="block.label"
      class="mb-2 text-left text-[10px] font-bold uppercase tracking-wide text-slate-500 sm:text-xs"
    >
      {{ block.label }}
    </p>

    <div
      class="text-[#0B2F6B]"
      v-html="renderedMath(block.latex || block.formula, block.display !== false)"
    ></div>

    <p v-if="block.caption" class="mt-2 text-left text-xs leading-5 text-slate-500">
      {{ block.caption }}
    </p>
  </div>

  <!-- ===================================================== -->
  <!-- CHEMISTRY -->
  <!-- ===================================================== -->

  <div
    v-else-if="block.type === 'chemistry'"
    class="math-box math-box--card"
    :class="block.display === false ? 'text-left' : 'text-center'"
  >
    <p
      v-if="block.label"
      class="mb-2 text-left text-[10px] font-bold uppercase tracking-wide text-slate-500 sm:text-xs"
    >
      {{ block.label }}
    </p>

    <div
      class="chemistry-formula text-[#0B2F6B]"
      v-html="
        renderedMath(
          block.latex || block.formula || block.chemistry,
          block.display !== false
        )
      "
    ></div>

    <p v-if="block.caption" class="mt-2 text-left text-xs leading-5 text-slate-500">
      {{ block.caption }}
    </p>
  </div>

  <!-- ===================================================== -->
  <!-- VIDEO -->
  <!-- ===================================================== -->

  <figure v-else-if="block.type === 'video'" class="m-0 mt-4 min-w-0 sm:mt-5">
    <div
      v-if="isDirectVideo(block)"
      class="overflow-hidden rounded-2xl bg-black shadow-[0_8px_24px_rgba(20,49,109,0.12)]"
    >
      <video
        :src="block.src"
        :poster="block.poster"
        controls
        playsinline
        preload="metadata"
        class="block max-h-[70vh] w-full"
      ></video>
    </div>

    <div
      v-else-if="safeEmbedUrl(block)"
      class="relative aspect-video overflow-hidden rounded-2xl bg-black shadow-[0_8px_24px_rgba(20,49,109,0.12)]"
    >
      <iframe
        :src="safeEmbedUrl(block)"
        class="absolute inset-0 h-full w-full"
        frameborder="0"
        loading="lazy"
        referrerpolicy="strict-origin-when-cross-origin"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
      ></iframe>
    </div>

    <div
      v-else
      class="rounded-2xl bg-slate-100 px-3 py-3 text-sm text-[#0B2F6B] ring-1 ring-slate-200 sm:px-4"
    >
      Unsupported or unsafe video source.
    </div>

    <figcaption v-if="block.caption" class="mt-2 text-xs leading-5 text-slate-500">
      {{ block.caption }}
    </figcaption>
  </figure>

  <!-- ===================================================== -->
  <!-- QUOTE -->
  <!-- ===================================================== -->

  <div v-else-if="block.type === 'quote'" class="mt-4 sm:mt-5">
    <blockquote
      class="lesson-text m-0 max-w-[75ch] border-l-4 border-blue-200 pl-3 italic text-slate-600 sm:pl-4"
      v-html="block.text_html || block.text"
    ></blockquote>

    <div v-if="block.math?.latex" class="math-box">
      <div
        class="flex min-w-max justify-center text-[#0B2F6B]"
        v-html="renderedMath(block.math.latex, block.math.display !== false)"
      ></div>
    </div>
  </div>

  <!-- ===================================================== -->
  <!-- DIVIDER -->
  <!-- ===================================================== -->

  <hr
    v-else-if="block.type === 'divider'"
    class="my-6 border-blue-100 sm:my-8"
  />

  <!-- ===================================================== -->
  <!-- QUIZ -->
  <!-- ===================================================== -->

  <QuizSystem
    v-else-if="block.type === 'quiz'"
    :questions="block.questions"
  />

  <!-- ===================================================== -->
  <!-- CALLOUT -->
  <!-- ===================================================== -->

  <div
    v-else-if="block.type === 'callout'"
    class="mt-4 rounded-2xl px-3 py-3 sm:mt-5 sm:px-4 sm:py-4"
    :class="calloutClasses(block.style)"
  >
    <div class="flex items-start gap-3">
      <div
        class="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
        :class="calloutIconClasses(block.style)"
      >
        <Icon :name="calloutIcon(block.style)" class="h-4 w-4" />
      </div>

      <div class="min-w-0 flex-1">
        <p
          v-if="block.title"
          class="mb-1 text-[13px] font-bold sm:text-sm"
          :class="calloutTitleClasses(block.style)"
        >
          {{ block.title }}
        </p>

        <div
          v-if="block.text_html || block.text"
          class="lesson-text"
          :class="calloutTextClasses(block.style)"
          v-html="block.text_html || block.text"
        ></div>

        <div v-if="block.math?.latex" class="math-box math-box--on-tint">
          <div
            class="flex min-w-max justify-center text-[#0B2F6B]"
            v-html="renderedMath(block.math.latex, block.math.display !== false)"
          ></div>
        </div>
      </div>
    </div>
  </div>

  <!-- ===================================================== -->
  <!-- IMPORTANT -->
  <!-- ===================================================== -->

  <div
    v-else-if="block.type === 'important'"
    class="mt-4 overflow-hidden rounded-2xl bg-white shadow-[0_8px_24px_rgba(20,49,109,0.07)] ring-1 ring-blue-100 sm:mt-5"
  >
    <div class="flex items-center gap-2.5 bg-[#0B2F6B] px-3 py-2.5 text-white sm:px-4">
      <div
        class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#0A6CFF]"
      >
        <Icon name="lucide:badge-alert" class="h-4 w-4 text-white" />
      </div>

      <span class="text-[13px] font-bold sm:text-sm">
        {{ block.title || 'Important' }}
      </span>
    </div>

    <div class="px-3 py-3 sm:px-4 sm:py-4">
      <div
        v-if="block.text_html || block.text"
        class="lesson-text text-slate-700"
        v-html="block.text_html || block.text"
      ></div>

      <div v-if="block.math?.latex" class="math-box">
        <div
          class="flex min-w-max justify-center text-[#0B2F6B]"
          v-html="renderedMath(block.math.latex, block.math.display !== false)"
        ></div>
      </div>
    </div>
  </div>

  <!-- ===================================================== -->
  <!-- CHECKLIST -->
  <!-- ===================================================== -->

  <div
    v-else-if="block.type === 'checklist'"
    class="mt-5 overflow-hidden rounded-2xl bg-white shadow-[0_8px_24px_rgba(20,49,109,0.07)] ring-1 ring-blue-50 sm:mt-6"
  >
    <div class="flex items-start justify-between gap-3 bg-blue-50 px-3 py-3 sm:px-4">
      <div class="flex min-w-0 items-start gap-2.5">
        <div
          class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600"
        >
          <Icon name="lucide:clipboard-check" class="h-4 w-4" />
        </div>

        <div class="min-w-0">
          <p class="text-[13px] font-bold text-[#0B2F6B] sm:text-sm">
            Learning Checklist
          </p>

          <p class="mt-0.5 text-xs leading-5 text-slate-500">
            Check each skill you can confidently do.
          </p>
        </div>
      </div>

      <div class="shrink-0 text-right">
        <p class="text-[13px] font-bold tabular-nums text-[#0A6CFF] sm:text-sm">
          {{ checkedCount }}/{{ checklistItems.length }}
        </p>

        <p class="text-[10px] text-slate-500 sm:text-[11px]">Completed</p>
      </div>
    </div>

    <div class="h-1 bg-blue-100">
      <div
        class="h-full rounded-r-full bg-[#0A6CFF] transition-all duration-300"
        :style="{ width: `${checklistProgress}%` }"
      ></div>
    </div>

    <div class="divide-y divide-blue-50">
      <label
        v-for="(item, index) in checklistItems"
        :key="item.key || index"
        class="flex min-h-12 cursor-pointer items-start gap-3 px-3 py-3 transition hover:bg-blue-50/60 active:bg-blue-50 sm:px-4"
      >
        <input
          v-model="checkedItems[item.key || index]"
          type="checkbox"
          class="mt-1 h-4 w-4 shrink-0 cursor-pointer rounded border-blue-200 accent-[#0A6CFF]"
        />

        <span
          class="text-sm leading-6 transition"
          :class="
            checkedItems[item.key || index]
              ? 'text-slate-400 line-through'
              : 'text-slate-700'
          "
        >
          {{ item.text || item.label }}
        </span>
      </label>
    </div>

    <div
      v-if="checklistItems.length && checkedCount === checklistItems.length"
      class="bg-blue-50 px-3 py-3 sm:px-4"
    >
      <div class="flex items-start gap-2">
        <Icon
          name="lucide:circle-check"
          class="mt-0.5 h-5 w-5 shrink-0 text-[#0A6CFF]"
        />

        <p class="text-sm font-bold leading-5 text-[#0B2F6B]">
          Excellent! You have checked all the learning objectives.
        </p>
      </div>
    </div>
  </div>

  <!-- ===================================================== -->
  <!-- UNKNOWN BLOCK -->
  <!-- ===================================================== -->

  <div
    v-else
    class="mt-4 rounded-2xl bg-slate-100 px-3 py-3 text-sm text-[#0B2F6B] ring-1 ring-slate-200"
  >
    <div class="flex items-start gap-2 font-bold">
      <Icon name="lucide:triangle-alert" class="mt-0.5 h-4 w-4 shrink-0" />

      <span>
        Unsupported lesson block:
        {{ block.type }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed } from 'vue'
import DOMPurify from 'dompurify'
import hljs from 'highlight.js/lib/common'
import katex from 'katex'
import QuizSystem from './QuizSystem.vue'

import 'katex/dist/katex.min.css'
import 'highlight.js/styles/atom-one-dark.css'
import 'katex/contrib/mhchem'

const props = defineProps({
  block: {
    type: Object,
    required: true
  }
})

// =====================================================
// SANITIZE SVG
// =====================================================

function sanitizedSvg(markup) {
  if (!markup) return ''

  return DOMPurify.sanitize(markup, {
    USE_PROFILES: {
      svg: true,
      svgFilters: true
    },
    FORBID_TAGS: [
      'foreignObject',
      'script',
      'iframe',
      'object',
      'embed'
    ],
    FORBID_ATTR: [
      'onload',
      'onerror',
      'onclick',
      'onmouseover',
      'onmouseenter',
      'onfocus'
    ]
  })
}

// =====================================================
// HIGHLIGHT CODE
// =====================================================

function highlightedCode(code, language) {
  if (!code) return ''

  try {
    if (language && hljs.getLanguage(language)) {
      return hljs.highlight(code, {
        language
      }).value
    }

    return hljs.highlightAuto(code).value
  } catch (error) {
    const div = document.createElement('div')
    div.textContent = code
    return div.innerHTML
  }
}

// =====================================================
// RENDER MATH
// =====================================================

function renderedMath(latex, displayMode = true) {
  if (!latex) return ''

  try {
    return katex.renderToString(String(latex), {
      throwOnError: false,
      displayMode,
      strict: false,
      trust: false
    })
  } catch (error) {
    console.error('KaTeX error:', error)

    return `
      <span class="text-xs text-[#0B2F6B]">
        Invalid formula
      </span>
    `
  }
}

// =====================================================
// VIDEO
// =====================================================

const DIRECT_VIDEO_EXTENSIONS = [
  '.mp4',
  '.webm',
  '.ogg',
  '.mov'
]

function isDirectVideo(block) {
  if (!block?.src) return false

  const lower = String(block.src)
    .toLowerCase()
    .split('?')[0]

  return DIRECT_VIDEO_EXTENSIONS.some((ext) =>
    lower.endsWith(ext)
  )
}

function safeEmbedUrl(block) {
  const provider = String(block?.provider || '').toLowerCase()
  const id = block?.embedId

  if (
    provider === 'youtube' &&
    /^[a-zA-Z0-9_-]{6,20}$/.test(id || '')
  ) {
    return `https://www.youtube-nocookie.com/embed/${id}`
  }

  if (
    provider === 'vimeo' &&
    /^[0-9]{4,15}$/.test(id || '')
  ) {
    return `https://player.vimeo.com/video/${id}`
  }

  if (block?.url) {
    try {
      const parsed = new URL(block.url)

      const allowedHosts = [
        'www.youtube-nocookie.com',
        'youtube-nocookie.com',
        'player.vimeo.com'
      ]

      if (allowedHosts.includes(parsed.hostname)) {
        return parsed.toString()
      }
    } catch {
      return null
    }
  }

  return null
}

// =====================================================
// CALLOUT STYLES (one blue hue: shade + icon tell them apart)
// =====================================================

function calloutClasses(style = 'info') {
  const classes = {
    info: 'bg-blue-50 ring-1 ring-blue-100',
    success: 'bg-blue-50 ring-1 ring-blue-100',
    warning: 'bg-slate-100 ring-1 ring-slate-200',
    danger: 'bg-slate-100 ring-1 ring-[#0B2F6B]/30',
    neutral: 'bg-white ring-1 ring-blue-50 shadow-[0_8px_24px_rgba(20,49,109,0.07)]',
    purple: 'bg-blue-100/60 ring-1 ring-blue-100'
  }

  return classes[style] || classes.info
}

function calloutIconClasses(style = 'info') {
  const classes = {
    info: 'bg-blue-100 text-blue-700',
    success: 'bg-[#0A6CFF] text-white',
    warning: 'bg-[#0B2F6B] text-white',
    danger: 'bg-[#0B2F6B] text-white',
    neutral: 'bg-slate-100 text-slate-600',
    purple: 'bg-blue-100 text-blue-700'
  }

  return classes[style] || classes.info
}

function calloutTitleClasses(style = 'info') {
  const classes = {
    neutral: 'text-slate-800'
  }

  return classes[style] || 'text-[#0B2F6B]'
}

function calloutTextClasses(style = 'info') {
  return 'text-slate-700'
}

function calloutIcon(style = 'info') {
  const icons = {
    info: 'lucide:info',
    success: 'lucide:check-circle',
    warning: 'lucide:triangle-alert',
    danger: 'lucide:circle-alert',
    neutral: 'lucide:message-square',
    purple: 'lucide:sparkles'
  }

  return icons[style] || icons.info
}

// =====================================================
// CHECKLIST
// =====================================================

const checkedItems = reactive({})

const checklistItems = computed(() => {
  return Array.isArray(props.block?.items)
    ? props.block.items
    : []
})

const checkedCount = computed(() => {
  return checklistItems.value.filter((item, index) => {
    const key = item.key || index

    return checkedItems[key] === true
  }).length
})

const checklistProgress = computed(() => {
  if (!checklistItems.value.length) {
    return 0
  }

  return Math.round(
    (checkedCount.value / checklistItems.value.length) * 100
  )
})
</script>

<style scoped>
/* =====================================================
   READING TEXT: ONE SIZE FOR EVERY BLOCK
   phones 15px   |   tablets and desktop 16px
   (:deep() is needed because v-html content is not
   known to Vue's scoped styles)
===================================================== */

.lesson-text {
  max-width: 100%;
  font-size: 15px;
  line-height: 1.7;
  overflow-wrap: anywhere;
  word-break: break-word;
}

@media (min-width: 640px) {
  .lesson-text {
    font-size: 16px;
    line-height: 1.75;
  }
}

.lesson-text :deep(p) {
  margin: 0 0 0.65rem;
}

.lesson-text :deep(p:last-child) {
  margin-bottom: 0;
}

.lesson-text :deep(strong),
.lesson-text :deep(b) {
  font-weight: 700;
  color: #0b2f6b;
}

.lesson-text :deep(em),
.lesson-text :deep(i) {
  font-style: italic;
}

.lesson-text :deep(a) {
  color: #0a6cff;
  text-decoration: underline;
  text-underline-offset: 2px;
  overflow-wrap: anywhere;
}

/* bullets and numbers (the old file never showed them) */
.lesson-text :deep(ul) {
  margin: 0.65rem 0;
  padding-left: 1.25rem;
  list-style: disc;
}

.lesson-text :deep(ol) {
  margin: 0.65rem 0;
  padding-left: 1.25rem;
  list-style: decimal;
}

.lesson-text :deep(li) {
  margin-bottom: 0.3rem;
  padding-left: 0.15rem;
}

.lesson-text :deep(li::marker) {
  color: #0a6cff;
  font-weight: 700;
}

.lesson-text :deep(h1),
.lesson-text :deep(h2),
.lesson-text :deep(h3),
.lesson-text :deep(h4) {
  margin: 0.9rem 0 0.4rem;
  color: #0b2f6b;
  font-weight: 700;
  line-height: 1.35;
}

.lesson-text :deep(h1) {
  font-size: 1.2em;
}

.lesson-text :deep(h2) {
  font-size: 1.12em;
}

.lesson-text :deep(h3),
.lesson-text :deep(h4) {
  font-size: 1.05em;
}

.lesson-text :deep(img) {
  display: block;
  width: auto;
  max-width: 100%;
  height: auto;
  margin: 0.75rem auto;
  border-radius: 0.75rem;
}

.lesson-text :deep(table) {
  display: block;
  width: 100%;
  max-width: 100%;
  margin: 0.75rem 0;
  overflow-x: auto;
  border-collapse: collapse;
  font-size: 0.9em;
}

.lesson-text :deep(th),
.lesson-text :deep(td) {
  padding: 0.45rem 0.6rem;
  border: 1px solid #dbeafe;
  text-align: left;
  vertical-align: top;
}

.lesson-text :deep(th) {
  background: #eff6ff;
  font-weight: 700;
}

.lesson-text :deep(pre) {
  max-width: 100%;
  margin: 0.75rem 0;
  padding: 0.6rem;
  overflow-x: auto;
  border-radius: 0.75rem;
  background: #eff6ff;
  white-space: pre;
}

.lesson-text :deep(code) {
  font-size: 0.9em;
  overflow-wrap: anywhere;
}

.lesson-text :deep(iframe),
.lesson-text :deep(video) {
  max-width: 100%;
  height: auto;
}

.lesson-text :deep(blockquote) {
  margin: 0.75rem 0;
  padding-left: 0.75rem;
  border-left: 3px solid #bfdbfe;
  color: #64748b;
  font-style: italic;
}

.lesson-text :deep(sup) {
  font-size: 0.7em;
  vertical-align: super;
}

.lesson-text :deep(sub) {
  font-size: 0.7em;
  vertical-align: sub;
}

/* =====================================================
   MATH BOX (matrices and long formulas scroll sideways
   inside their own box instead of widening the page)
===================================================== */

.math-box {
  max-width: 100%;
  margin-top: 0.75rem;
  padding: 0.75rem;
  overflow-x: auto;
  border-radius: 1rem;
  background: #eff6ff;
  -webkit-overflow-scrolling: touch;
}

/* inside a tinted block the box turns white so it still stands out */
.math-box--on-tint {
  background: #ffffff;
}

/* stand-alone formula blocks */
.math-box--card {
  margin-top: 1rem;
  padding: 1rem 0.75rem;
  background: #ffffff;
  box-shadow: 0 8px 24px rgba(20, 49, 109, 0.07);
  outline: 1px solid #eff6ff;
}

@media (min-width: 640px) {
  .math-box {
    margin-top: 1rem;
    padding: 1rem 1.25rem;
  }

  .math-box--card {
    margin-top: 1.25rem;
    padding: 1.25rem;
  }
}

.math-box::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}

.math-box::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: rgba(10, 108, 255, 0.3);
}

.math-box :deep(.katex-display) {
  max-width: 100%;
  margin: 0 !important;
  padding: 0.35rem 0;
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
}

.math-box :deep(.katex-display .katex) {
  max-width: 100%;
}

.math-box :deep(.katex) {
  font-size: 1.05em;
}

.chemistry-formula :deep(.katex) {
  font-size: 1.05em;
}

/* math written inside paragraphs */
.lesson-text :deep(.katex) {
  font-size: 1.05em;
}

@media (max-width: 640px) {
  .math-box :deep(.katex),
  .lesson-text :deep(.katex) {
    font-size: 1em;
  }
}
</style>