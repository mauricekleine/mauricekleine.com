#!/usr/bin/env python3
"""Show date-derived older/newer essay links used by the React EssayNav.

Navigation is computed at render time, so this command does not rewrite the
content files. It remains available as an authoring check after an import.
"""

from essay_content import essays


def main():
    records = essays()
    for i, essay in enumerate(records):
        older = records[i + 1]["slug"] if i + 1 < len(records) else "-"
        newer = records[i - 1]["slug"] if i else "-"
        print(f'{essay["slug"]}: older={older} newer={newer}')


if __name__ == "__main__":
    main()
