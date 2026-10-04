# Translation brief: 《梦与非梦》 into English (Part One and Part Two)

## The game
A Chinese text adventure. The player is Wang Hongwen (1935–1992), a security-section cadre at Shanghai's No. 17 State Cotton Mill who became a rebel leader in 1966 and Vice Chairman of the Party in 1973. The game runs from 1966 to 1978 (plus a prologue in 1957 and epilogues), in a frame where an older Wang dreams in Qincheng prison. It mixes historical scenes with "IF" branches that did not happen. It has scene text, choices, short notes on what a choice meant, glossary pop-ups, historical source notes, ending summaries, and UI strings. English title: "Dream and Not Dream". Readers are English speakers who know nothing about the Cultural Revolution.

## What you get
A JSON file of segments `[{id, src}]`, in the order they appear in the game's source code. Consecutive segments are usually from the same scene, so read neighbours for context. Segments come from JavaScript strings. Some are whole paragraphs with HTML, some are tiny UI labels, some are sentence fragments that the code joins with other strings or variables.

## Rules (strict)
1. **Placeholders** `⟦0⟧`, `⟦1⟧`… stand for code that inserts text (a name, a number, another sentence, or an empty string). Keep every placeholder exactly once. You may move it to where English grammar needs it. Assume it can be empty if the surrounding text suggests an optional sentence.
2. **HTML**: keep every tag and attribute exactly (`<p>`, `<b>`, `<span class="tag hist">`, `<button …>` etc.). Translate only human-readable text, including the values of `aria-label`, `alt`, `title`. Do not add or remove tags.
3. **Whitespace**: keep leading/trailing spaces and the full-width space `　` (U+3000) where they are; they are separators in the UI.
4. **Terms**: use `glossary.json` (same folder, a plain object Chinese → English) and follow `STYLE_EN.md` (same folder; it overrides anything here). For every Chinese term in the glossary, use the English given there, verbatim (capitalization too; plurals are fine, e.g. "Scarlet Guards" for "Scarlet Guard"). Names are pinyin, family name first. Short UI strings that are a single term must be exactly the term.
5. **Identical source, identical translation**: the same Chinese string appears only once in your file, but it may be used in several places, including code comparisons. Translate single words and place names as plain canonical English.
6. **Style**: plain, direct, concrete English. Short sentences. Past tense for narration where the Chinese is narrative; second person "you" for the player. No em dashes or en dashes at all (use commas, periods, or parentheses). No colons that introduce a list. Avoid "not X but Y" / "rather than" constructions where you can restate positively. No exclamation marks unless the Chinese has them inside quoted speech. No flourish, no added explanation. American spelling.
7. **Dialogue**: Chinese often reports speech without quotation marks ("他说，要开，先投票。"). Keep that indirect, spare feel: "He said, if we open it, we vote first." Use curly quotes “ ” for quotations and titles of slogans.
8. **Dates and numbers**: 1966年11月10日 → November 10, 1966. 一九七六年 → 1976. Chinese numerals → digits for years, dates, money, counts above ten; small counts can be words.
9. **Source notes** (史料注): tags `史实` History, `虚构` Fiction, `有争议` Disputed, `复原` Reconstruction; `转述` → "(paraphrased)"; `搜索摘要` → "(search summary)". Cite books as Author, English title in quotes, then the Chinese title in 《》 in parentheses, e.g. Huang Jinhai, “Ten Years Not a Dream” (《十年非梦》), ch. 9 (paraphrased). Keep Chinese only inside such 《》 parentheses.
10. Don't translate code-like strings (CSS class names, keys, URLs). If a segment is not human text, return it unchanged.

## Output
Write a JSON object `{"id": "translation", …}` (ids as strings) to the output path you were given. Every id must be present. Then run:
`node /tmp/claude-0/-home-claude-meng-yu-feimeng/47f2e633-ca49-5a48-aa0c-095ee4f26bc8/scratchpad/en/check.js <chunk file> <output file>`
and fix everything it reports until it prints OK. Reply with one line when done, plus any term you had to invent that is not in glossary.json (Chinese → English), so it can be made consistent.

## Part Two chunks
Chunks under `chunks2/` come from Part Two (1979 to 1989, a governing game with policy cards, votes, a yearly communiqué and an internal bulletin). Same rules. Faction and dimension names, world names and card titles are in the glossary. Communiqué lines (gb) are official Party language, translate them in the stiff official register of Peking Review. Internal bulletin lines (nc) are blunt and factual.
