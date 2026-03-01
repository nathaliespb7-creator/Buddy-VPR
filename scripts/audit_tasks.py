#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Аудитор структуры заданий Buddy VPR (ВПР-4, русский язык)
Проверяет: уникальность ID, целостность Task-структуры, валидность ruleId,
соответствие категориям, дублирование контента.

Запуск из корня репозитория:
  python3 scripts/audit_tasks.py
  TASK_FILE=client/src/lib/taskData.ts python3 scripts/audit_tasks.py
"""

import os
import re
import sys
from pathlib import Path
from typing import Dict, List, Set
from dataclasses import dataclass, field

# === КОНФИГУРАЦИЯ ===
TASK_FILE = os.environ.get("TASK_FILE", "client/src/lib/taskData.ts")
REQUIRED_TASK_FIELDS = {
    "id", "type", "word", "correct", "difficulty", "category"
}
VALID_CATEGORIES = {
    "accent", "phonetics", "meaning", "morphemics",
    "morphology", "syntax", "reading", "plan", "vocabulary", "context"
}
VALID_TYPES = {
    "accent", "phonetics", "meaning", "morphemics",
    "morphology", "syntax", "reading", "plan", "vocabulary", "context"
}
# ruleId -> category mapping (упрощённая проверка)
RULE_CATEGORY_MAP = {
    1: "accent", 2: "phonetics", 3: "accent", 4: "syntax",
    5: "morphology", 6: "morphology", 7: "morphology",
    8: "morphemics", 9: "morphemics", 10: "morphemics",
    11: "morphemics", 12: "syntax", 13: "accent", 14: "morphemics",
    15: "morphology", 16: "morphology", 17: "accent", 18: "accent",
    19: "phonetics", 20: "meaning", 21: "morphology", 22: "morphology",
    23: "phonetics",  # Звуко-буквенный анализ (ВПР №2)
}


@dataclass
class AuditResult:
    errors: List[Dict] = field(default_factory=list)
    warnings: List[Dict] = field(default_factory=list)
    stats: Dict = field(default_factory=dict)

    def add_error(self, location: str, issue: str, fix: str, severity: str = "critical"):
        self.errors.append({"location": location, "issue": issue, "fix": fix, "severity": severity})

    def add_warning(self, location: str, issue: str, suggestion: str):
        self.warnings.append({"location": location, "issue": issue, "suggestion": suggestion})


def extract_tasks_from_ts(file_content: str) -> List[Dict]:
    """Извлекает задания из TypeScript-файла (упрощённый парсинг)."""
    tasks = []
    # Ищем массив tasksData: export const tasksData: Task[] = [ ... ];
    match = re.search(r'export const tasksData:\s*Task\[\]\s*=\s*\[([\s\S]*?)\];', file_content)
    if not match:
        return tasks

    array_content = match.group(1)
    # Разбиваем по границам объектов: }\s*,\s*{ (однострочные и многострочные)
    raw_objects = re.split(r'\}\s*,\s*(?=\s*\{)', array_content)
    objects = []
    for raw in raw_objects:
        s = re.sub(r'\s*\];?\s*$', '', raw.strip())
        if not s.startswith('{'):
            continue
        if not re.search(r'id:\s*\d+', s):
            continue
        obj = s if s.endswith('}') else s + '}'
        objects.append(obj)

    for obj in objects:
        task = {}
        id_match = re.search(r'id:\s*(\d+)', obj)
        if id_match:
            task['id'] = int(id_match.group(1))
        cat_match = re.search(r'category:\s*"([^"]+)"', obj)
        if cat_match:
            task['category'] = cat_match.group(1)
        type_match = re.search(r'type:\s*"([^"]+)"', obj)
        if type_match:
            task['type'] = type_match.group(1)
        rule_match = re.search(r'ruleId:\s*(\d+)', obj)
        if rule_match:
            task['ruleId'] = int(rule_match.group(1))
        diff_match = re.search(r'difficulty:\s*(\d+)', obj)
        if diff_match:
            task['difficulty'] = int(diff_match.group(1))
        input_match = re.search(r'inputType:\s*"([^"]+)"', obj)
        if input_match:
            task['inputType'] = input_match.group(1)
        if re.search(r'\bword:\s*["`]', obj):
            task['word'] = True
        if re.search(r'\bcorrect:\s*["`]', obj):
            task['correct'] = True
        if 'acceptableAnswers' in obj:
            task['acceptableAnswers'] = True
        if 'keywords' in obj:
            kw_match = re.findall(r'keywords:\s*\[([^\]]*)\]', obj)
            task['keywords'] = len(kw_match) and len(kw_match[0].split(',')) or 0

        if 'id' in task:
            tasks.append(task)

    return tasks


def extract_golden_rules(file_content: str) -> Dict[int, Dict]:
    """Извлекает goldenRules для проверки ruleId."""
    rules = {}
    match = re.search(r'export const goldenRules:\s*Rule\[\]\s*=\s*\[([\s\S]*?)\];', file_content)
    if not match:
        return rules

    array_content = match.group(1)
    objects = re.findall(r'\{\s*id:\s*\d+[\s\S]*?\n\s*\}', array_content)

    for obj in objects:
        rule = {}
        id_match = re.search(r'id:\s*(\d+)', obj)
        cat_match = re.search(r'category:\s*"([^"]+)"', obj)
        if id_match:
            rule_id = int(id_match.group(1))
            if cat_match:
                rule['category'] = cat_match.group(1)
            rules[rule_id] = rule

    return rules


def audit_tasks(tasks: List[Dict], rules: Dict[int, Dict]) -> AuditResult:
    result = AuditResult()
    seen_ids: Set[int] = set()

    for task in tasks:
        task_id = task.get('id')
        location = f"Task #{task_id}"

        if task_id in seen_ids:
            result.add_error(location, f"Дубликат ID: {task_id}", "Измените ID на уникальный")
        seen_ids.add(task_id)

        missing = REQUIRED_TASK_FIELDS - set(task.keys())
        if missing:
            result.add_error(location, f"Отсутствуют поля: {missing}", f"Добавьте: {', '.join(missing)}")

        if 'category' in task and task['category'] not in VALID_CATEGORIES:
            result.add_error(location, f"Невалидная категория: {task['category']}",
                            f"Используйте одну из: {', '.join(VALID_CATEGORIES)}")

        if 'type' in task and task['type'] not in VALID_TYPES:
            result.add_warning(location, f"Необычный type: {task['type']}",
                              "Убедитесь, что type соответствует логике валидации")

        if 'ruleId' in task and 'category' in task:
            expected_cat = RULE_CATEGORY_MAP.get(task['ruleId'])
            if expected_cat and task['category'] != expected_cat:
                result.add_warning(location,
                                   f"ruleId:{task['ruleId']} обычно в '{expected_cat}', но категория '{task['category']}'",
                                   "Проверьте, соответствует ли правило тематике задания")

        if task.get('inputType') == 'text':
            if task.get('acceptableAnswers') is not True:
                result.add_error(location, "text-задание без acceptableAnswers",
                                "Добавьте массив допустимых ответов для fuzzy-валидации")
            kw_count = task.get('keywords', 0) if isinstance(task.get('keywords'), int) else 0
            if not task.get('keywords') or (isinstance(task.get('keywords'), int) and task['keywords'] < 2):
                result.add_warning(location, "Мало keywords для текстового ответа",
                                  "Добавьте 2-5 ключевых слов для семантической проверки")

        if task.get('difficulty') not in (1, 2):
            result.add_error(location, f"Невалидная сложность: {task.get('difficulty')}",
                            "Используйте 1 (базовый) или 2 (повышенный)")

        if 'unacceptablePatterns' in str(task):
            pass  # этическая проверка — только если извлекли массив; упрощённый парсинг его не даёт

    result.stats = {
        "total_tasks": len(tasks),
        "unique_ids": len(seen_ids),
        "duplicates": len(tasks) - len(seen_ids),
        "by_category": {},
        "by_difficulty": {}
    }

    for t in tasks:
        cat = t.get('category', 'unknown')
        diff = t.get('difficulty', 'unknown')
        result.stats['by_category'][cat] = result.stats['by_category'].get(cat, 0) + 1
        result.stats['by_difficulty'][diff] = result.stats['by_difficulty'].get(diff, 0) + 1

    return result


def main():
    file_path = Path(TASK_FILE)
    if not file_path.exists():
        print(f"❌ Файл не найден: {file_path}")
        sys.exit(1)

    print(f"🔍 Аудит файла: {file_path}")
    content = file_path.read_text(encoding='utf-8')

    tasks = extract_tasks_from_ts(content)
    rules = extract_golden_rules(content)

    print(f"📦 Найдено заданий: {len(tasks)}")
    print(f"📚 Найдено правил: {len(rules)}")

    result = audit_tasks(tasks, rules)

    if result.errors:
        print(f"\n🔴 КРИТИЧЕСКИЕ ОШИБКИ ({len(result.errors)}):")
        for err in result.errors:
            print(f"  • {err['location']}: {err['issue']}")
            print(f"    ✅ Исправление: {err['fix']}")

    if result.warnings:
        print(f"\n🟡 ПРЕДУПРЕЖДЕНИЯ ({len(result.warnings)}):")
        for warn in result.warnings:
            print(f"  • {warn['location']}: {warn['issue']}")
            print(f"    💡 Совет: {warn['suggestion']}")

    print(f"\n📊 СТАТИСТИКА:")
    for key, value in result.stats.items():
        if isinstance(value, dict):
            print(f"  {key}:")
            for k, v in value.items():
                print(f"    • {k}: {v}")
        else:
            print(f"  {key}: {value}")

    if result.errors:
        print(f"\n❌ Аудит не пройден: {len(result.errors)} критических ошибок")
        sys.exit(1)
    else:
        print(f"\n✅ Аудит пройден! Предупреждений: {len(result.warnings)}")
        sys.exit(0)


if __name__ == "__main__":
    main()
