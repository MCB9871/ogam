type LexicalNode = {
  type?: string
  text?: string
  children?: LexicalNode[]
}

function extractText(node: LexicalNode | undefined): string {
  if (!node) return ''
  let out = node.text ?? ''
  if (node.children) {
    for (const child of node.children) {
      out += ' ' + extractText(child)
    }
  }
  return out
}

// Vitesse de lecture moyenne en français, arrondie prudemment (~200 mots/min).
const WORDS_PER_MINUTE = 200

export function estimateReadingTime(content: unknown): number {
  const root = (content as { root?: LexicalNode })?.root
  const text = extractText(root)
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(wordCount / WORDS_PER_MINUTE))
}
