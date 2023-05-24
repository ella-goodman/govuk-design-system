const { marked } = require('marked')
const { gfmHeadingId } = require('marked-gfm-heading-id')

// mangle will default to false in future versions of marked.
// Explicitly set it to avoid deprecation warnings
marked.use({
  mangle: false
})

// headerIds and headerPrefix are enabled by default, but deprecated since
// marked 5.0.0. Use recommended plugin instead
marked.use(gfmHeadingId())

/**
 * Custom markdown renderer
 */
class DesignSystemRenderer extends marked.Renderer {
  /**
   * Assume HTML when no code block language provided
   * (for example, HTML code inside Markdown)
   */
  code (code, language, isEscaped) {
    return !language
      ? super.html(code)
      : super.code(code, language, isEscaped)

        // Ensure code blocks can be focused and scrolled
        // with the keyboard via `tabindex="0"`
        .replace('<code', '<code tabindex="0"')
  }

  /**
   * Avoid wrapping `<img>` image tags in `<p>` paragraphs
   */
  paragraph (text) {
    return text.trim().startsWith('<img')
      ? super.html(`${text}\n`)
      : super.paragraph(text)
  }
}

module.exports = DesignSystemRenderer
