#!/usr/bin/env python3
"""Branding verification utility for Dify-Plus white-label projects."""

from __future__ import annotations

import argparse
import json
import re
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

DEFAULT_ALLOWED_PATTERNS = [
    r"LICENSE",
    r"NOTICE",
    r"README_DIFY\.md",
    r"third_party",
    r"node_modules",
    r"\.git",
]

TARGET_ENDPOINTS = ["/api/version", "/api/console/api/status"]
HEADER_BLACKLIST = {"x-dify-version", "x-dify-env"}
TEXT_BLACKLIST = ["dify", "dify-plus"]


@dataclass
class CheckResult:
    name: str
    passed: bool
    details: str


def collect_files(root: Path) -> Iterable[Path]:
    for path in root.rglob("*"):
        if not path.is_file():
            continue
        if any(part in {".git", "node_modules", "dist", ".next", "venv", ".venv"} for part in path.parts):
            continue
        yield path


def is_allowed(path: Path, allow_patterns: list[re.Pattern[str]]) -> bool:
    normalized = str(path).replace("\\", "/")
    return any(pattern.search(normalized) for pattern in allow_patterns)


def scan_source(root: Path, allow_patterns: list[re.Pattern[str]]) -> CheckResult:
    hits: list[str] = []
    for path in collect_files(root):
        rel = path.relative_to(root)
        if is_allowed(rel, allow_patterns):
            continue
        try:
            text = path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            continue

        lowered = text.lower()
        if "dify" in lowered:
            hits.append(str(rel))
            if len(hits) >= 50:
                break

    if hits:
        preview = "\n".join(f"- {item}" for item in hits)
        return CheckResult("代码库残留扫描", False, f"发现未豁免的 Dify 标识:\n{preview}")
    return CheckResult("代码库残留扫描", True, "未发现未豁免的 Dify 标识。")


def check_favicon(root: Path) -> CheckResult:
    paths = [root / "web/public/favicon.ico", root / "admin/web/public/favicon.ico"]
    missing = [str(p.relative_to(root)) for p in paths if not p.exists()]
    if missing:
        return CheckResult("Favicon 文件", False, f"缺失 favicon: {', '.join(missing)}")
    return CheckResult("Favicon 文件", True, "前后端 favicon 文件均存在。")


def check_compose(root: Path) -> CheckResult:
    compose = root / "docker-compose.yml"
    if not compose.exists():
        return CheckResult("Compose 容器命名", False, "未找到 docker-compose.yml")
    text = compose.read_text(encoding="utf-8", errors="ignore").lower()
    if "container_name:" in text and "dify" in text:
        return CheckResult("Compose 容器命名", False, "docker-compose.yml 中仍包含 dify 容器名。")
    return CheckResult("Compose 容器命名", True, "容器命名未发现 dify。")


def check_runtime(api_base: str) -> list[CheckResult]:
    results: list[CheckResult] = []
    for endpoint in TARGET_ENDPOINTS:
        url = f"{api_base.rstrip('/')}{endpoint}"
        req = Request(url, headers={"User-Agent": "branding-verifier/1.0"})
        try:
            with urlopen(req, timeout=8) as resp:
                headers = {k.lower(): v for k, v in resp.headers.items()}
                body = resp.read().decode("utf-8", errors="ignore")
        except HTTPError as exc:
            headers = {k.lower(): v for k, v in exc.headers.items()}
            body = exc.read().decode("utf-8", errors="ignore")
        except URLError as exc:
            results.append(CheckResult(f"运行时接口 {endpoint}", False, f"请求失败: {exc}"))
            continue

        bad_headers = sorted(h for h in headers if h in HEADER_BLACKLIST)
        if headers.get("server", "").lower().startswith("dify"):
            bad_headers.append("server:dify")

        bad_text = [word for word in TEXT_BLACKLIST if word in body.lower()]
        if bad_headers or bad_text:
            details = {
                "headers": bad_headers,
                "body_keywords": bad_text,
            }
            results.append(CheckResult(f"运行时接口 {endpoint}", False, json.dumps(details, ensure_ascii=False)))
        else:
            results.append(CheckResult(f"运行时接口 {endpoint}", True, "响应头与响应体未发现 Dify 标识。"))

    return results


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="验证品牌化改造是否去除 Dify 标识")
    parser.add_argument("--repo-root", default=".", help="仓库根目录")
    parser.add_argument("--api-base", default="", help="可选，运行时 API 基地址，例如 http://localhost:5001")
    parser.add_argument("--strict", action="store_true", help="严格模式：只要有失败即返回非 0")
    parser.add_argument("--allow", action="append", default=[], help="额外豁免路径正则")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    root = Path(args.repo_root).resolve()
    allow_patterns = [re.compile(p) for p in [*DEFAULT_ALLOWED_PATTERNS, *args.allow]]

    checks = [
        scan_source(root, allow_patterns),
        check_favicon(root),
        check_compose(root),
    ]

    if args.api_base:
        checks.extend(check_runtime(args.api_base))

    has_fail = False
    for item in checks:
        icon = "[PASS]" if item.passed else "[FAIL]"
        print(f"{icon} {item.name}: {item.details}")
        has_fail = has_fail or (not item.passed)

    if has_fail and args.strict:
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
