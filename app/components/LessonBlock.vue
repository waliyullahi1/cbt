<template>
  <!-- ===================================================== -->
  <!-- HEADING -->
  <!-- ===================================================== -->

  <component
    v-if="block?.type === 'heading'"
    :is="`h${Math.min(block.level || 2, 6)}`"
    class="break-words font-semibold leading-tight text-slate-900"
    :class="{
      'mt-7 mb-2 text-lg sm:text-2xl': (block.level || 2) === 2,
      'mt-6 mb-2 text-base sm:text-xl': (block.level || 2) === 3,
      'mt-5 mb-2 text-[15px] sm:text-lg': (block.level || 2) >= 4
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
      class="lesson-text text-[13px] leading-6 text-slate-700 sm:text-[15px] sm:leading-7"
      v-html="block.text_html || block.text"
    ></div>

    <div
      v-if="block.math?.latex"
      class="math-box mt-3 overflow-x-auto rounded-lg bg-white px-3 py-3 sm:mt-4 sm:px-4 sm:py-5"
    >
      <div
        class="flex min-w-max justify-center text-slate-900"
        v-html="
          renderedMath(
            block.math.latex,
            block.math.display !== false
          )
        "
      ></div>
    </div>
  </div>

  <!-- ===================================================== -->
  <!-- DEFINITION -->
  <!-- ===================================================== -->

  <div
    v-else-if="block.type === 'definition'"
    class="mt-4 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm sm:mt-5"
  >
    <div
      class="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-3 py-2.5 sm:px-4"
    >
      <div
        class="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/10 sm:h-7 sm:w-7"
      >
        <Icon
          name="lucide:book-open"
          class="h-3.5 w-3.5 text-navy sm:h-4 sm:w-4"
        />
      </div>

      <span class="text-xs font-bold text-slate-800 sm:text-sm">
        {{ block.title || 'Definition' }}
      </span>
    </div>

    <div
      class="lesson-text px-3 py-3 text-[13px] leading-6 text-slate-700 sm:px-4 sm:py-4 sm:text-[14px] sm:leading-7"
      v-html="block.text_html || block.text"
    ></div>

    <div
      v-if="block.math?.latex"
      class="math-box mx-3 mb-3 overflow-x-auto rounded-lg bg-slate-50 px-3 py-3 sm:mx-4 sm:mb-4 sm:px-4 sm:py-5"
    >
      <div
        class="flex min-w-max justify-center"
        v-html="
          renderedMath(
            block.math.latex,
            block.math.display !== false
          )
        "
      ></div>
    </div>
  </div>

  <!-- ===================================================== -->
  <!-- NOTE -->
  <!-- ===================================================== -->

  <div
    v-else-if="block.type === 'note'"
    class="mt-4 rounded-lg border border-navy-soft/20 bg-primary-soft/5 px-3 py-3 sm:mt-5 sm:px-4 sm:py-4"
  >
    <div class="flex items-start gap-2.5">
      <Icon
        name="lucide:info"
        class="mt-0.5 h-4 w-4 shrink-0 text-navy-soft"
      />

      <div class="min-w-0 flex-1">
        <div
          class="lesson-text text-[13px] leading-6 text-slate-700 sm:text-[14px] sm:leading-7"
          v-html="block.text_html || block.text"
        ></div>

        <div
          v-if="block.math?.latex"
          class="math-box mt-3 overflow-x-auto rounded-lg bg-white px-3 py-3 sm:mt-4 sm:px-4"
        >
          <div
            class="flex min-w-max justify-center"
            v-html="
              renderedMath(
                block.math.latex,
                block.math.display !== false
              )
            "
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
    class="mt-4 flex items-start gap-2.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-3 sm:mt-5 sm:gap-3 sm:px-4 sm:py-4"
  >
    <div
      class="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100"
    >
      <Icon
        name="lucide:lightbulb"
        class="h-3.5 w-3.5 text-emerald-700 sm:h-4 sm:w-4"
      />
    </div>

    <div class="min-w-0 flex-1">
      <p class="mb-1 text-xs font-bold text-emerald-800 sm:text-sm">
        {{ block.title || 'Tip' }}
      </p>

      <div
        class="lesson-text text-[13px] leading-6 text-emerald-900 sm:text-[14px] sm:leading-7"
        v-html="block.text_html || block.text"
      ></div>

      <div
        v-if="block.math?.latex"
        class="math-box mt-3 overflow-x-auto rounded-lg bg-white px-3 py-3 sm:mt-4 sm:px-4"
      >
        <div
          class="flex min-w-max justify-center"
          v-html="
            renderedMath(
              block.math.latex,
              block.math.display !== false
            )
          "
        ></div>
      </div>
    </div>
  </div>

  <!-- ===================================================== -->
  <!-- WARNING -->
  <!-- ===================================================== -->

  <div
    v-else-if="block.type === 'warning'"
    class="mt-4 flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-3 sm:mt-5 sm:gap-3 sm:px-4 sm:py-4"
  >
    <div
      class="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100"
    >
      <Icon
        name="lucide:triangle-alert"
        class="h-3.5 w-3.5 text-amber-700 sm:h-4 sm:w-4"
      />
    </div>

    <div class="min-w-0 flex-1">
      <p class="mb-1 text-xs font-bold text-amber-800 sm:text-sm">
        {{ block.title || 'Important' }}
      </p>

      <div
        class="lesson-text text-[13px] leading-6 text-amber-900 sm:text-[14px] sm:leading-7"
        v-html="block.text_html || block.text"
      ></div>

      <div
        v-if="block.math?.latex"
        class="math-box mt-3 overflow-x-auto rounded-lg bg-white px-3 py-3 sm:mt-4 sm:px-4"
      >
        <div
          class="flex min-w-max justify-center"
          v-html="
            renderedMath(
              block.math.latex,
              block.math.display !== false
            )
          "
        ></div>
      </div>
    </div>
  </div>

  <!-- ===================================================== -->
  <!-- EXAMPLE -->
  <!-- ===================================================== -->

  <div
    v-else-if="block.type === 'example'"
    class="mt-4 overflow-hidden rounded-lg border-l-4 border-gold bg-slate-50 px-3 py-3 sm:mt-5 sm:px-4 sm:py-4"
  >
    <p
      v-if="block.title"
      class="mb-2 text-xs font-bold text-slate-700 sm:mb-3 sm:text-sm"
    >
      {{ block.title }}
    </p>

    <div
      v-if="block.text_html || block.text"
      class="lesson-text text-[13px] leading-6 text-slate-700 sm:text-[14px] sm:leading-7"
      v-html="block.text_html || block.text"
    ></div>

    <div
      v-if="block.math?.latex"
      class="math-box mt-3 overflow-x-auto rounded-lg bg-white px-3 py-4 sm:mt-5 sm:px-4 sm:py-5"
    >
      <div
        class="flex min-w-max justify-center text-slate-900"
        v-html="
          renderedMath(
            block.math.latex,
            block.math.display !== false
          )
        "
      ></div>
    </div>
  </div>

  <!-- ===================================================== -->
  <!-- STEPS -->
  <!-- ===================================================== -->

  <div
    v-else-if="block.type === 'steps'"
    class="mt-4 rounded-lg border border-slate-200 bg-white p-3 sm:mt-5 sm:p-4"
  >
    <p
      v-if="block.title"
      class="mb-3 text-xs font-bold text-slate-800 sm:mb-4 sm:text-sm"
    >
      {{ block.title }}
    </p>

    <ol class="space-y-3 sm:space-y-5">
      <li
        v-for="(step, i) in (block.items || block.steps || [])"
        :key="i"
        class="flex items-start gap-2.5 sm:gap-3"
      >
        <div
          class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-white sm:h-7 sm:w-7 sm:text-xs"
        >
          {{ i + 1 }}
        </div>

        <div class="min-w-0 flex-1 pt-0.5">
          <div
            v-if="typeof step === 'string'"
            class="lesson-text text-[13px] leading-6 text-slate-700 sm:text-[14px] sm:leading-7"
            v-html="step"
          ></div>

          <div
            v-else-if="step?.text_html || step?.text"
            class="lesson-text text-[13px] leading-6 text-slate-700 sm:text-[14px] sm:leading-7"
            v-html="step.text_html || step.text"
          ></div>

          <div
            v-if="step?.math?.latex"
            class="math-box mt-2 overflow-x-auto rounded-lg bg-slate-50 px-3 py-3 sm:mt-3 sm:px-4 sm:py-4"
          >
            <div
              class="flex min-w-max justify-center text-slate-900"
              v-html="
                renderedMath(
                  step.math.latex,
                  step.math.display !== false
                )
              "
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
    class="mt-4 max-w-full overflow-hidden rounded-lg border border-slate-200 sm:mt-5"
  >
    <div class="w-full overflow-x-auto">
      <table
        class="min-w-full border-collapse text-left text-[12px] sm:text-sm"
      >
        <thead>
          <tr class="bg-primary text-white">
            <th
              v-for="(head, i) in (block.headers || [])"
              :key="i"
              class="whitespace-nowrap px-3 py-2 font-semibold sm:px-4 sm:py-2.5"
            >
              {{ head }}
            </th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="(row, ri) in (block.rows || [])"
            :key="ri"
            class="border-t border-slate-200"
            :class="ri % 2 === 1 ? 'bg-slate-50' : 'bg-white'"
          >
            <td
              v-for="(cell, ci) in row"
              :key="ci"
              class="min-w-[100px] px-3 py-2 leading-5 text-slate-700 sm:px-4 sm:py-2.5"
              v-html="cell"
            ></td>
          </tr>
        </tbody>
      </table>
    </div>

    <p
      v-if="block.caption"
      class="border-t border-slate-200 bg-slate-50 px-3 py-2 text-[11px] leading-5 text-slate-500 sm:px-4 sm:text-xs"
    >
      {{ block.caption }}
    </p>
  </div>

  <!-- ===================================================== -->
  <!-- LIST -->
  <!-- ===================================================== -->

  <component
    v-else-if="block.type === 'list'"
    :is="block.ordered ? 'ol' : 'ul'"
    class="lesson-list mt-3 space-y-1 pl-5 text-[13px] leading-6 text-slate-700 sm:mt-4 sm:text-[14px] sm:leading-7"
    :class="block.ordered ? 'list-decimal' : 'list-disc'"
  >
    <li
      v-for="(item, i) in (block.items_html || block.items || [])"
      :key="i"
      class="pl-1"
    >
      <div
        v-if="typeof item === 'string'"
        v-html="item"
      ></div>

      <template v-else>
        <div
          v-if="item.text_html || item.text"
          v-html="item.text_html || item.text"
        ></div>

        <div
          v-if="item.math?.latex"
          class="math-box my-2 overflow-x-auto rounded-lg bg-slate-50 px-3 py-3 sm:my-3 sm:px-4"
        >
          <div
            class="flex min-w-max justify-center"
            v-html="
              renderedMath(
                item.math.latex,
                item.math.display !== false
              )
            "
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
    class="mt-5 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm sm:mt-6"
  >
    <div
      class="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-3 py-2.5 sm:px-4 sm:py-3"
    >
      <div
        class="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-white sm:h-7 sm:w-7 sm:text-xs"
      >
        ?
      </div>

      <span class="text-xs font-bold text-slate-800 sm:text-sm">
        {{ block.title || 'Question' }}
      </span>
    </div>

    <div class="px-3 py-3 sm:px-4 sm:py-4">
      <div
        v-if="block.text_html || block.text"
        class="lesson-text text-[13px] leading-6 text-slate-700 sm:text-[15px] sm:leading-7"
        v-html="block.text_html || block.text"
      ></div>

      <div
        v-if="block.math?.latex"
        class="math-box mt-3 overflow-x-auto rounded-lg bg-slate-50 px-3 py-3 sm:mt-4 sm:px-4 sm:py-4"
      >
        <div
          class="flex min-w-max justify-center"
          v-html="
            renderedMath(
              block.math.latex,
              block.math.display !== false
            )
          "
        ></div>
      </div>
    </div>
  </div>

  <!-- ===================================================== -->
  <!-- ANSWER -->
  <!-- ===================================================== -->

  <div
    v-else-if="block.type === 'answer'"
    class="mt-3 overflow-hidden rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-3 sm:px-4 sm:py-4"
  >
    <div class="mb-2 flex items-center gap-2">
      <Icon
        name="lucide:check-circle"
        class="h-4 w-4 text-emerald-600"
      />

      <span class="text-xs font-bold text-emerald-800 sm:text-sm">
        {{ block.title || 'Answer' }}
      </span>
    </div>

    <div
      v-if="block.text_html || block.text"
      class="lesson-text text-[13px] leading-6 text-emerald-900 sm:text-[14px] sm:leading-7"
      v-html="block.text_html || block.text"
    ></div>

    <div
      v-if="block.math?.latex"
      class="math-box mt-3 overflow-x-auto rounded-lg bg-white px-3 py-3 sm:mt-4 sm:px-4"
    >
      <div
        class="flex min-w-max justify-center text-emerald-900"
        v-html="
          renderedMath(
            block.math.latex,
            block.math.display !== false
          )
        "
      ></div>
    </div>
  </div>

  <!-- ===================================================== -->
  <!-- DIAGRAM -->
  <!-- ===================================================== -->

  <figure
    v-else-if="block.type === 'diagram'"
    class="mt-4 min-w-0 sm:mt-5"
    :class="{
      'text-center': (block.align || 'center') === 'center',
      'text-left': block.align === 'left',
      'text-right': block.align === 'right'
    }"
  >
    <div
      class="inline-block max-w-full overflow-x-auto rounded-lg border border-slate-200 bg-white p-2.5 sm:p-4"
    >
      <div
        class="[&_svg]:mx-auto [&_svg]:h-auto [&_svg]:max-w-full"
        :style="{
          width: block.width
            ? `min(${block.width}px, 100%)`
            : '100%'
        }"
        v-html="
          sanitizedSvg(
            block.svg ||
            block.markup ||
            block.drawing ||
            ''
          )
        "
      ></div>
    </div>

    <figcaption
      v-if="block.caption"
      class="mt-1.5 text-[11px] leading-5 text-slate-500 sm:text-xs"
    >
      {{ block.caption }}
    </figcaption>
  </figure>

  <!-- ===================================================== -->
  <!-- IMAGE -->
  <!-- ===================================================== -->

  <figure
    v-else-if="block.type === 'image'"
    class="mt-4 min-w-0 sm:mt-5"
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
      class="inline-block h-auto max-w-full rounded-lg border border-slate-200 object-contain"
    />

    <figcaption
      v-if="block.caption"
      class="mt-1.5 text-[11px] leading-5 text-slate-500 sm:text-xs"
    >
      {{ block.caption }}
    </figcaption>
  </figure>

  <!-- ===================================================== -->
  <!-- SVG -->
  <!-- ===================================================== -->

  <figure
    v-else-if="block.type === 'svg'"
    class="mt-4 min-w-0 sm:mt-5"
    :class="{
      'text-center': (block.align || 'center') === 'center',
      'text-left': block.align === 'left',
      'text-right': block.align === 'right'
    }"
  >
    <div
      class="inline-block max-w-full overflow-x-auto rounded-lg border border-slate-200 bg-white p-2.5 sm:p-4 [&_svg]:mx-auto [&_svg]:h-auto [&_svg]:max-w-full"
      v-html="sanitizedSvg(block.markup || block.svg?.svg || block.svg)"
    ></div>

    <figcaption
      v-if="block.caption"
      class="mt-1.5 text-[11px] leading-5 text-slate-500 sm:text-xs"
    >
      {{ block.caption }}
    </figcaption>
  </figure>

  <!-- ===================================================== -->
  <!-- CODE -->
  <!-- ===================================================== -->

  <div
    v-else-if="block.type === 'code'"
    class="mt-4 max-w-full overflow-hidden rounded-lg border border-slate-800 bg-slate-900 sm:mt-5"
  >
    <div
      v-if="block.title || block.language"
      class="flex min-w-0 items-center justify-between gap-3 border-b border-slate-700 bg-slate-800 px-3 py-2 sm:px-4"
    >
      <span class="min-w-0 truncate text-[11px] font-medium text-slate-300 sm:text-xs">
        {{ block.title || block.language }}
      </span>

      <span
        v-if="block.language"
        class="shrink-0 text-[10px] uppercase tracking-wide text-slate-500 sm:text-xs"
      >
        {{ block.language }}
      </span>
    </div>

    <pre class="max-w-full overflow-x-auto p-3 text-[11px] leading-5 sm:p-4 sm:text-[13px] sm:leading-6"><code
      class="hljs !bg-transparent"
      v-html="highlightedCode(block.code || block.text, block.language)"
    ></code></pre>
  </div>

  <!-- ===================================================== -->
  <!-- FORMULA / MATH -->
  <!-- ===================================================== -->

  <div
    v-else-if="block.type === 'formula' || block.type === 'math'"
    class="math-box mt-4 max-w-full overflow-x-auto rounded-lg border border-slate-200 bg-white px-3 py-4 sm:mt-5 sm:px-4 sm:py-5"
    :class="block.display === false ? 'text-left' : 'text-center'"
  >
    <p
      v-if="block.label"
      class="mb-2 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-500 sm:mb-3 sm:text-xs"
    >
      {{ block.label }}
    </p>

    <div
      class="text-slate-800"
      v-html="
        renderedMath(
          block.latex || block.formula,
          block.display !== false
        )
      "
    ></div>

    <p
      v-if="block.caption"
      class="mt-2 text-left text-[11px] leading-5 text-slate-500 sm:mt-3 sm:text-xs"
    >
      {{ block.caption }}
    </p>
  </div>

  <!-- ===================================================== -->
  <!-- CHEMISTRY -->
  <!-- ===================================================== -->

  <div
    v-else-if="block.type === 'chemistry'"
    class="math-box mt-4 max-w-full overflow-x-auto rounded-lg border border-slate-200 bg-white px-3 py-4 sm:mt-5 sm:px-4 sm:py-5"
    :class="block.display === false ? 'text-left' : 'text-center'"
  >
    <p
      v-if="block.label"
      class="mb-2 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-500 sm:mb-3 sm:text-xs"
    >
      {{ block.label }}
    </p>

    <div
      class="chemistry-formula text-slate-900"
      v-html="
        renderedMath(
          block.latex ||
          block.formula ||
          block.chemistry,
          block.display !== false
        )
      "
    ></div>

    <p
      v-if="block.caption"
      class="mt-2 text-left text-[11px] leading-5 text-slate-500 sm:mt-3 sm:text-xs"
    >
      {{ block.caption }}
    </p>
  </div>

  <!-- ===================================================== -->
  <!-- VIDEO -->
  <!-- ===================================================== -->

  <figure
    v-else-if="block.type === 'video'"
    class="mt-4 min-w-0 sm:mt-5"
  >
    <div
      v-if="isDirectVideo(block)"
      class="overflow-hidden rounded-lg border border-slate-200 bg-black"
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
      class="relative overflow-hidden rounded-lg border border-slate-200 bg-black"
      style="padding-top: 56.25%"
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
      class="rounded-lg border border-red-200 bg-red-50 px-3 py-3 text-xs text-red-700 sm:px-4 sm:text-sm"
    >
      Unsupported or unsafe video source.
    </div>

    <figcaption
      v-if="block.caption"
      class="mt-1.5 text-[11px] leading-5 text-slate-500 sm:text-xs"
    >
      {{ block.caption }}
    </figcaption>
  </figure>

  <!-- ===================================================== -->
  <!-- QUOTE -->
  <!-- ===================================================== -->

  <div
    v-else-if="block.type === 'quote'"
    class="mt-4 sm:mt-5"
  >
    <blockquote
      class="lesson-text border-l-4 border-slate-300 pl-3 text-[13px] italic leading-6 text-slate-600 sm:pl-4 sm:text-[15px] sm:leading-7"
      v-html="block.text_html || block.text"
    ></blockquote>

    <div
      v-if="block.math?.latex"
      class="math-box mt-3 overflow-x-auto rounded-lg bg-slate-50 px-3 py-3 sm:mt-4 sm:px-4"
    >
      <div
        class="flex min-w-max justify-center"
        v-html="
          renderedMath(
            block.math.latex,
            block.math.display !== false
          )
        "
      ></div>
    </div>
  </div>

  <!-- ===================================================== -->
  <!-- DIVIDER -->
  <!-- ===================================================== -->

  <hr
    v-else-if="block.type === 'divider'"
    class="my-6 border-slate-200 sm:my-8"
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
    class="mt-4 rounded-lg border px-3 py-3 sm:mt-5 sm:px-4 sm:py-4"
    :class="calloutClasses(block.style)"
  >
    <div class="flex items-start gap-2.5 sm:gap-3">
      <div
        class="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full sm:h-7 sm:w-7"
        :class="calloutIconClasses(block.style)"
      >
        <Icon
          :name="calloutIcon(block.style)"
          class="h-3.5 w-3.5 sm:h-4 sm:w-4"
        />
      </div>

      <div class="min-w-0 flex-1">
        <p
          v-if="block.title"
          class="mb-1 text-xs font-bold sm:text-sm"
          :class="calloutTitleClasses(block.style)"
        >
          {{ block.title }}
        </p>

        <div
          v-if="block.text_html || block.text"
          class="lesson-text text-[13px] leading-6 sm:text-[14px] sm:leading-7"
          :class="calloutTextClasses(block.style)"
          v-html="block.text_html || block.text"
        ></div>

        <div
          v-if="block.math?.latex"
          class="math-box mt-3 overflow-x-auto rounded-lg bg-white px-3 py-3 sm:mt-4 sm:px-4"
        >
          <div
            class="flex min-w-max justify-center"
            v-html="
              renderedMath(
                block.math.latex,
                block.math.display !== false
              )
            "
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
    class="mt-4 overflow-hidden rounded-lg border border-indigo-200 bg-indigo-50 sm:mt-5"
  >
    <div
      class="flex items-center gap-2 border-b border-indigo-200 bg-indigo-100 px-3 py-2.5 sm:px-4"
    >
      <div
        class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600"
      >
        <Icon
          name="lucide:badge-alert"
          class="h-3.5 w-3.5 text-white"
        />
      </div>

      <span class="text-xs font-bold text-indigo-900 sm:text-sm">
        {{ block.title || 'Important' }}
      </span>
    </div>

    <div
      class="px-3 py-3 text-[13px] leading-6 text-indigo-950 sm:px-4 sm:py-4 sm:text-[14px] sm:leading-7"
    >
      <div
        v-if="block.text_html || block.text"
        class="lesson-text"
        v-html="block.text_html || block.text"
      ></div>

      <div
        v-if="block.math?.latex"
        class="math-box mt-3 overflow-x-auto rounded-lg bg-white px-3 py-3 sm:mt-4 sm:px-4"
      >
        <div
          class="flex min-w-max justify-center"
          v-html="
            renderedMath(
              block.math.latex,
              block.math.display !== false
            )
          "
        ></div>
      </div>
    </div>
  </div>

  <!-- ===================================================== -->
  <!-- CHECKLIST -->
  <!-- ===================================================== -->

  <div
    v-else-if="block.type === 'checklist'"
    class="mt-5 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm sm:mt-6"
  >
    <div
      class="flex items-start justify-between gap-3 border-b border-slate-200 bg-slate-50 px-3 py-3 sm:px-4"
    >
      <div class="flex min-w-0 items-start gap-2">
        <div
          class="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10"
        >
          <Icon
            name="lucide:clipboard-check"
            class="h-4 w-4 text-navy"
          />
        </div>

        <div class="min-w-0">
          <p class="text-xs font-bold text-slate-800 sm:text-sm">
            Learning Checklist
          </p>

          <p class="mt-0.5 text-[11px] leading-5 text-slate-500 sm:text-xs">
            Check each skill you can confidently do.
          </p>
        </div>
      </div>

      <div class="shrink-0 text-right">
        <p class="text-xs font-bold text-navy sm:text-sm">
          {{ checkedCount }}/{{ checklistItems.length }}
        </p>

        <p class="text-[10px] text-slate-500 sm:text-[11px]">
          Completed
        </p>
      </div>
    </div>

    <div class="h-1 bg-slate-100">
      <div
        class="h-full bg-primary transition-all duration-300"
        :style="{ width: `${checklistProgress}%` }"
      ></div>
    </div>

    <div class="divide-y divide-slate-100">
      <label
        v-for="(item, index) in checklistItems"
        :key="item.key || index"
        class="flex cursor-pointer items-start gap-2.5 px-3 py-3 transition hover:bg-slate-50 sm:gap-3 sm:px-4 sm:py-3.5"
      >
        <input
          v-model="checkedItems[item.key || index]"
          type="checkbox"
          class="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-slate-300 text-navy focus:ring-navy/30"
        />

        <span
          class="text-[12px] leading-5 transition sm:text-[13px] sm:leading-6"
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
      class="border-t border-emerald-200 bg-emerald-50 px-3 py-3 sm:px-4"
    >
      <div class="flex items-start gap-2">
        <Icon
          name="lucide:circle-check"
          class="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 sm:h-5 sm:w-5"
        />

        <p class="text-xs font-semibold leading-5 text-emerald-800 sm:text-sm">
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
    class="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-3 text-xs text-red-700 sm:text-sm"
  >
    <div class="flex items-start gap-2 font-semibold">
      <Icon
        name="lucide:triangle-alert"
        class="mt-0.5 h-4 w-4 shrink-0"
      />

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
      <span class="text-xs text-red-600">
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
// CALLOUT STYLES
// =====================================================

function calloutClasses(style = 'info') {
  const classes = {
    info: 'border-blue-200 bg-blue-50',
    success: 'border-emerald-200 bg-emerald-50',
    warning: 'border-amber-200 bg-amber-50',
    danger: 'border-red-200 bg-red-50',
    neutral: 'border-slate-200 bg-slate-50',
    purple: 'border-purple-200 bg-purple-50'
  }

  return classes[style] || classes.info
}

function calloutIconClasses(style = 'info') {
  const classes = {
    info: 'bg-blue-100 text-blue-700',
    success: 'bg-emerald-100 text-emerald-700',
    warning: 'bg-amber-100 text-amber-700',
    danger: 'bg-red-100 text-red-700',
    neutral: 'bg-slate-100 text-slate-700',
    purple: 'bg-purple-100 text-purple-700'
  }

  return classes[style] || classes.info
}

function calloutTitleClasses(style = 'info') {
  const classes = {
    info: 'text-blue-800',
    success: 'text-emerald-800',
    warning: 'text-amber-800',
    danger: 'text-red-800',
    neutral: 'text-slate-800',
    purple: 'text-purple-800'
  }

  return classes[style] || classes.info
}

function calloutTextClasses(style = 'info') {
  const classes = {
    info: 'text-blue-900',
    success: 'text-emerald-900',
    warning: 'text-amber-900',
    danger: 'text-red-900',
    neutral: 'text-slate-700',
    purple: 'text-purple-900'
  }

  return classes[style] || classes.info
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

<style>
/* =====================================================
   GENERAL RESPONSIVE CONTENT
===================================================== */

.lesson-text {
  max-width: 100%;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.lesson-text :deep(p) {
  margin-bottom: 0.65rem;
}

.lesson-text :deep(p:last-child) {
  margin-bottom: 0;
}

.lesson-text :deep(strong),
.lesson-text :deep(b) {
  font-weight: 700;
  color: #1e293b;
}

.lesson-text :deep(a) {
  overflow-wrap: anywhere;
  word-break: break-word;
  color: #1d4ed8;
  text-decoration: underline;
}

.lesson-text :deep(ul),
.lesson-text :deep(ol) {
  margin: 0.65rem 0;
  padding-left: 1.25rem;
}

.lesson-text :deep(li) {
  margin-bottom: 0.25rem;
}

.lesson-text :deep(img) {
  display: block;
  width: auto;
  max-width: 100%;
  height: auto;
  margin: 0.75rem auto;
  border-radius: 0.5rem;
}

.lesson-text :deep(table) {
  display: block;
  width: 100%;
  max-width: 100%;
  overflow-x: auto;
  border-collapse: collapse;
}

.lesson-text :deep(pre) {
  max-width: 100%;
  overflow-x: auto;
  white-space: pre;
}

.lesson-text :deep(code) {
  overflow-wrap: anywhere;
  word-break: break-word;
}

.lesson-text :deep(iframe) {
  max-width: 100%;
}

.lesson-text :deep(video) {
  max-width: 100%;
  height: auto;
}

.lesson-text :deep(blockquote) {
  margin: 0.75rem 0;
  border-left: 3px solid #cbd5e1;
  padding-left: 0.75rem;
  color: #64748b;
  font-style: italic;
}

/* =====================================================
   MATH / KATEX
===================================================== */

.math-box {
  max-width: 100%;
  -webkit-overflow-scrolling: touch;
}

.katex-display {
  max-width: 100%;
  margin: 0 !important;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 0.35rem 0;
  -webkit-overflow-scrolling: touch;
}

.katex {
  font-size: 1em;
}

.katex-display .katex {
  max-width: 100%;
}

.katex .bmatrix,
.katex .pmatrix,
.katex .vmatrix {
  font-size: 1em;
}

.chemistry-formula .katex {
  font-size: 1em;
}

/* =====================================================
   MOBILE FONT ADJUSTMENTS
===================================================== */

@media (max-width: 640px) {
  .katex {
    font-size: 0.95em;
  }

  .katex-display {
    padding-left: 0.15rem;
    padding-right: 0.15rem;
  }

  .lesson-text :deep(h1) {
    font-size: 1.15rem;
    line-height: 1.35;
  }

  .lesson-text :deep(h2) {
    font-size: 1rem;
    line-height: 1.4;
  }

  .lesson-text :deep(h3) {
    font-size: 0.95rem;
    line-height: 1.45;
  }

  .lesson-text :deep(p) {
    margin-bottom: 0.55rem;
  }

  .lesson-text :deep(ul),
  .lesson-text :deep(ol) {
    padding-left: 1.1rem;
  }
}

/* =====================================================
   SCROLLBARS
===================================================== */

.math-box::-webkit-scrollbar,
.lesson-text::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}

.math-box::-webkit-scrollbar-thumb,
.lesson-text::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: rgba(100, 116, 139, 0.3);
}
</style>