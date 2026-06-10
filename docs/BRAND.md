# Marca Movy — referência de implementação

Tokens derivados do **Movy Education Brand Guide 2026**. Fonte de verdade no código:
`app/globals.css` (`:root`) e `tailwind.config.ts` (`theme.extend`).

> Regra de manutenção: toda interface nova deve usar estes tokens oficiais da Movy.
> Não criar paletas paralelas, fontes alternativas ou acentos fora deste guia.

## Paleta

| Token | Hex | Uso |
|-------|-----|-----|
| `--movy-purple` | `#4B1A77` | Roxo primário (links, acentos, pills) |
| `--movy-purple-mid` | `#3A1560` | Roxo intermediário |
| `--movy-purple-deep` | `#2A1153` | Superfícies escuras, títulos, botões primários |
| `--movy-purple-deeper` | `#190A38` | Fundo profundo (ex.: login) |
| `--movy-gold` | `#FBB615` | Destaque / acento da marca ("Education", CTAs) |
| `--movy-gold-soft` | `#FFC51C` | Dourado suave |
| `--movy-orange` | `#F36B1C` | Acento quente secundário |
| `--movy-red` | `#D23B2B` | Estados de perigo / remoção |
| `--movy-ink` | `#1C1233` | Texto principal |
| `--movy-ink-soft` | `#5A4E72` | Texto secundário / muted |
| `--movy-paper` | `#F8F7FB` | Fundo de página |
| `--movy-lilac` | `#EFE9F6` | Superfície clara |
| `--movy-lilac-2` | `#E6DCF3` | Superfície clara 2 |
| `--movy-line` | `#E0D6EE` | Bordas |

Neutros em inline styles usam `rgba(28,18,51,α)` (ink) e roxo `rgba(75,26,119,α)`.

## Tipografia

| Função | Fonte | Peso |
|--------|-------|------|
| Display / títulos / UI | **Outfit** | 500–800 |
| Corpo / leitura | **Manrope** | 400–700 |
| Labels / mono / kickers | **Space Mono** | 400/700 |

Carregadas via Google Fonts em `app/globals.css`. No Tailwind: `font-sans` (Manrope),
`font-display` (Outfit), `font-mono` (Space Mono).

## Wordmark

"MOVY" + "EDUCATION" em Outfit 800. No documento de proposta, "Education" recebe a cor
dourada (`--movy-gold`). Slogan oficial: **"We move people."**

## Princípios

- Movy é sobre movimento — "moving abroad, moving forward".
- Dourado é acento, não cor de fundo dominante. Roxo profundo carrega as superfícies
  escuras; lilás/papel as claras.
- Em PDF, sempre `print-color-adjust: exact` para preservar fundos coloridos.
