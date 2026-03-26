-- DISCLAIMER: This script is created by AI (Github Copilot).

-- seed_snippets.sql
-- Idempotent seed file for typing race snippets.
-- Safe to re-run: uses WHERE NOT EXISTS to skip duplicates.
-- Run with: make seed-snippets

BEGIN;

-- =============================================================================
-- PYTHON (slug: python) — 25 snippets
-- =============================================================================

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'python', 'Variable swap', 1, 'a, b = b, a
print(a, b)', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'python' AND title = 'Variable swap' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'python', 'Greeting function', 1, 'def greet(name):
    return f"Hello, {name}!"', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'python' AND title = 'Greeting function' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'python', 'Square function', 1, 'def square(x):
    return x * x', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'python' AND title = 'Square function' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'python', 'Max of two', 1, 'def max_of_two(a, b):
    if a > b:
        return a
    return b', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'python' AND title = 'Max of two' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'python', 'Is even', 1, 'def is_even(n):
    return n % 2 == 0', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'python' AND title = 'Is even' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'python', 'Sum of list', 2, 'def sum_list(nums):
    total = 0
    for n in nums:
        total += n
    return total', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'python' AND title = 'Sum of list' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'python', 'Count vowels', 2, 'def count_vowels(s):
    count = 0
    for c in s.lower():
        if c in "aeiou":
            count += 1
    return count', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'python' AND title = 'Count vowels' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'python', 'Reverse string', 2, 'def reverse(s):
    return s[::-1]', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'python' AND title = 'Reverse string' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'python', 'Factorial', 2, 'def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'python' AND title = 'Factorial' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'python', 'List filter', 2, 'def evens(nums):
    return [n for n in nums if n % 2 == 0]', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'python' AND title = 'List filter' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'python', 'Fibonacci', 3, 'def fib(n):
    a, b = 0, 1
    for _ in range(n):
        a, b = b, a + b
    return a', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'python' AND title = 'Fibonacci' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'python', 'Binary search', 3, 'def binary_search(arr, target):
    lo, hi = 0, len(arr) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'python' AND title = 'Binary search' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'python', 'Dict invert', 3, 'def invert(d):
    return {v: k for k, v in d.items()}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'python' AND title = 'Dict invert' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'python', 'Palindrome check', 3, 'def is_palindrome(s):
    clean = s.lower().replace(" ", "")
    return clean == clean[::-1]', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'python' AND title = 'Palindrome check' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'python', 'Flatten list', 3, 'def flatten(lst):
    result = []
    for item in lst:
        if isinstance(item, list):
            result.extend(flatten(item))
        else:
            result.append(item)
    return result', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'python' AND title = 'Flatten list' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'python', 'Word frequency', 4, 'def word_freq(text):
    freq = {}
    for word in text.split():
        freq[word] = freq.get(word, 0) + 1
    return freq', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'python' AND title = 'Word frequency' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'python', 'Merge sorted lists', 4, 'def merge(a, b):
    result = []
    i = j = 0
    while i < len(a) and j < len(b):
        if a[i] <= b[j]:
            result.append(a[i])
            i += 1
        else:
            result.append(b[j])
            j += 1
    return result + a[i:] + b[j:]', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'python' AND title = 'Merge sorted lists' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'python', 'Matrix transpose', 4, 'def transpose(matrix):
    return [list(row) for row in zip(*matrix)]', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'python' AND title = 'Matrix transpose' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'python', 'Group by key', 4, 'def group_by(items, key):
    groups = {}
    for item in items:
        k = key(item)
        groups.setdefault(k, []).append(item)
    return groups', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'python' AND title = 'Group by key' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'python', 'Decorator timer', 4, 'def timer(fn):
    def wrapper(*args, **kwargs):
        start = time.time()
        result = fn(*args, **kwargs)
        print(f"{time.time() - start:.2f}s")
        return result
    return wrapper', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'python' AND title = 'Decorator timer' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'python', 'LRU cache', 5, 'class LRUCache:
    def __init__(self, cap):
        self.cap = cap
        self.cache = {}
        self.order = []

    def get(self, key):
        if key in self.cache:
            self.order.remove(key)
            self.order.append(key)
            return self.cache[key]
        return -1', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'python' AND title = 'LRU cache' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'python', 'Context manager', 5, 'class FileManager:
    def __init__(self, path, mode):
        self.path = path
        self.mode = mode

    def __enter__(self):
        self.file = open(self.path, self.mode)
        return self.file

    def __exit__(self, *args):
        self.file.close()', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'python' AND title = 'Context manager' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'python', 'Generator range', 5, 'def custom_range(start, stop, step=1):
    current = start
    while current < stop:
        yield current
        current += step', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'python' AND title = 'Generator range' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'python', 'Memoize decorator', 5, 'def memoize(fn):
    cache = {}
    def wrapper(*args):
        if args not in cache:
            cache[args] = fn(*args)
        return cache[args]
    return wrapper', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'python' AND title = 'Memoize decorator' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'python', 'Chunk list', 5, 'def chunk(lst, size):
    return [lst[i:i + size] for i in range(0, len(lst), size)]', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'python' AND title = 'Chunk list' AND source_label = 'seed');

-- =============================================================================
-- JAVASCRIPT (slug: javascript) — 25 snippets
-- =============================================================================

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'javascript', 'Add function', 1, 'function add(a, b) {
  return a + b;
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'javascript' AND title = 'Add function' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'javascript', 'Arrow greet', 1, 'const greet = (name) => {
  return `Hello, ${name}!`;
};', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'javascript' AND title = 'Arrow greet' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'javascript', 'Max of two', 1, 'function max(a, b) {
  if (a > b) {
    return a;
  }
  return b;
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'javascript' AND title = 'Max of two' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'javascript', 'Is even', 1, 'function isEven(n) {
  return n % 2 === 0;
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'javascript' AND title = 'Is even' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'javascript', 'Square', 1, 'const square = (x) => x * x;', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'javascript' AND title = 'Square' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'javascript', 'Sum array', 2, 'function sum(nums) {
  let total = 0;
  for (const n of nums) {
    total += n;
  }
  return total;
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'javascript' AND title = 'Sum array' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'javascript', 'Reverse string', 2, 'function reverse(str) {
  return str.split("").reverse().join("");
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'javascript' AND title = 'Reverse string' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'javascript', 'Factorial', 2, 'function factorial(n) {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'javascript' AND title = 'Factorial' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'javascript', 'Filter evens', 2, 'function evens(nums) {
  return nums.filter((n) => n % 2 === 0);
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'javascript' AND title = 'Filter evens' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'javascript', 'Count chars', 2, 'function countChar(str, ch) {
  let count = 0;
  for (const c of str) {
    if (c === ch) count++;
  }
  return count;
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'javascript' AND title = 'Count chars' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'javascript', 'Fibonacci', 3, 'function fib(n) {
  let a = 0, b = 1;
  for (let i = 0; i < n; i++) {
    [a, b] = [b, a + b];
  }
  return a;
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'javascript' AND title = 'Fibonacci' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'javascript', 'Palindrome', 3, 'function isPalindrome(str) {
  const s = str.toLowerCase();
  let l = 0, r = s.length - 1;
  while (l < r) {
    if (s[l] !== s[r]) return false;
    l++;
    r--;
  }
  return true;
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'javascript' AND title = 'Palindrome' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'javascript', 'Flatten array', 3, 'function flatten(arr) {
  const result = [];
  for (const item of arr) {
    if (Array.isArray(item)) {
      result.push(...flatten(item));
    } else {
      result.push(item);
    }
  }
  return result;
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'javascript' AND title = 'Flatten array' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'javascript', 'Unique values', 3, 'function unique(arr) {
  return [...new Set(arr)];
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'javascript' AND title = 'Unique values' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'javascript', 'Deep clone', 3, 'function deepClone(obj) {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }
  const clone = Array.isArray(obj) ? [] : {};
  for (const key in obj) {
    clone[key] = deepClone(obj[key]);
  }
  return clone;
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'javascript' AND title = 'Deep clone' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'javascript', 'Debounce', 4, 'function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'javascript' AND title = 'Debounce' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'javascript', 'Throttle', 4, 'function throttle(fn, limit) {
  let last = 0;
  return function (...args) {
    const now = Date.now();
    if (now - last >= limit) {
      last = now;
      fn.apply(this, args);
    }
  };
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'javascript' AND title = 'Throttle' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'javascript', 'Group by', 4, 'function groupBy(arr, key) {
  return arr.reduce((groups, item) => {
    const k = item[key];
    (groups[k] = groups[k] || []).push(item);
    return groups;
  }, {});
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'javascript' AND title = 'Group by' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'javascript', 'Curry function', 4, 'function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    }
    return (...more) => curried(...args, ...more);
  };
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'javascript' AND title = 'Curry function' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'javascript', 'Merge objects', 4, 'function merge(target, ...sources) {
  for (const src of sources) {
    for (const key in src) {
      target[key] = src[key];
    }
  }
  return target;
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'javascript' AND title = 'Merge objects' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'javascript', 'Event emitter', 5, 'class EventEmitter {
  constructor() {
    this.events = {};
  }
  on(event, fn) {
    (this.events[event] = this.events[event] || []).push(fn);
  }
  emit(event, ...args) {
    (this.events[event] || []).forEach((fn) => fn(...args));
  }
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'javascript' AND title = 'Event emitter' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'javascript', 'Promise timeout', 5, 'function withTimeout(promise, ms) {
  const timeout = new Promise((_, reject) => {
    setTimeout(() => reject(new Error("timeout")), ms);
  });
  return Promise.race([promise, timeout]);
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'javascript' AND title = 'Promise timeout' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'javascript', 'Retry async', 5, 'async function retry(fn, attempts) {
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === attempts - 1) throw err;
    }
  }
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'javascript' AND title = 'Retry async' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'javascript', 'Observable', 5, 'class Observable {
  constructor(subscribe) {
    this._subscribe = subscribe;
  }
  subscribe(observer) {
    return this._subscribe(observer);
  }
  map(fn) {
    return new Observable((obs) => {
      this.subscribe({ next: (v) => obs.next(fn(v)) });
    });
  }
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'javascript' AND title = 'Observable' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'javascript', 'Pipe functions', 5, 'function pipe(...fns) {
  return (x) => fns.reduce((v, fn) => fn(v), x);
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'javascript' AND title = 'Pipe functions' AND source_label = 'seed');

-- =============================================================================
-- TYPESCRIPT (slug: typescript) — 25 snippets
-- =============================================================================

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'typescript', 'Add function', 1, 'function add(a: number, b: number): number {
  return a + b;
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'typescript' AND title = 'Add function' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'typescript', 'Greet arrow', 1, 'const greet = (name: string): string => {
  return `Hello, ${name}!`;
};', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'typescript' AND title = 'Greet arrow' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'typescript', 'Is even', 1, 'function isEven(n: number): boolean {
  return n % 2 === 0;
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'typescript' AND title = 'Is even' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'typescript', 'Square', 1, 'const square = (x: number): number => x * x;', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'typescript' AND title = 'Square' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'typescript', 'User interface', 1, 'interface User {
  id: number;
  name: string;
  email: string;
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'typescript' AND title = 'User interface' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'typescript', 'Sum array', 2, 'function sum(nums: number[]): number {
  let total = 0;
  for (const n of nums) {
    total += n;
  }
  return total;
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'typescript' AND title = 'Sum array' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'typescript', 'Reverse string', 2, 'function reverse(s: string): string {
  return s.split("").reverse().join("");
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'typescript' AND title = 'Reverse string' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'typescript', 'Factorial', 2, 'function factorial(n: number): number {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'typescript' AND title = 'Factorial' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'typescript', 'Filter type', 2, 'type Status = "active" | "inactive";

function isActive(s: Status): boolean {
  return s === "active";
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'typescript' AND title = 'Filter type' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'typescript', 'Enum direction', 2, 'enum Direction {
  Up = "UP",
  Down = "DOWN",
  Left = "LEFT",
  Right = "RIGHT",
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'typescript' AND title = 'Enum direction' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'typescript', 'Generic identity', 3, 'function identity<T>(value: T): T {
  return value;
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'typescript' AND title = 'Generic identity' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'typescript', 'Map function', 3, 'function map<T, U>(
  arr: T[],
  fn: (item: T, index: number) => U
): U[] {
  const result: U[] = [];
  for (let i = 0; i < arr.length; i++) {
    result.push(fn(arr[i], i));
  }
  return result;
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'typescript' AND title = 'Map function' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'typescript', 'Stack class', 3, 'class Stack<T> {
  private items: T[] = [];

  push(item: T): void {
    this.items.push(item);
  }

  pop(): T | undefined {
    return this.items.pop();
  }
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'typescript' AND title = 'Stack class' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'typescript', 'Record type', 3, 'function countWords(text: string): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const word of text.split(" ")) {
    counts[word] = (counts[word] || 0) + 1;
  }
  return counts;
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'typescript' AND title = 'Record type' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'typescript', 'Result type', 3, 'type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'typescript' AND title = 'Result type' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'typescript', 'Debounce typed', 4, 'function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'typescript' AND title = 'Debounce typed' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'typescript', 'Deep partial', 4, 'type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object
    ? DeepPartial<T[K]>
    : T[K];
};', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'typescript' AND title = 'Deep partial' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'typescript', 'Guard function', 4, 'function isString(value: unknown): value is string {
  return typeof value === "string";
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'typescript' AND title = 'Guard function' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'typescript', 'Readonly deep', 4, 'type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object
    ? DeepReadonly<T[K]>
    : T[K];
};', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'typescript' AND title = 'Readonly deep' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'typescript', 'Async retry', 4, 'async function retry<T>(
  fn: () => Promise<T>,
  attempts: number
): Promise<T> {
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === attempts - 1) throw err;
    }
  }
  throw new Error("unreachable");
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'typescript' AND title = 'Async retry' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'typescript', 'Event emitter', 5, 'class EventEmitter<T extends Record<string, unknown>> {
  private listeners = new Map<keyof T, Set<Function>>();

  on<K extends keyof T>(event: K, fn: (data: T[K]) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(fn);
  }
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'typescript' AND title = 'Event emitter' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'typescript', 'Builder pattern', 5, 'class Builder<T extends Record<string, unknown>> {
  private obj: Partial<T> = {};

  set<K extends keyof T>(key: K, value: T[K]): this {
    this.obj[key] = value;
    return this;
  }

  build(): T {
    return this.obj as T;
  }
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'typescript' AND title = 'Builder pattern' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'typescript', 'Pipe utility', 5, 'type Fn = (arg: unknown) => unknown;

function pipe<T>(...fns: Fn[]) {
  return (x: T) => fns.reduce((v, fn) => fn(v), x as unknown);
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'typescript' AND title = 'Pipe utility' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'typescript', 'Promise all typed', 5, 'function promiseAll<T>(promises: Promise<T>[]): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const results: T[] = [];
    let count = 0;
    promises.forEach((p, i) => {
      p.then((v) => {
        results[i] = v;
        if (++count === promises.length) resolve(results);
      }).catch(reject);
    });
  });
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'typescript' AND title = 'Promise all typed' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'typescript', 'Branded type', 5, 'type Brand<T, B> = T & { __brand: B };
type UserId = Brand<string, "UserId">;

function createUserId(id: string): UserId {
  return id as UserId;
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'typescript' AND title = 'Branded type' AND source_label = 'seed');

-- =============================================================================
-- JAVA (slug: java) — 25 snippets
-- =============================================================================

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'java', 'Add method', 1, 'int add(int a, int b) {
    return a + b;
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'java' AND title = 'Add method' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'java', 'Max of two', 1, 'int max(int a, int b) {
    if (a > b) {
        return a;
    }
    return b;
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'java' AND title = 'Max of two' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'java', 'Is even', 1, 'boolean isEven(int n) {
    return n % 2 == 0;
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'java' AND title = 'Is even' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'java', 'Absolute value', 1, 'int abs(int n) {
    return n < 0 ? -n : n;
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'java' AND title = 'Absolute value' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'java', 'String length', 1, 'int length(String s) {
    return s.length();
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'java' AND title = 'String length' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'java', 'Sum array', 2, 'int sum(int[] nums) {
    int total = 0;
    for (int n : nums) {
        total += n;
    }
    return total;
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'java' AND title = 'Sum array' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'java', 'Factorial', 2, 'int factorial(int n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'java' AND title = 'Factorial' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'java', 'Reverse string', 2, 'String reverse(String s) {
    return new StringBuilder(s).reverse().toString();
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'java' AND title = 'Reverse string' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'java', 'Contains element', 2, 'boolean contains(int[] arr, int target) {
    for (int n : arr) {
        if (n == target) return true;
    }
    return false;
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'java' AND title = 'Contains element' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'java', 'Count char', 2, 'int countChar(String s, char c) {
    int count = 0;
    for (char ch : s.toCharArray()) {
        if (ch == c) count++;
    }
    return count;
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'java' AND title = 'Count char' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'java', 'Binary search', 3, 'int binarySearch(int[] arr, int target) {
    int lo = 0, hi = arr.length - 1;
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        if (arr[mid] == target) return mid;
        else if (arr[mid] < target) lo = mid + 1;
        else hi = mid - 1;
    }
    return -1;
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'java' AND title = 'Binary search' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'java', 'Fibonacci', 3, 'int fib(int n) {
    int a = 0, b = 1;
    for (int i = 0; i < n; i++) {
        int temp = b;
        b = a + b;
        a = temp;
    }
    return a;
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'java' AND title = 'Fibonacci' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'java', 'Palindrome', 3, 'boolean isPalindrome(String s) {
    s = s.toLowerCase();
    int l = 0, r = s.length() - 1;
    while (l < r) {
        if (s.charAt(l) != s.charAt(r)) return false;
        l++;
        r--;
    }
    return true;
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'java' AND title = 'Palindrome' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'java', 'Stack class', 3, 'class Stack {
    private int[] data;
    private int top = -1;

    Stack(int cap) {
        data = new int[cap];
    }

    void push(int val) {
        data[++top] = val;
    }

    int pop() {
        return data[top--];
    }
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'java' AND title = 'Stack class' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'java', 'Swap elements', 3, 'void swap(int[] arr, int i, int j) {
    int temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'java' AND title = 'Swap elements' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'java', 'Linked list node', 4, 'class Node {
    int val;
    Node next;

    Node(int val) {
        this.val = val;
        this.next = null;
    }

    void append(int val) {
        Node curr = this;
        while (curr.next != null) {
            curr = curr.next;
        }
        curr.next = new Node(val);
    }
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'java' AND title = 'Linked list node' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'java', 'Merge sorted', 4, 'int[] merge(int[] a, int[] b) {
    int[] result = new int[a.length + b.length];
    int i = 0, j = 0, k = 0;
    while (i < a.length && j < b.length) {
        result[k++] = a[i] <= b[j] ? a[i++] : b[j++];
    }
    while (i < a.length) result[k++] = a[i++];
    while (j < b.length) result[k++] = b[j++];
    return result;
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'java' AND title = 'Merge sorted' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'java', 'HashMap count', 4, 'Map<String, Integer> wordCount(String[] words) {
    Map<String, Integer> map = new HashMap<>();
    for (String w : words) {
        map.put(w, map.getOrDefault(w, 0) + 1);
    }
    return map;
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'java' AND title = 'HashMap count' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'java', 'Generic pair', 4, 'class Pair<A, B> {
    final A first;
    final B second;

    Pair(A first, B second) {
        this.first = first;
        this.second = second;
    }
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'java' AND title = 'Generic pair' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'java', 'Comparator sort', 4, 'void sortByLength(List<String> list) {
    list.sort((a, b) -> a.length() - b.length());
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'java' AND title = 'Comparator sort' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'java', 'Stream filter', 5, 'List<String> filterLong(List<String> words, int minLen) {
    return words.stream()
        .filter(w -> w.length() >= minLen)
        .collect(Collectors.toList());
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'java' AND title = 'Stream filter' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'java', 'Optional usage', 5, 'Optional<String> findFirst(List<String> list, String prefix) {
    return list.stream()
        .filter(s -> s.startsWith(prefix))
        .findFirst();
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'java' AND title = 'Optional usage' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'java', 'Singleton pattern', 5, 'class Singleton {
    private static Singleton instance;

    private Singleton() {}

    static synchronized Singleton getInstance() {
        if (instance == null) {
            instance = new Singleton();
        }
        return instance;
    }
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'java' AND title = 'Singleton pattern' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'java', 'Iterator impl', 5, 'class Range implements Iterable<Integer> {
    private final int end;

    Range(int end) { this.end = end; }

    public Iterator<Integer> iterator() {
        return new Iterator<>() {
            int i = 0;
            public boolean hasNext() { return i < end; }
            public Integer next() { return i++; }
        };
    }
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'java' AND title = 'Iterator impl' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'java', 'Record type', 5, 'record Point(double x, double y) {
    double distanceTo(Point other) {
        double dx = this.x - other.x;
        double dy = this.y - other.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'java' AND title = 'Record type' AND source_label = 'seed');

-- =============================================================================
-- C (slug: c) — 25 snippets
-- =============================================================================

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'c', 'Add function', 1, 'int add(int a, int b) {
    return a + b;
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'c' AND title = 'Add function' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'c', 'Max of two', 1, 'int max(int a, int b) {
    return a > b ? a : b;
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'c' AND title = 'Max of two' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'c', 'Absolute value', 1, 'int abs_val(int n) {
    if (n < 0) return -n;
    return n;
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'c' AND title = 'Absolute value' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'c', 'Is digit', 1, 'int is_digit(char c) {
    return c >= ''0'' && c <= ''9'';
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'c' AND title = 'Is digit' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'c', 'Swap ints', 1, 'void swap(int *a, int *b) {
    int tmp = *a;
    *a = *b;
    *b = tmp;
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'c' AND title = 'Swap ints' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'c', 'Sum array', 2, 'int sum(int *arr, int n) {
    int total = 0;
    for (int i = 0; i < n; i++) {
        total += arr[i];
    }
    return total;
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'c' AND title = 'Sum array' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'c', 'String length', 2, 'int str_len(const char *s) {
    int len = 0;
    while (s[len] != ''\0'') {
        len++;
    }
    return len;
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'c' AND title = 'String length' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'c', 'Factorial', 2, 'int factorial(int n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'c' AND title = 'Factorial' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'c', 'Power function', 2, 'int power(int base, int exp) {
    int result = 1;
    for (int i = 0; i < exp; i++) {
        result *= base;
    }
    return result;
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'c' AND title = 'Power function' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'c', 'Find max', 2, 'int find_max(int *arr, int n) {
    int max = arr[0];
    for (int i = 1; i < n; i++) {
        if (arr[i] > max) max = arr[i];
    }
    return max;
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'c' AND title = 'Find max' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'c', 'Reverse array', 3, 'void reverse(int *arr, int n) {
    for (int i = 0; i < n / 2; i++) {
        int tmp = arr[i];
        arr[i] = arr[n - 1 - i];
        arr[n - 1 - i] = tmp;
    }
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'c' AND title = 'Reverse array' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'c', 'Binary search', 3, 'int binary_search(int *arr, int n, int target) {
    int lo = 0, hi = n - 1;
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) lo = mid + 1;
        else hi = mid - 1;
    }
    return -1;
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'c' AND title = 'Binary search' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'c', 'String copy', 3, 'void str_copy(char *dst, const char *src) {
    while (*src) {
        *dst++ = *src++;
    }
    *dst = ''\0'';
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'c' AND title = 'String copy' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'c', 'Bubble sort', 3, 'void bubble_sort(int *arr, int n) {
    for (int i = 0; i < n - 1; i++) {
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                int tmp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = tmp;
            }
        }
    }
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'c' AND title = 'Bubble sort' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'c', 'Count char', 3, 'int count_char(const char *s, char c) {
    int count = 0;
    while (*s) {
        if (*s == c) count++;
        s++;
    }
    return count;
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'c' AND title = 'Count char' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'c', 'Linked list', 4, 'typedef struct Node {
    int val;
    struct Node *next;
} Node;

Node *create(int val) {
    Node *n = malloc(sizeof(Node));
    n->val = val;
    n->next = NULL;
    return n;
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'c' AND title = 'Linked list' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'c', 'String compare', 4, 'int str_cmp(const char *a, const char *b) {
    while (*a && *a == *b) {
        a++;
        b++;
    }
    return *(unsigned char *)a - *(unsigned char *)b;
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'c' AND title = 'String compare' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'c', 'Dynamic array', 4, 'typedef struct {
    int *data;
    int len;
    int cap;
} Vec;

void vec_push(Vec *v, int val) {
    if (v->len == v->cap) {
        v->cap *= 2;
        v->data = realloc(v->data, v->cap * sizeof(int));
    }
    v->data[v->len++] = val;
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'c' AND title = 'Dynamic array' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'c', 'Hash function', 4, 'unsigned int hash(const char *s) {
    unsigned int h = 5381;
    while (*s) {
        h = ((h << 5) + h) + *s++;
    }
    return h;
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'c' AND title = 'Hash function' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'c', 'Memcpy impl', 4, 'void *mem_copy(void *dst, const void *src, size_t n) {
    char *d = dst;
    const char *s = src;
    while (n--) {
        *d++ = *s++;
    }
    return dst;
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'c' AND title = 'Memcpy impl' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'c', 'Stack struct', 5, 'typedef struct {
    int data[256];
    int top;
} Stack;

void push(Stack *s, int val) {
    s->data[++s->top] = val;
}

int pop(Stack *s) {
    return s->data[s->top--];
}

int peek(Stack *s) {
    return s->data[s->top];
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'c' AND title = 'Stack struct' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'c', 'Merge sort', 5, 'void merge(int *a, int l, int m, int r) {
    int i = l, j = m + 1, k = 0;
    int tmp[r - l + 1];
    while (i <= m && j <= r) {
        tmp[k++] = a[i] <= a[j] ? a[i++] : a[j++];
    }
    while (i <= m) tmp[k++] = a[i++];
    while (j <= r) tmp[k++] = a[j++];
    for (i = 0; i < k; i++) a[l + i] = tmp[i];
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'c' AND title = 'Merge sort' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'c', 'Queue circular', 5, 'typedef struct {
    int buf[64];
    int head, tail, size;
} Queue;

void enqueue(Queue *q, int val) {
    q->buf[q->tail] = val;
    q->tail = (q->tail + 1) % 64;
    q->size++;
}

int dequeue(Queue *q) {
    int val = q->buf[q->head];
    q->head = (q->head + 1) % 64;
    q->size--;
    return val;
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'c' AND title = 'Queue circular' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'c', 'Bit counting', 5, 'int count_bits(unsigned int n) {
    int count = 0;
    while (n) {
        count += n & 1;
        n >>= 1;
    }
    return count;
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'c' AND title = 'Bit counting' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'c', 'Function pointer', 5, 'typedef int (*Op)(int, int);

int apply(Op fn, int a, int b) {
    return fn(a, b);
}

int mul(int a, int b) {
    return a * b;
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'c' AND title = 'Function pointer' AND source_label = 'seed');

-- =============================================================================
-- C++ (slug: cplusplus) — 25 snippets
-- =============================================================================

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'cplusplus', 'Add function', 1, 'int add(int a, int b) {
    return a + b;
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'cplusplus' AND title = 'Add function' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'cplusplus', 'Max template', 1, 'template <typename T>
T maxVal(T a, T b) {
    return a > b ? a : b;
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'cplusplus' AND title = 'Max template' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'cplusplus', 'Swap values', 1, 'template <typename T>
void swap(T& a, T& b) {
    T tmp = a;
    a = b;
    b = tmp;
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'cplusplus' AND title = 'Swap values' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'cplusplus', 'Is even', 1, 'bool isEven(int n) {
    return n % 2 == 0;
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'cplusplus' AND title = 'Is even' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'cplusplus', 'Square lambda', 1, 'auto square = [](int x) {
    return x * x;
};', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'cplusplus' AND title = 'Square lambda' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'cplusplus', 'Sum vector', 2, 'int sum(const std::vector<int>& v) {
    int total = 0;
    for (int n : v) {
        total += n;
    }
    return total;
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'cplusplus' AND title = 'Sum vector' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'cplusplus', 'String reverse', 2, 'std::string reverse(const std::string& s) {
    return std::string(s.rbegin(), s.rend());
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'cplusplus' AND title = 'String reverse' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'cplusplus', 'Factorial', 2, 'int factorial(int n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'cplusplus' AND title = 'Factorial' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'cplusplus', 'Contains value', 2, 'bool contains(const std::vector<int>& v, int target) {
    for (int n : v) {
        if (n == target) return true;
    }
    return false;
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'cplusplus' AND title = 'Contains value' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'cplusplus', 'Struct point', 2, 'struct Point {
    double x, y;

    double distance(const Point& p) const {
        double dx = x - p.x;
        double dy = y - p.y;
        return std::sqrt(dx * dx + dy * dy);
    }
};', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'cplusplus' AND title = 'Struct point' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'cplusplus', 'Binary search', 3, 'int binarySearch(const std::vector<int>& v, int target) {
    int lo = 0, hi = v.size() - 1;
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        if (v[mid] == target) return mid;
        if (v[mid] < target) lo = mid + 1;
        else hi = mid - 1;
    }
    return -1;
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'cplusplus' AND title = 'Binary search' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'cplusplus', 'Stack class', 3, 'class Stack {
    std::vector<int> data;
public:
    void push(int val) { data.push_back(val); }
    int pop() {
        int val = data.back();
        data.pop_back();
        return val;
    }
    bool empty() const { return data.empty(); }
};', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'cplusplus' AND title = 'Stack class' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'cplusplus', 'Fibonacci', 3, 'int fib(int n) {
    int a = 0, b = 1;
    for (int i = 0; i < n; i++) {
        int tmp = b;
        b = a + b;
        a = tmp;
    }
    return a;
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'cplusplus' AND title = 'Fibonacci' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'cplusplus', 'Map word count', 3, 'std::map<std::string, int> wordCount(const std::vector<std::string>& words) {
    std::map<std::string, int> counts;
    for (const auto& w : words) {
        counts[w]++;
    }
    return counts;
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'cplusplus' AND title = 'Map word count' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'cplusplus', 'Range for', 3, 'void printAll(const std::vector<int>& v) {
    for (const auto& val : v) {
        std::cout << val << " ";
    }
    std::cout << std::endl;
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'cplusplus' AND title = 'Range for' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'cplusplus', 'Smart pointer', 4, 'class Resource {
    std::string name;
public:
    Resource(std::string n) : name(std::move(n)) {}
    const std::string& getName() const { return name; }
};

auto createResource(const std::string& name) {
    return std::make_unique<Resource>(name);
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'cplusplus' AND title = 'Smart pointer' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'cplusplus', 'Lambda sort', 4, 'void sortByLength(std::vector<std::string>& v) {
    std::sort(v.begin(), v.end(),
        [](const std::string& a, const std::string& b) {
            return a.size() < b.size();
        });
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'cplusplus' AND title = 'Lambda sort' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'cplusplus', 'Move semantics', 4, 'class Buffer {
    std::vector<char> data;
public:
    Buffer(size_t size) : data(size) {}
    Buffer(Buffer&& other) noexcept : data(std::move(other.data)) {}
    Buffer& operator=(Buffer&& other) noexcept {
        data = std::move(other.data);
        return *this;
    }
};', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'cplusplus' AND title = 'Move semantics' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'cplusplus', 'Variadic print', 4, 'template <typename T, typename... Args>
void print(T first, Args... rest) {
    std::cout << first;
    if constexpr (sizeof...(rest) > 0) {
        std::cout << ", ";
        print(rest...);
    }
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'cplusplus' AND title = 'Variadic print' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'cplusplus', 'RAII guard', 4, 'class LockGuard {
    std::mutex& mtx;
public:
    explicit LockGuard(std::mutex& m) : mtx(m) { mtx.lock(); }
    ~LockGuard() { mtx.unlock(); }
};', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'cplusplus' AND title = 'RAII guard' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'cplusplus', 'Iterator class', 5, 'class Range {
    int start, stop;
public:
    Range(int s, int e) : start(s), stop(e) {}
    struct Iterator {
        int val;
        int operator*() { return val; }
        Iterator& operator++() { val++; return *this; }
        bool operator!=(const Iterator& o) { return val != o.val; }
    };
    Iterator begin() { return {start}; }
    Iterator end() { return {stop}; }
};', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'cplusplus' AND title = 'Iterator class' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'cplusplus', 'Optional monad', 5, 'template <typename T>
class Optional {
    T value;
    bool has;
public:
    Optional() : has(false) {}
    Optional(T v) : value(v), has(true) {}
    bool hasValue() const { return has; }
    T get() const { return value; }
    template <typename F>
    auto map(F fn) -> Optional<decltype(fn(value))> {
        if (has) return Optional(fn(value));
        return {};
    }
};', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'cplusplus' AND title = 'Optional monad' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'cplusplus', 'Thread pool', 5, 'class ThreadPool {
    std::vector<std::thread> workers;
    std::queue<std::function<void()>> tasks;
    std::mutex mtx;
    std::condition_variable cv;
    bool stop = false;
};', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'cplusplus' AND title = 'Thread pool' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'cplusplus', 'Concepts usage', 5, 'template <typename T>
concept Addable = requires(T a, T b) {
    { a + b } -> std::same_as<T>;
};

template <Addable T>
T add(T a, T b) {
    return a + b;
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'cplusplus' AND title = 'Concepts usage' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'cplusplus', 'Fold expression', 5, 'template <typename... Args>
auto sum(Args... args) {
    return (args + ...);
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'cplusplus' AND title = 'Fold expression' AND source_label = 'seed');

-- =============================================================================
-- C# (slug: csharp) — 25 snippets
-- =============================================================================

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'csharp', 'Add method', 1, 'int Add(int a, int b) {
    return a + b;
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'csharp' AND title = 'Add method' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'csharp', 'Max of two', 1, 'int Max(int a, int b) {
    return a > b ? a : b;
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'csharp' AND title = 'Max of two' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'csharp', 'Is even', 1, 'bool IsEven(int n) {
    return n % 2 == 0;
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'csharp' AND title = 'Is even' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'csharp', 'Greet method', 1, 'string Greet(string name) {
    return $"Hello, {name}!";
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'csharp' AND title = 'Greet method' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'csharp', 'Absolute value', 1, 'int Abs(int n) {
    return n < 0 ? -n : n;
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'csharp' AND title = 'Absolute value' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'csharp', 'Sum array', 2, 'int Sum(int[] nums) {
    int total = 0;
    foreach (int n in nums) {
        total += n;
    }
    return total;
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'csharp' AND title = 'Sum array' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'csharp', 'Factorial', 2, 'int Factorial(int n) {
    if (n <= 1) return 1;
    return n * Factorial(n - 1);
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'csharp' AND title = 'Factorial' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'csharp', 'Reverse string', 2, 'string Reverse(string s) {
    char[] arr = s.ToCharArray();
    Array.Reverse(arr);
    return new string(arr);
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'csharp' AND title = 'Reverse string' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'csharp', 'Contains value', 2, 'bool Contains(int[] arr, int target) {
    foreach (int n in arr) {
        if (n == target) return true;
    }
    return false;
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'csharp' AND title = 'Contains value' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'csharp', 'Property class', 2, 'class Person {
    public string Name { get; set; }
    public int Age { get; set; }

    public override string ToString() {
        return $"{Name} ({Age})";
    }
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'csharp' AND title = 'Property class' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'csharp', 'Binary search', 3, 'int BinarySearch(int[] arr, int target) {
    int lo = 0, hi = arr.Length - 1;
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) lo = mid + 1;
        else hi = mid - 1;
    }
    return -1;
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'csharp' AND title = 'Binary search' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'csharp', 'Fibonacci', 3, 'int Fib(int n) {
    int a = 0, b = 1;
    for (int i = 0; i < n; i++) {
        int tmp = b;
        b = a + b;
        a = tmp;
    }
    return a;
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'csharp' AND title = 'Fibonacci' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'csharp', 'Dictionary count', 3, 'Dictionary<string, int> WordCount(string[] words) {
    var dict = new Dictionary<string, int>();
    foreach (string w in words) {
        dict[w] = dict.GetValueOrDefault(w, 0) + 1;
    }
    return dict;
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'csharp' AND title = 'Dictionary count' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'csharp', 'Stack generic', 3, 'class Stack<T> {
    private List<T> items = new();

    public void Push(T item) => items.Add(item);

    public T Pop() {
        T item = items[^1];
        items.RemoveAt(items.Count - 1);
        return item;
    }
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'csharp' AND title = 'Stack generic' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'csharp', 'Palindrome', 3, 'bool IsPalindrome(string s) {
    s = s.ToLower();
    int l = 0, r = s.Length - 1;
    while (l < r) {
        if (s[l] != s[r]) return false;
        l++;
        r--;
    }
    return true;
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'csharp' AND title = 'Palindrome' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'csharp', 'LINQ filter', 4, 'List<string> FilterLong(List<string> words, int minLen) {
    return words.Where(w => w.Length >= minLen).ToList();
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'csharp' AND title = 'LINQ filter' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'csharp', 'Async method', 4, 'async Task<string> FetchDataAsync(string url) {
    using var client = new HttpClient();
    var response = await client.GetAsync(url);
    return await response.Content.ReadAsStringAsync();
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'csharp' AND title = 'Async method' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'csharp', 'Extension method', 4, 'static class StringExtensions {
    public static string Truncate(this string s, int maxLen) {
        if (s.Length <= maxLen) return s;
        return s[..maxLen] + "...";
    }
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'csharp' AND title = 'Extension method' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'csharp', 'Event handler', 4, 'class Button {
    public event EventHandler? Clicked;

    public void Click() {
        Clicked?.Invoke(this, EventArgs.Empty);
    }
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'csharp' AND title = 'Event handler' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'csharp', 'Pattern matching', 4, 'string Describe(object obj) => obj switch {
    int n when n > 0 => "positive",
    int n when n < 0 => "negative",
    int => "zero",
    string s => $"string: {s}",
    _ => "unknown",
};', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'csharp' AND title = 'Pattern matching' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'csharp', 'Record type', 5, 'record Point(double X, double Y) {
    public double DistanceTo(Point other) {
        double dx = X - other.X;
        double dy = Y - other.Y;
        return Math.Sqrt(dx * dx + dy * dy);
    }
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'csharp' AND title = 'Record type' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'csharp', 'Disposable', 5, 'class TempFile : IDisposable {
    public string Path { get; }

    public TempFile() {
        Path = System.IO.Path.GetTempFileName();
    }

    public void Dispose() {
        if (File.Exists(Path)) {
            File.Delete(Path);
        }
    }
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'csharp' AND title = 'Disposable' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'csharp', 'Iterator yield', 5, 'IEnumerable<int> Range(int start, int count) {
    for (int i = 0; i < count; i++) {
        yield return start + i;
    }
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'csharp' AND title = 'Iterator yield' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'csharp', 'Singleton pattern', 5, 'class Singleton {
    private static readonly Lazy<Singleton> _instance =
        new(() => new Singleton());

    private Singleton() {}

    public static Singleton Instance => _instance.Value;
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'csharp' AND title = 'Singleton pattern' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'csharp', 'Generic constraint', 5, 'T Max<T>(T a, T b) where T : IComparable<T> {
    return a.CompareTo(b) > 0 ? a : b;
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'csharp' AND title = 'Generic constraint' AND source_label = 'seed');

-- =============================================================================
-- GO (slug: go) — 25 snippets
-- =============================================================================

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'go', 'Add function', 1, E'func add(a, b int) int {\n\treturn a + b\n}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'go' AND title = 'Add function' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'go', 'Max of two', 1, E'func max(a, b int) int {\n\tif a > b {\n\t\treturn a\n\t}\n\treturn b\n}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'go' AND title = 'Max of two' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'go', 'Is even', 1, E'func isEven(n int) bool {\n\treturn n%2 == 0\n}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'go' AND title = 'Is even' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'go', 'Swap values', 1, E'func swap(a, b int) (int, int) {\n\treturn b, a\n}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'go' AND title = 'Swap values' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'go', 'Abs value', 1, E'func abs(n int) int {\n\tif n < 0 {\n\t\treturn -n\n\t}\n\treturn n\n}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'go' AND title = 'Abs value' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'go', 'Sum slice', 2, E'func sum(nums []int) int {\n\ttotal := 0\n\tfor _, n := range nums {\n\t\ttotal += n\n\t}\n\treturn total\n}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'go' AND title = 'Sum slice' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'go', 'Contains string', 2, E'func contains(s []string, target string) bool {\n\tfor _, v := range s {\n\t\tif v == target {\n\t\t\treturn true\n\t\t}\n\t}\n\treturn false\n}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'go' AND title = 'Contains string' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'go', 'Factorial', 2, E'func factorial(n int) int {\n\tif n <= 1 {\n\t\treturn 1\n\t}\n\treturn n * factorial(n-1)\n}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'go' AND title = 'Factorial' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'go', 'Reverse string', 2, E'func reverse(s string) string {\n\trunes := []rune(s)\n\tfor i, j := 0, len(runes)-1; i < j; i, j = i+1, j-1 {\n\t\trunes[i], runes[j] = runes[j], runes[i]\n\t}\n\treturn string(runes)\n}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'go' AND title = 'Reverse string' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'go', 'Filter slice', 2, E'func filter(nums []int, fn func(int) bool) []int {\n\tvar result []int\n\tfor _, n := range nums {\n\t\tif fn(n) {\n\t\t\tresult = append(result, n)\n\t\t}\n\t}\n\treturn result\n}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'go' AND title = 'Filter slice' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'go', 'Fibonacci', 3, E'func fib(n int) int {\n\ta, b := 0, 1\n\tfor i := 0; i < n; i++ {\n\t\ta, b = b, a+b\n\t}\n\treturn a\n}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'go' AND title = 'Fibonacci' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'go', 'Binary search', 3, E'func binarySearch(nums []int, target int) int {\n\tlo, hi := 0, len(nums)-1\n\tfor lo <= hi {\n\t\tmid := lo + (hi-lo)/2\n\t\tif nums[mid] == target {\n\t\t\treturn mid\n\t\t} else if nums[mid] < target {\n\t\t\tlo = mid + 1\n\t\t} else {\n\t\t\thi = mid - 1\n\t\t}\n\t}\n\treturn -1\n}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'go' AND title = 'Binary search' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'go', 'Error handling', 3, E'func divide(a, b float64) (float64, error) {\n\tif b == 0 {\n\t\treturn 0, fmt.Errorf("division by zero")\n\t}\n\treturn a / b, nil\n}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'go' AND title = 'Error handling' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'go', 'Map keys', 3, E'func keys(m map[string]int) []string {\n\tresult := make([]string, 0, len(m))\n\tfor k := range m {\n\t\tresult = append(result, k)\n\t}\n\treturn result\n}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'go' AND title = 'Map keys' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'go', 'Struct method', 3, E'type Rect struct {\n\tWidth, Height float64\n}\n\nfunc (r Rect) Area() float64 {\n\treturn r.Width * r.Height\n}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'go' AND title = 'Struct method' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'go', 'Interface impl', 4, E'type Shape interface {\n\tArea() float64\n}\n\ntype Circle struct {\n\tRadius float64\n}\n\nfunc (c Circle) Area() float64 {\n\treturn 3.14159 * c.Radius * c.Radius\n}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'go' AND title = 'Interface impl' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'go', 'Goroutine channel', 4, E'func produce(ch chan<- int, n int) {\n\tfor i := 0; i < n; i++ {\n\t\tch <- i\n\t}\n\tclose(ch)\n}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'go' AND title = 'Goroutine channel' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'go', 'Word count', 4, E'func wordCount(s string) map[string]int {\n\tcounts := make(map[string]int)\n\tfor _, w := range strings.Fields(s) {\n\t\tcounts[w]++\n\t}\n\treturn counts\n}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'go' AND title = 'Word count' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'go', 'HTTP handler', 4, E'func handleHealth(w http.ResponseWriter, r *http.Request) {\n\tw.Header().Set("Content-Type", "application/json")\n\tjson.NewEncoder(w).Encode(map[string]string{\n\t\t"status": "ok",\n\t})\n}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'go' AND title = 'HTTP handler' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'go', 'Mutex counter', 4, E'type Counter struct {\n\tmu    sync.Mutex\n\tcount int\n}\n\nfunc (c *Counter) Inc() {\n\tc.mu.Lock()\n\tc.count++\n\tc.mu.Unlock()\n}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'go' AND title = 'Mutex counter' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'go', 'Generic min', 5, E'func Min[T interface{ ~int | ~float64 | ~string }](a, b T) T {\n\tif a < b {\n\t\treturn a\n\t}\n\treturn b\n}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'go' AND title = 'Generic min' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'go', 'Context timeout', 5, E'func fetchWithTimeout(url string, timeout time.Duration) ([]byte, error) {\n\tctx, cancel := context.WithTimeout(context.Background(), timeout)\n\tdefer cancel()\n\treq, err := http.NewRequestWithContext(ctx, "GET", url, nil)\n\tif err != nil {\n\t\treturn nil, err\n\t}\n\tresp, err := http.DefaultClient.Do(req)\n\tif err != nil {\n\t\treturn nil, err\n\t}\n\tdefer resp.Body.Close()\n\treturn io.ReadAll(resp.Body)\n}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'go' AND title = 'Context timeout' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'go', 'Worker pool', 5, E'func worker(id int, jobs <-chan int, results chan<- int) {\n\tfor j := range jobs {\n\t\tresults <- j * 2\n\t}\n}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'go' AND title = 'Worker pool' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'go', 'Linked list', 5, E'type Node struct {\n\tVal  int\n\tNext *Node\n}\n\nfunc (n *Node) Append(val int) {\n\tcurr := n\n\tfor curr.Next != nil {\n\t\tcurr = curr.Next\n\t}\n\tcurr.Next = &Node{Val: val}\n}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'go' AND title = 'Linked list' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'go', 'Middleware', 5, E'func logging(next http.Handler) http.Handler {\n\treturn http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {\n\t\tlog.Printf("%s %s", r.Method, r.URL.Path)\n\t\tnext.ServeHTTP(w, r)\n\t})\n}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'go' AND title = 'Middleware' AND source_label = 'seed');

-- =============================================================================
-- RUST (slug: rust) — 25 snippets
-- =============================================================================

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'rust', 'Add function', 1, 'fn add(a: i32, b: i32) -> i32 {
    a + b
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'rust' AND title = 'Add function' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'rust', 'Max of two', 1, 'fn max(a: i32, b: i32) -> i32 {
    if a > b { a } else { b }
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'rust' AND title = 'Max of two' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'rust', 'Is even', 1, 'fn is_even(n: i32) -> bool {
    n % 2 == 0
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'rust' AND title = 'Is even' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'rust', 'Absolute value', 1, 'fn abs(n: i32) -> i32 {
    if n < 0 { -n } else { n }
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'rust' AND title = 'Absolute value' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'rust', 'Square', 1, 'fn square(x: f64) -> f64 {
    x * x
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'rust' AND title = 'Square' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'rust', 'Sum vector', 2, 'fn sum(nums: &[i32]) -> i32 {
    let mut total = 0;
    for &n in nums {
        total += n;
    }
    total
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'rust' AND title = 'Sum vector' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'rust', 'Factorial', 2, 'fn factorial(n: u64) -> u64 {
    if n <= 1 { 1 } else { n * factorial(n - 1) }
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'rust' AND title = 'Factorial' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'rust', 'Contains', 2, 'fn contains(v: &[i32], target: i32) -> bool {
    for &n in v {
        if n == target {
            return true;
        }
    }
    false
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'rust' AND title = 'Contains' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'rust', 'Reverse string', 2, 'fn reverse(s: &str) -> String {
    s.chars().rev().collect()
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'rust' AND title = 'Reverse string' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'rust', 'Filter evens', 2, 'fn evens(nums: &[i32]) -> Vec<i32> {
    nums.iter().filter(|&&n| n % 2 == 0).copied().collect()
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'rust' AND title = 'Filter evens' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'rust', 'Fibonacci', 3, 'fn fib(n: u32) -> u64 {
    let (mut a, mut b) = (0u64, 1u64);
    for _ in 0..n {
        let tmp = b;
        b = a + b;
        a = tmp;
    }
    a
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'rust' AND title = 'Fibonacci' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'rust', 'Struct impl', 3, 'struct Rect {
    width: f64,
    height: f64,
}

impl Rect {
    fn area(&self) -> f64 {
        self.width * self.height
    }
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'rust' AND title = 'Struct impl' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'rust', 'Pattern match', 3, 'fn describe(n: i32) -> &''static str {
    match n {
        1 => "one",
        2 => "two",
        3..=9 => "several",
        _ => "many",
    }
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'rust' AND title = 'Pattern match' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'rust', 'Option handling', 3, 'fn first_even(nums: &[i32]) -> Option<i32> {
    for &n in nums {
        if n % 2 == 0 {
            return Some(n);
        }
    }
    None
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'rust' AND title = 'Option handling' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'rust', 'HashMap count', 3, 'fn word_count(words: &[&str]) -> HashMap<&str, usize> {
    let mut map = HashMap::new();
    for &w in words {
        *map.entry(w).or_insert(0) += 1;
    }
    map
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'rust' AND title = 'HashMap count' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'rust', 'Result error', 4, 'fn parse_port(s: &str) -> Result<u16, String> {
    s.parse::<u16>().map_err(|e| format!("invalid port: {}", e))
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'rust' AND title = 'Result error' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'rust', 'Enum with data', 4, 'enum Shape {
    Circle(f64),
    Rect(f64, f64),
}

impl Shape {
    fn area(&self) -> f64 {
        match self {
            Shape::Circle(r) => std::f64::consts::PI * r * r,
            Shape::Rect(w, h) => w * h,
        }
    }
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'rust' AND title = 'Enum with data' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'rust', 'Iterator chain', 4, 'fn top_three(nums: &[i32]) -> Vec<i32> {
    let mut sorted = nums.to_vec();
    sorted.sort_unstable_by(|a, b| b.cmp(a));
    sorted.into_iter().take(3).collect()
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'rust' AND title = 'Iterator chain' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'rust', 'Closure map', 4, 'fn double_all(nums: &[i32]) -> Vec<i32> {
    nums.iter().map(|&n| n * 2).collect()
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'rust' AND title = 'Closure map' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'rust', 'Trait impl', 4, 'trait Summary {
    fn summarize(&self) -> String;
}

struct Article {
    title: String,
}

impl Summary for Article {
    fn summarize(&self) -> String {
        format!("Article: {}", self.title)
    }
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'rust' AND title = 'Trait impl' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'rust', 'Generic function', 5, 'fn largest<T: PartialOrd>(list: &[T]) -> &T {
    let mut max = &list[0];
    for item in &list[1..] {
        if item > max {
            max = item;
        }
    }
    max
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'rust' AND title = 'Generic function' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'rust', 'Lifetime annotation', 5, 'fn longest<''a>(x: &''a str, y: &''a str) -> &''a str {
    if x.len() > y.len() { x } else { y }
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'rust' AND title = 'Lifetime annotation' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'rust', 'From trait', 5, 'struct Email(String);

impl From<&str> for Email {
    fn from(s: &str) -> Self {
        Email(s.to_string())
    }
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'rust' AND title = 'From trait' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'rust', 'Display trait', 5, 'struct Point {
    x: f64,
    y: f64,
}

impl std::fmt::Display for Point {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        write!(f, "({}, {})", self.x, self.y)
    }
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'rust' AND title = 'Display trait' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'rust', 'Builder pattern', 5, 'struct Config {
    host: String,
    port: u16,
}

impl Config {
    fn builder() -> ConfigBuilder {
        ConfigBuilder { host: None, port: None }
    }
}

struct ConfigBuilder {
    host: Option<String>,
    port: Option<u16>,
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'rust' AND title = 'Builder pattern' AND source_label = 'seed');

-- =============================================================================
-- PHP (slug: php) — 25 snippets
-- =============================================================================

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'php', 'Add function', 1, 'function add(int $a, int $b): int {
    return $a + $b;
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'php' AND title = 'Add function' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'php', 'Max of two', 1, 'function maxVal(int $a, int $b): int {
    return $a > $b ? $a : $b;
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'php' AND title = 'Max of two' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'php', 'Is even', 1, 'function isEven(int $n): bool {
    return $n % 2 === 0;
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'php' AND title = 'Is even' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'php', 'Greet', 1, 'function greet(string $name): string {
    return "Hello, {$name}!";
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'php' AND title = 'Greet' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'php', 'String length', 1, 'function strLen(string $s): int {
    return strlen($s);
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'php' AND title = 'String length' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'php', 'Sum array', 2, 'function sumArray(array $nums): int {
    $total = 0;
    foreach ($nums as $n) {
        $total += $n;
    }
    return $total;
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'php' AND title = 'Sum array' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'php', 'Factorial', 2, 'function factorial(int $n): int {
    if ($n <= 1) return 1;
    return $n * factorial($n - 1);
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'php' AND title = 'Factorial' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'php', 'Reverse string', 2, 'function reverseStr(string $s): string {
    return strrev($s);
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'php' AND title = 'Reverse string' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'php', 'Contains value', 2, 'function contains(array $arr, mixed $val): bool {
    foreach ($arr as $item) {
        if ($item === $val) return true;
    }
    return false;
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'php' AND title = 'Contains value' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'php', 'Filter array', 2, 'function evens(array $nums): array {
    return array_filter($nums, fn($n) => $n % 2 === 0);
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'php' AND title = 'Filter array' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'php', 'Fibonacci', 3, 'function fib(int $n): int {
    $a = 0;
    $b = 1;
    for ($i = 0; $i < $n; $i++) {
        [$a, $b] = [$b, $a + $b];
    }
    return $a;
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'php' AND title = 'Fibonacci' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'php', 'Palindrome', 3, 'function isPalindrome(string $s): bool {
    $s = strtolower($s);
    return $s === strrev($s);
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'php' AND title = 'Palindrome' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'php', 'Binary search', 3, 'function binarySearch(array $arr, int $target): int {
    $lo = 0;
    $hi = count($arr) - 1;
    while ($lo <= $hi) {
        $mid = $lo + intdiv($hi - $lo, 2);
        if ($arr[$mid] === $target) return $mid;
        if ($arr[$mid] < $target) $lo = $mid + 1;
        else $hi = $mid - 1;
    }
    return -1;
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'php' AND title = 'Binary search' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'php', 'Word count', 3, 'function wordCount(string $text): array {
    $counts = [];
    foreach (explode(" ", $text) as $word) {
        $counts[$word] = ($counts[$word] ?? 0) + 1;
    }
    return $counts;
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'php' AND title = 'Word count' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'php', 'Flatten array', 3, 'function flatten(array $arr): array {
    $result = [];
    foreach ($arr as $item) {
        if (is_array($item)) {
            $result = array_merge($result, flatten($item));
        } else {
            $result[] = $item;
        }
    }
    return $result;
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'php' AND title = 'Flatten array' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'php', 'Class constructor', 4, 'class User {
    public function __construct(
        private string $name,
        private string $email,
    ) {}

    public function getName(): string {
        return $this->name;
    }
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'php' AND title = 'Class constructor' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'php', 'Array map', 4, 'function doubleAll(array $nums): array {
    return array_map(fn($n) => $n * 2, $nums);
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'php' AND title = 'Array map' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'php', 'Match expression', 4, 'function statusText(int $code): string {
    return match ($code) {
        200 => "OK",
        404 => "Not Found",
        500 => "Server Error",
        default => "Unknown",
    };
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'php' AND title = 'Match expression' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'php', 'Named arguments', 4, 'function createTag(
    string $tag,
    string $content,
    string $class = "",
): string {
    $attr = $class ? " class=\"{$class}\"" : "";
    return "<{$tag}{$attr}>{$content}</{$tag}>";
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'php' AND title = 'Named arguments' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'php', 'Enum type', 4, 'enum Color: string {
    case Red = "red";
    case Green = "green";
    case Blue = "blue";

    public function label(): string {
        return ucfirst($this->value);
    }
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'php' AND title = 'Enum type' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'php', 'Interface impl', 5, 'interface Stringify {
    public function toString(): string;
}

class Product implements Stringify {
    public function __construct(
        private string $name,
        private float $price,
    ) {}

    public function toString(): string {
        return "{$this->name}: \${$this->price}";
    }
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'php' AND title = 'Interface impl' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'php', 'Fiber usage', 5, 'function asyncTask(): Fiber {
    return new Fiber(function (): void {
        $value = Fiber::suspend("waiting");
        echo "Received: {$value}";
    });
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'php' AND title = 'Fiber usage' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'php', 'Readonly class', 5, 'readonly class Config {
    public function __construct(
        public string $host,
        public int $port,
        public string $dbName,
    ) {}

    public function dsn(): string {
        return "pgsql:host={$this->host};port={$this->port};dbname={$this->dbName}";
    }
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'php' AND title = 'Readonly class' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'php', 'Generator range', 5, 'function xrange(int $start, int $end): Generator {
    for ($i = $start; $i <= $end; $i++) {
        yield $i;
    }
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'php' AND title = 'Generator range' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'php', 'Null safe chain', 5, 'function getUserCity(?User $user): ?string {
    return $user?->getAddress()?->getCity();
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'php' AND title = 'Null safe chain' AND source_label = 'seed');

-- =============================================================================
-- SQL (slug: sql) — 15 snippets
-- =============================================================================

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'sql', 'Select all', 1, 'SELECT * FROM users WHERE active = TRUE;', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'sql' AND title = 'Select all' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'sql', 'Insert row', 1, 'INSERT INTO users (name, email)
VALUES (''Alice'', ''alice@example.com'');', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'sql' AND title = 'Insert row' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'sql', 'Update row', 1, 'UPDATE products
SET price = 19.99
WHERE id = 42;', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'sql' AND title = 'Update row' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'sql', 'Count rows', 2, 'SELECT status, COUNT(*) AS total
FROM orders
GROUP BY status
ORDER BY total DESC;', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'sql' AND title = 'Count rows' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'sql', 'Inner join', 2, 'SELECT u.name, o.total
FROM users u
INNER JOIN orders o ON o.user_id = u.id
WHERE o.total > 100;', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'sql' AND title = 'Inner join' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'sql', 'Create table', 2, 'CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price NUMERIC(10, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT NOW()
);', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'sql' AND title = 'Create table' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'sql', 'Left join count', 3, 'SELECT c.name, COUNT(p.id) AS num_products
FROM categories c
LEFT JOIN products p ON p.category_id = c.id
GROUP BY c.name
ORDER BY num_products DESC;', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'sql' AND title = 'Left join count' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'sql', 'Subquery filter', 3, 'SELECT name, email
FROM users
WHERE id IN (
    SELECT user_id FROM orders
    WHERE total > 500
);', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'sql' AND title = 'Subquery filter' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'sql', 'Upsert row', 3, 'INSERT INTO settings (key, value)
VALUES (''theme'', ''dark'')
ON CONFLICT (key)
DO UPDATE SET value = EXCLUDED.value;', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'sql' AND title = 'Upsert row' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'sql', 'CTE with filter', 4, 'WITH recent_orders AS (
    SELECT user_id, SUM(total) AS spent
    FROM orders
    WHERE created_at > NOW() - INTERVAL ''30 days''
    GROUP BY user_id
)
SELECT u.name, r.spent
FROM users u
JOIN recent_orders r ON r.user_id = u.id
WHERE r.spent > 1000;', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'sql' AND title = 'CTE with filter' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'sql', 'Window function', 4, 'SELECT name, department, salary,
    RANK() OVER (PARTITION BY department ORDER BY salary DESC) AS dept_rank
FROM employees;', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'sql' AND title = 'Window function' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'sql', 'Case expression', 4, 'SELECT name,
    CASE
        WHEN score >= 90 THEN ''A''
        WHEN score >= 80 THEN ''B''
        WHEN score >= 70 THEN ''C''
        ELSE ''F''
    END AS grade
FROM students;', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'sql' AND title = 'Case expression' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'sql', 'Recursive CTE', 5, 'WITH RECURSIVE tree AS (
    SELECT id, name, parent_id, 0 AS depth
    FROM categories WHERE parent_id IS NULL
    UNION ALL
    SELECT c.id, c.name, c.parent_id, t.depth + 1
    FROM categories c
    JOIN tree t ON t.id = c.parent_id
)
SELECT * FROM tree ORDER BY depth;', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'sql' AND title = 'Recursive CTE' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'sql', 'Correlated subquery', 5, 'SELECT e.name, e.salary
FROM employees e
WHERE e.salary > (
    SELECT AVG(e2.salary)
    FROM employees e2
    WHERE e2.department = e.department
);', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'sql' AND title = 'Correlated subquery' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'sql', 'Lateral join', 5, 'SELECT u.name, recent.title, recent.created_at
FROM users u,
LATERAL (
    SELECT title, created_at
    FROM posts p
    WHERE p.user_id = u.id
    ORDER BY created_at DESC
    LIMIT 3
) recent;', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'sql' AND title = 'Lateral join' AND source_label = 'seed');

-- =============================================================================
-- SCALA (slug: scala) — 15 snippets
-- =============================================================================

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'scala', 'Add function', 1, 'def add(a: Int, b: Int): Int = a + b', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'scala' AND title = 'Add function' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'scala', 'Max of two', 1, 'def max(a: Int, b: Int): Int =
  if (a > b) a else b', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'scala' AND title = 'Max of two' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'scala', 'Case class', 1, 'case class Point(x: Double, y: Double) {
  def distanceTo(other: Point): Double = {
    val dx = x - other.x
    val dy = y - other.y
    math.sqrt(dx * dx + dy * dy)
  }
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'scala' AND title = 'Case class' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'scala', 'List filter', 2, 'def evens(nums: List[Int]): List[Int] =
  nums.filter(_ % 2 == 0)', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'scala' AND title = 'List filter' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'scala', 'Factorial', 2, 'def factorial(n: Int): Int =
  if (n <= 1) 1
  else n * factorial(n - 1)', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'scala' AND title = 'Factorial' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'scala', 'Option map', 2, 'def parseAge(s: String): Option[Int] =
  s.toIntOption.filter(_ >= 0)', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'scala' AND title = 'Option map' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'scala', 'Pattern matching', 3, 'def describe(x: Any): String = x match {
  case n: Int if n > 0 => "positive"
  case n: Int           => "non-positive"
  case s: String        => s"string: $s"
  case _                => "unknown"
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'scala' AND title = 'Pattern matching' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'scala', 'Fibonacci tail', 3, 'def fib(n: Int): Int = {
  @annotation.tailrec
  def go(i: Int, a: Int, b: Int): Int =
    if (i <= 0) a else go(i - 1, b, a + b)
  go(n, 0, 1)
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'scala' AND title = 'Fibonacci tail' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'scala', 'Word count', 3, 'def wordCount(text: String): Map[String, Int] =
  text.split("\\s+").groupBy(identity).map {
    case (word, arr) => word -> arr.length
  }', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'scala' AND title = 'Word count' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'scala', 'Trait mixin', 4, 'trait Greeter {
  def greet(name: String): String
}

trait Shouter extends Greeter {
  abstract override def greet(name: String): String =
    super.greet(name).toUpperCase
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'scala' AND title = 'Trait mixin' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'scala', 'Higher order', 4, 'def applyTwice[A](f: A => A, x: A): A = f(f(x))

val increment: Int => Int = _ + 1
val result = applyTwice(increment, 5)', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'scala' AND title = 'Higher order' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'scala', 'Sealed trait', 4, 'sealed trait Shape
case class Circle(r: Double) extends Shape
case class Rect(w: Double, h: Double) extends Shape

def area(s: Shape): Double = s match {
  case Circle(r)  => math.Pi * r * r
  case Rect(w, h) => w * h
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'scala' AND title = 'Sealed trait' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'scala', 'Fold left', 5, 'def flatten[A](xss: List[List[A]]): List[A] =
  xss.foldLeft(List.empty[A])(_ ++ _)', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'scala' AND title = 'Fold left' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'scala', 'For comprehension', 5, 'def pairs(n: Int): List[(Int, Int)] =
  for {
    i <- (1 to n).toList
    j <- (i + 1 to n).toList
  } yield (i, j)', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'scala' AND title = 'For comprehension' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'scala', 'Implicit class', 5, 'implicit class RichInt(val n: Int) extends AnyVal {
  def times(f: => Unit): Unit =
    (1 to n).foreach(_ => f)

  def isEven: Boolean = n % 2 == 0
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'scala' AND title = 'Implicit class' AND source_label = 'seed');

-- =============================================================================
-- PERL (slug: perl) — 15 snippets
-- =============================================================================

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'perl', 'Add function', 1, 'sub add {
    my ($a, $b) = @_;
    return $a + $b;
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'perl' AND title = 'Add function' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'perl', 'Max of two', 1, 'sub max {
    my ($a, $b) = @_;
    return $a > $b ? $a : $b;
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'perl' AND title = 'Max of two' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'perl', 'Print array', 1, 'my @nums = (1, 2, 3, 4, 5);
print join(", ", @nums), "\n";', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'perl' AND title = 'Print array' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'perl', 'Hash lookup', 2, 'my %ages = (alice => 30, bob => 25);
for my $name (sort keys %ages) {
    print "$name is $ages{$name}\n";
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'perl' AND title = 'Hash lookup' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'perl', 'Factorial', 2, 'sub factorial {
    my ($n) = @_;
    return 1 if $n <= 1;
    return $n * factorial($n - 1);
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'perl' AND title = 'Factorial' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'perl', 'Grep filter', 2, 'my @nums = (1..10);
my @evens = grep { $_ % 2 == 0 } @nums;
print join(", ", @evens), "\n";', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'perl' AND title = 'Grep filter' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'perl', 'Regex match', 3, 'sub extract_emails {
    my ($text) = @_;
    my @emails;
    while ($text =~ /(\S+@\S+\.\S+)/g) {
        push @emails, $1;
    }
    return @emails;
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'perl' AND title = 'Regex match' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'perl', 'File read', 3, 'sub read_lines {
    my ($path) = @_;
    open my $fh, "<", $path or die "Cannot open: $!";
    my @lines = <$fh>;
    chomp @lines;
    close $fh;
    return @lines;
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'perl' AND title = 'File read' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'perl', 'Word count', 3, 'sub word_count {
    my ($text) = @_;
    my %count;
    $count{$_}++ for split /\s+/, $text;
    return %count;
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'perl' AND title = 'Word count' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'perl', 'Map transform', 4, 'my @words = ("hello", "world", "perl");
my @upper = map { uc $_ } @words;
my @lengths = map { length $_ } @words;', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'perl' AND title = 'Map transform' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'perl', 'Sort custom', 4, 'sub sort_by_length {
    my @sorted = sort { length($a) <=> length($b) } @_;
    return @sorted;
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'perl' AND title = 'Sort custom' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'perl', 'Regex replace', 4, 'sub slugify {
    my ($str) = @_;
    $str = lc $str;
    $str =~ s/[^a-z0-9]+/-/g;
    $str =~ s/^-|-$//g;
    return $str;
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'perl' AND title = 'Regex replace' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'perl', 'Hash of arrays', 5, 'sub group_by_length {
    my @words = @_;
    my %groups;
    push @{$groups{length $_}}, $_ for @words;
    return %groups;
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'perl' AND title = 'Hash of arrays' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'perl', 'Closure counter', 5, 'sub make_counter {
    my $count = 0;
    return {
        inc => sub { $count++ },
        get => sub { $count },
    };
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'perl' AND title = 'Closure counter' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'perl', 'File write', 5, 'sub write_csv {
    my ($path, @rows) = @_;
    open my $fh, ">", $path or die "Cannot write: $!";
    for my $row (@rows) {
        print $fh join(",", @$row), "\n";
    }
    close $fh;
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'perl' AND title = 'File write' AND source_label = 'seed');

-- =============================================================================
-- MATLAB (slug: matlab) — 15 snippets
-- =============================================================================

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'matlab', 'Add function', 1, 'function result = add(a, b)
    result = a + b;
end', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'matlab' AND title = 'Add function' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'matlab', 'Max of two', 1, 'function m = maxVal(a, b)
    if a > b
        m = a;
    else
        m = b;
    end
end', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'matlab' AND title = 'Max of two' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'matlab', 'Linspace plot', 1, 'x = linspace(0, 2*pi, 100);
y = sin(x);
plot(x, y);
xlabel(''x'');
ylabel(''sin(x)'');', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'matlab' AND title = 'Linspace plot' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'matlab', 'Sum vector', 2, 'function s = sumVec(v)
    s = 0;
    for i = 1:length(v)
        s = s + v(i);
    end
end', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'matlab' AND title = 'Sum vector' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'matlab', 'Factorial', 2, 'function f = factorial(n)
    if n <= 1
        f = 1;
    else
        f = n * factorial(n - 1);
    end
end', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'matlab' AND title = 'Factorial' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'matlab', 'Matrix multiply', 2, 'A = [1 2; 3 4];
B = [5 6; 7 8];
C = A * B;
disp(C);', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'matlab' AND title = 'Matrix multiply' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'matlab', 'Fibonacci', 3, 'function f = fib(n)
    a = 0; b = 1;
    for i = 1:n
        temp = b;
        b = a + b;
        a = temp;
    end
    f = a;
end', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'matlab' AND title = 'Fibonacci' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'matlab', 'Dot product', 3, 'function d = dotProduct(u, v)
    d = sum(u .* v);
end', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'matlab' AND title = 'Dot product' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'matlab', 'Moving average', 3, 'function y = movAvg(x, k)
    n = length(x);
    y = zeros(1, n);
    for i = 1:n
        lo = max(1, i - k + 1);
        y(i) = mean(x(lo:i));
    end
end', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'matlab' AND title = 'Moving average' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'matlab', 'Matrix inverse', 4, 'function B = safeInverse(A)
    if det(A) == 0
        error(''Matrix is singular'');
    end
    B = inv(A);
end', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'matlab' AND title = 'Matrix inverse' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'matlab', 'Vectorized norm', 4, 'function d = euclidean(u, v)
    d = sqrt(sum((u - v) .^ 2));
end', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'matlab' AND title = 'Vectorized norm' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'matlab', 'Bisection method', 4, 'function c = bisect(f, a, b, tol)
    while (b - a) > tol
        c = (a + b) / 2;
        if f(c) * f(a) < 0
            b = c;
        else
            a = c;
        end
    end
    c = (a + b) / 2;
end', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'matlab' AND title = 'Bisection method' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'matlab', 'Linear system', 5, 'A = [2 1 -1; -3 -1 2; -2 1 2];
b = [8; -11; -3];
x = A \ b;
disp(x);', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'matlab' AND title = 'Linear system' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'matlab', 'Numerical integral', 5, 'function I = trapezoid(f, a, b, n)
    h = (b - a) / n;
    x = linspace(a, b, n + 1);
    y = arrayfun(f, x);
    I = h * (sum(y) - (y(1) + y(end)) / 2);
end', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'matlab' AND title = 'Numerical integral' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'matlab', 'Eigenvalue check', 5, 'function stable = isStable(A)
    eigenvalues = eig(A);
    stable = all(real(eigenvalues) < 0);
end', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'matlab' AND title = 'Eigenvalue check' AND source_label = 'seed');

-- =============================================================================
-- LUA (slug: lua) — 15 snippets
-- =============================================================================

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'lua', 'Add function', 1, 'function add(a, b)
    return a + b
end', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'lua' AND title = 'Add function' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'lua', 'Max of two', 1, 'function max(a, b)
    if a > b then
        return a
    end
    return b
end', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'lua' AND title = 'Max of two' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'lua', 'Table length', 1, 'local t = {10, 20, 30, 40, 50}
print("length: " .. #t)', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'lua' AND title = 'Table length' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'lua', 'Sum table', 2, 'function sum(t)
    local total = 0
    for _, v in ipairs(t) do
        total = total + v
    end
    return total
end', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'lua' AND title = 'Sum table' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'lua', 'Factorial', 2, 'function factorial(n)
    if n <= 1 then return 1 end
    return n * factorial(n - 1)
end', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'lua' AND title = 'Factorial' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'lua', 'Key value pairs', 2, 'local config = {host = "localhost", port = 8080}
for k, v in pairs(config) do
    print(k .. " = " .. tostring(v))
end', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'lua' AND title = 'Key value pairs' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'lua', 'String pattern', 3, 'function extractNumbers(s)
    local nums = {}
    for n in s:gmatch("%d+") do
        nums[#nums + 1] = tonumber(n)
    end
    return nums
end', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'lua' AND title = 'String pattern' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'lua', 'Fibonacci', 3, 'function fib(n)
    local a, b = 0, 1
    for i = 1, n do
        a, b = b, a + b
    end
    return a
end', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'lua' AND title = 'Fibonacci' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'lua', 'Table filter', 3, 'function filter(t, fn)
    local result = {}
    for _, v in ipairs(t) do
        if fn(v) then
            result[#result + 1] = v
        end
    end
    return result
end', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'lua' AND title = 'Table filter' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'lua', 'Closure counter', 4, 'function makeCounter()
    local count = 0
    return {
        inc = function() count = count + 1 end,
        get = function() return count end,
    }
end', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'lua' AND title = 'Closure counter' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'lua', 'Table map', 4, 'function map(t, fn)
    local result = {}
    for i, v in ipairs(t) do
        result[i] = fn(v)
    end
    return result
end', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'lua' AND title = 'Table map' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'lua', 'Memoize', 4, 'function memoize(fn)
    local cache = {}
    return function(x)
        if cache[x] == nil then
            cache[x] = fn(x)
        end
        return cache[x]
    end
end', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'lua' AND title = 'Memoize' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'lua', 'Metatable class', 5, 'local Vector = {}
Vector.__index = Vector

function Vector.new(x, y)
    return setmetatable({x = x, y = y}, Vector)
end

function Vector:length()
    return math.sqrt(self.x ^ 2 + self.y ^ 2)
end', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'lua' AND title = 'Metatable class' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'lua', 'Operator overload', 5, 'local Vec = {}
Vec.__index = Vec

function Vec.new(x, y)
    return setmetatable({x = x, y = y}, Vec)
end

function Vec.__add(a, b)
    return Vec.new(a.x + b.x, a.y + b.y)
end', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'lua' AND title = 'Operator overload' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'lua', 'Coroutine producer', 5, 'function producer(n)
    return coroutine.wrap(function()
        for i = 1, n do
            coroutine.yield(i * i)
        end
    end)
end', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'lua' AND title = 'Coroutine producer' AND source_label = 'seed');

-- =============================================================================
-- SWIFT (slug: swift) — 15 snippets
-- =============================================================================

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'swift', 'Add function', 1, 'func add(_ a: Int, _ b: Int) -> Int {
    return a + b
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'swift' AND title = 'Add function' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'swift', 'Is even', 1, 'func isEven(_ n: Int) -> Bool {
    return n % 2 == 0
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'swift' AND title = 'Is even' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'swift', 'Greet function', 1, 'func greet(name: String) -> String {
    return "Hello, \(name)!"
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'swift' AND title = 'Greet function' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'swift', 'Struct point', 2, 'struct Point {
    var x: Double
    var y: Double

    func distanceTo(_ other: Point) -> Double {
        let dx = x - other.x
        let dy = y - other.y
        return (dx * dx + dy * dy).squareRoot()
    }
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'swift' AND title = 'Struct point' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'swift', 'Optional unwrap', 2, 'func greetUser(_ name: String?) -> String {
    guard let name = name else {
        return "Hello, stranger!"
    }
    return "Hello, \(name)!"
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'swift' AND title = 'Optional unwrap' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'swift', 'Array filter', 2, 'func evens(_ nums: [Int]) -> [Int] {
    return nums.filter { $0 % 2 == 0 }
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'swift' AND title = 'Array filter' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'swift', 'Enum direction', 3, 'enum Direction: String {
    case north, south, east, west

    var opposite: Direction {
        switch self {
        case .north: return .south
        case .south: return .north
        case .east: return .west
        case .west: return .east
        }
    }
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'swift' AND title = 'Enum direction' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'swift', 'Closure sort', 3, 'func sortByLength(_ words: [String]) -> [String] {
    return words.sorted { $0.count < $1.count }
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'swift' AND title = 'Closure sort' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'swift', 'Dictionary count', 3, 'func wordCount(_ words: [String]) -> [String: Int] {
    var counts: [String: Int] = [:]
    for word in words {
        counts[word, default: 0] += 1
    }
    return counts
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'swift' AND title = 'Dictionary count' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'swift', 'Protocol shape', 4, 'protocol Shape {
    var area: Double { get }
}

struct Circle: Shape {
    let radius: Double
    var area: Double {
        return .pi * radius * radius
    }
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'swift' AND title = 'Protocol shape' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'swift', 'Map compact', 4, 'func parseInts(_ strings: [String]) -> [Int] {
    return strings.compactMap { Int($0) }
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'swift' AND title = 'Map compact' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'swift', 'Result type', 4, 'enum NetworkError: Error {
    case badURL
    case timeout
}

func fetchData(from url: String) -> Result<String, NetworkError> {
    guard url.hasPrefix("https") else {
        return .failure(.badURL)
    }
    return .success("data")
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'swift' AND title = 'Result type' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'swift', 'Generic stack', 5, 'struct Stack<Element> {
    private var items: [Element] = []

    mutating func push(_ item: Element) {
        items.append(item)
    }

    mutating func pop() -> Element? {
        return items.popLast()
    }

    var isEmpty: Bool { items.isEmpty }
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'swift' AND title = 'Generic stack' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'swift', 'Async fetch', 5, 'func fetchJSON(from url: URL) async throws -> Data {
    let (data, response) = try await URLSession.shared.data(from: url)
    guard let http = response as? HTTPURLResponse,
          http.statusCode == 200 else {
        throw URLError(.badServerResponse)
    }
    return data
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'swift' AND title = 'Async fetch' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'swift', 'Extension numeric', 5, 'extension Array where Element: Numeric {
    var total: Element {
        return reduce(.zero, +)
    }

    var average: Double {
        guard !isEmpty else { return 0 }
        return Double(total as! Int) / Double(count)
    }
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'swift' AND title = 'Extension numeric' AND source_label = 'seed');

-- =============================================================================
-- KOTLIN (slug: kotlin) — 15 snippets
-- =============================================================================

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'kotlin', 'Add function', 1, 'fun add(a: Int, b: Int): Int {
    return a + b
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'kotlin' AND title = 'Add function' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'kotlin', 'Max of two', 1, 'fun max(a: Int, b: Int): Int {
    return if (a > b) a else b
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'kotlin' AND title = 'Max of two' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'kotlin', 'Is even', 1, 'fun isEven(n: Int): Boolean = n % 2 == 0', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'kotlin' AND title = 'Is even' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'kotlin', 'Data class user', 2, 'data class User(
    val name: String,
    val email: String,
    val age: Int
)

fun greet(user: User): String {
    return "Hello, ${user.name}!"
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'kotlin' AND title = 'Data class user' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'kotlin', 'Nullable safe call', 2, 'fun getLength(s: String?): Int {
    return s?.length ?: 0
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'kotlin' AND title = 'Nullable safe call' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'kotlin', 'List filter', 2, 'fun evens(nums: List<Int>): List<Int> {
    return nums.filter { it % 2 == 0 }
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'kotlin' AND title = 'List filter' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'kotlin', 'When expression', 3, 'fun describe(n: Int): String = when {
    n < 0 -> "negative"
    n == 0 -> "zero"
    n in 1..10 -> "small"
    else -> "large"
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'kotlin' AND title = 'When expression' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'kotlin', 'Extension function', 3, 'fun String.wordCount(): Int {
    return this.trim().split("\\s+".toRegex()).size
}

fun String.isPalindrome(): Boolean {
    val clean = this.lowercase()
    return clean == clean.reversed()
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'kotlin' AND title = 'Extension function' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'kotlin', 'Map grouping', 3, 'fun groupByLength(words: List<String>): Map<Int, List<String>> {
    return words.groupBy { it.length }
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'kotlin' AND title = 'Map grouping' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'kotlin', 'Sealed class', 4, 'sealed class Result<out T> {
    data class Success<T>(val data: T) : Result<T>()
    data class Error(val message: String) : Result<Nothing>()
}

fun <T> Result<T>.getOrNull(): T? = when (this) {
    is Result.Success -> data
    is Result.Error -> null
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'kotlin' AND title = 'Sealed class' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'kotlin', 'Higher order', 4, 'fun <T> List<T>.customFilter(predicate: (T) -> Boolean): List<T> {
    val result = mutableListOf<T>()
    for (item in this) {
        if (predicate(item)) result.add(item)
    }
    return result
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'kotlin' AND title = 'Higher order' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'kotlin', 'Coroutine fetch', 4, 'suspend fun fetchData(url: String): String {
    return withContext(Dispatchers.IO) {
        val connection = URL(url).openConnection()
        connection.getInputStream().bufferedReader().readText()
    }
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'kotlin' AND title = 'Coroutine fetch' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'kotlin', 'Delegation pattern', 5, 'interface Logger {
    fun log(message: String)
}

class ConsoleLogger : Logger {
    override fun log(message: String) = println(message)
}

class Service(logger: Logger) : Logger by logger {
    fun doWork() {
        log("Working...")
    }
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'kotlin' AND title = 'Delegation pattern' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'kotlin', 'Inline reified', 5, 'inline fun <reified T> List<Any>.filterByType(): List<T> {
    return this.filterIsInstance<T>()
}

inline fun <reified T> String.parseAs(): T? {
    return when (T::class) {
        Int::class -> this.toIntOrNull() as? T
        Double::class -> this.toDoubleOrNull() as? T
        else -> null
    }
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'kotlin' AND title = 'Inline reified' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'kotlin', 'Flow builder', 5, 'fun countDown(from: Int): Flow<Int> = flow {
    for (i in from downTo 0) {
        emit(i)
        delay(1000)
    }
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'kotlin' AND title = 'Flow builder' AND source_label = 'seed');

-- =============================================================================
-- RUBY (slug: ruby) — 15 snippets
-- =============================================================================

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'ruby', 'Add method', 1, 'def add(a, b)
  a + b
end', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'ruby' AND title = 'Add method' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'ruby', 'Greet method', 1, 'def greet(name)
  "Hello, #{name}!"
end', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'ruby' AND title = 'Greet method' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'ruby', 'Even check', 1, 'def even?(n)
  n % 2 == 0
end', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'ruby' AND title = 'Even check' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'ruby', 'Array select', 2, 'def evens(nums)
  nums.select { |n| n.even? }
end

def odds(nums)
  nums.reject { |n| n.even? }
end', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'ruby' AND title = 'Array select' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'ruby', 'Hash defaults', 2, 'def word_count(words)
  counts = Hash.new(0)
  words.each { |w| counts[w] += 1 }
  counts
end', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'ruby' AND title = 'Hash defaults' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'ruby', 'Factorial', 2, 'def factorial(n)
  return 1 if n <= 1
  n * factorial(n - 1)
end', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'ruby' AND title = 'Factorial' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'ruby', 'Class person', 3, 'class Person
  attr_accessor :name, :age

  def initialize(name, age)
    @name = name
    @age = age
  end

  def to_s
    "#{@name} (#{@age})"
  end
end', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'ruby' AND title = 'Class person' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'ruby', 'Block yield', 3, 'def with_logging
  puts "Start"
  result = yield
  puts "End"
  result
end', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'ruby' AND title = 'Block yield' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'ruby', 'Map transform', 3, 'def double_all(nums)
  nums.map { |n| n * 2 }
end

def to_upper(words)
  words.map(&:upcase)
end', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'ruby' AND title = 'Map transform' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'ruby', 'Module mixin', 4, 'module Greetable
  def greet
    "Hello, I am #{name}"
  end
end

class User
  include Greetable
  attr_reader :name

  def initialize(name)
    @name = name
  end
end', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'ruby' AND title = 'Module mixin' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'ruby', 'Proc and lambda', 4, 'square = ->(x) { x * x }
double = proc { |x| x * 2 }

def apply(fn, value)
  fn.call(value)
end', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'ruby' AND title = 'Proc and lambda' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'ruby', 'Enumerable reduce', 4, 'def sum(nums)
  nums.reduce(0) { |acc, n| acc + n }
end

def product(nums)
  nums.reduce(1, :*)
end', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'ruby' AND title = 'Enumerable reduce' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'ruby', 'Method missing', 5, 'class FlexiHash
  def initialize
    @data = {}
  end

  def method_missing(name, *args)
    key = name.to_s
    if key.end_with?("=")
      @data[key.chomp("=")] = args.first
    else
      @data[key]
    end
  end
end', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'ruby' AND title = 'Method missing' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'ruby', 'Enumerator lazy', 5, 'def fibonacci
  Enumerator.new do |y|
    a, b = 0, 1
    loop do
      y.yield a
      a, b = b, a + b
    end
  end
end', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'ruby' AND title = 'Enumerator lazy' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'ruby', 'Comparable mixin', 5, 'class Temperature
  include Comparable

  attr_reader :degrees

  def initialize(degrees)
    @degrees = degrees
  end

  def <=>(other)
    @degrees <=> other.degrees
  end
end', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'ruby' AND title = 'Comparable mixin' AND source_label = 'seed');

-- =============================================================================
-- DART (slug: dart) — 15 snippets
-- =============================================================================

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'dart', 'Add function', 1, 'int add(int a, int b) {
  return a + b;
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'dart' AND title = 'Add function' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'dart', 'Is even', 1, 'bool isEven(int n) {
  return n % 2 == 0;
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'dart' AND title = 'Is even' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'dart', 'Greet function', 1, 'String greet(String name) {
  return ''Hello, $name!'';
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'dart' AND title = 'Greet function' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'dart', 'Named parameters', 2, 'String buildGreeting({
  required String name,
  String greeting = ''Hello'',
}) {
  return ''$greeting, $name!'';
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'dart' AND title = 'Named parameters' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'dart', 'Null safety', 2, 'String describeLength(String? text) {
  final length = text?.length ?? 0;
  return ''Length: $length'';
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'dart' AND title = 'Null safety' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'dart', 'List operations', 2, 'List<int> evens(List<int> nums) {
  return nums.where((n) => n % 2 == 0).toList();
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'dart' AND title = 'List operations' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'dart', 'Class point', 3, 'class Point {
  final double x;
  final double y;

  const Point(this.x, this.y);

  double distanceTo(Point other) {
    final dx = x - other.x;
    final dy = y - other.y;
    return (dx * dx + dy * dy).sqrt();
  }
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'dart' AND title = 'Class point' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'dart', 'Enum with method', 3, 'enum Status {
  active,
  inactive,
  pending;

  bool get isActive => this == Status.active;

  String get label => name.toUpperCase();
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'dart' AND title = 'Enum with method' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'dart', 'Map transform', 3, 'Map<String, int> wordCount(List<String> words) {
  final counts = <String, int>{};
  for (final word in words) {
    counts[word] = (counts[word] ?? 0) + 1;
  }
  return counts;
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'dart' AND title = 'Map transform' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'dart', 'Async await', 4, 'Future<String> fetchData(String url) async {
  final response = await http.get(Uri.parse(url));
  if (response.statusCode == 200) {
    return response.body;
  }
  throw Exception(''Failed: ${response.statusCode}'');
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'dart' AND title = 'Async await' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'dart', 'Extension method', 4, 'extension StringUtils on String {
  String truncate(int maxLen) {
    if (length <= maxLen) return this;
    return ''${substring(0, maxLen)}...'';
  }

  bool get isBlank => trim().isEmpty;
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'dart' AND title = 'Extension method' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'dart', 'Factory constructor', 4, 'class Logger {
  static final Map<String, Logger> _cache = {};
  final String name;

  Logger._(this.name);

  factory Logger(String name) {
    return _cache.putIfAbsent(name, () => Logger._(name));
  }
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'dart' AND title = 'Factory constructor' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'dart', 'Generic stack', 5, 'class Stack<T> {
  final List<T> _items = [];

  void push(T item) => _items.add(item);

  T pop() {
    if (_items.isEmpty) throw StateError(''Empty stack'');
    return _items.removeLast();
  }

  bool get isEmpty => _items.isEmpty;
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'dart' AND title = 'Generic stack' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'dart', 'Stream transform', 5, 'Stream<int> countDown(int from) async* {
  for (var i = from; i >= 0; i--) {
    await Future.delayed(Duration(seconds: 1));
    yield i;
  }
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'dart' AND title = 'Stream transform' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'dart', 'Mixin pattern', 5, 'mixin Validator {
  bool isValidEmail(String email) {
    return RegExp(r''^[\w.]+@[\w.]+\.\w+$'').hasMatch(email);
  }

  bool isValidAge(int age) {
    return age >= 0 && age <= 150;
  }
}

class UserForm with Validator {
  final String email;
  final int age;
  UserForm(this.email, this.age);
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'dart' AND title = 'Mixin pattern' AND source_label = 'seed');

-- =============================================================================
-- R (slug: r) — 15 snippets
-- =============================================================================

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'r', 'Add function', 1, 'add <- function(a, b) {
  a + b
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'r' AND title = 'Add function' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'r', 'Is even', 1, 'is_even <- function(n) {
  n %% 2 == 0
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'r' AND title = 'Is even' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'r', 'Vector operations', 1, 'x <- c(1, 2, 3, 4, 5)
squares <- x^2
total <- sum(squares)', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'r' AND title = 'Vector operations' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'r', 'Factorial', 2, 'factorial_r <- function(n) {
  if (n <= 1) return(1)
  n * factorial_r(n - 1)
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'r' AND title = 'Factorial' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'r', 'Filter vector', 2, 'get_evens <- function(nums) {
  nums[nums %% 2 == 0]
}

get_positive <- function(nums) {
  nums[nums > 0]
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'r' AND title = 'Filter vector' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'r', 'Data frame create', 2, 'df <- data.frame(
  name = c("Alice", "Bob", "Carol"),
  age = c(30, 25, 35),
  score = c(90, 85, 95)
)
avg_score <- mean(df$score)', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'r' AND title = 'Data frame create' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'r', 'Apply function', 3, 'mat <- matrix(1:12, nrow = 3)
row_sums <- apply(mat, 1, sum)
col_means <- apply(mat, 2, mean)', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'r' AND title = 'Apply function' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'r', 'Sapply transform', 3, 'words <- c("hello", "world", "foo")
lengths <- sapply(words, nchar)
upper <- sapply(words, toupper)', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'r' AND title = 'Sapply transform' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'r', 'Named list', 3, 'make_stats <- function(x) {
  list(
    mean = mean(x),
    sd = sd(x),
    min = min(x),
    max = max(x)
  )
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'r' AND title = 'Named list' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'r', 'Matrix multiply', 4, 'mat_multiply <- function(a, b) {
  if (ncol(a) != nrow(b)) {
    stop("Incompatible dimensions")
  }
  a %*% b
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'r' AND title = 'Matrix multiply' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'r', 'Lapply map', 4, 'files <- list("a.csv", "b.csv", "c.csv")
data_list <- lapply(files, read.csv)
row_counts <- sapply(data_list, nrow)', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'r' AND title = 'Lapply map' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'r', 'Aggregate group', 4, 'summarize_by <- function(df, group_col, val_col) {
  aggregate(
    df[[val_col]] ~ df[[group_col]],
    data = df,
    FUN = mean
  )
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'r' AND title = 'Aggregate group' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'r', 'Environment closure', 5, 'make_counter <- function(start = 0) {
  count <- start
  list(
    inc = function() count <<- count + 1,
    get = function() count,
    reset = function() count <<- start
  )
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'r' AND title = 'Environment closure' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'r', 'TryCatch error', 5, 'safe_divide <- function(a, b) {
  tryCatch(
    a / b,
    warning = function(w) NA,
    error = function(e) {
      message("Error: ", e$message)
      NA
    }
  )
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'r' AND title = 'TryCatch error' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'r', 'S3 class', 5, 'new_point <- function(x, y) {
  obj <- list(x = x, y = y)
  class(obj) <- "Point"
  obj
}

print.Point <- function(p, ...) {
  cat(sprintf("(%g, %g)\n", p$x, p$y))
}

distance <- function(p1, p2) {
  sqrt((p1$x - p2$x)^2 + (p1$y - p2$y)^2)
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'r' AND title = 'S3 class' AND source_label = 'seed');

-- =============================================================================
-- CLOJURE (slug: clojure) — 15 snippets
-- =============================================================================

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'clojure', 'Square function', 1, '(defn square [x]
  (* x x))', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'clojure' AND title = 'Square function' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'clojure', 'Add two numbers', 1, '(defn add [a b]
  (+ a b))', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'clojure' AND title = 'Add two numbers' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'clojure', 'Greet function', 1, '(defn greet [name]
  (str "Hello, " name "!"))', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'clojure' AND title = 'Greet function' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'clojure', 'Let binding sum', 2, '(defn sum-pair [a b]
  (let [total (+ a b)]
    (str "Sum: " total)))', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'clojure' AND title = 'Let binding sum' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'clojure', 'Filter evens', 2, '(defn evens [nums]
  (filter even? nums))', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'clojure' AND title = 'Filter evens' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'clojure', 'Map double', 2, '(defn double-all [nums]
  (map #(* 2 %) nums))', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'clojure' AND title = 'Map double' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'clojure', 'Reduce sum', 3, '(defn sum [nums]
  (reduce + 0 nums))', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'clojure' AND title = 'Reduce sum' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'clojure', 'Factorial', 3, '(defn factorial [n]
  (if (<= n 1)
    1
    (* n (factorial (dec n)))))', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'clojure' AND title = 'Factorial' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'clojure', 'Destructure map', 3, '(defn full-name [{:keys [first last]}]
  (str first " " last))', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'clojure' AND title = 'Destructure map' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'clojure', 'Threading macro', 4, '(defn process [s]
  (->> s
       clojure.string/lower-case
       (filter #(Character/isLetter %))
       (apply str)))', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'clojure' AND title = 'Threading macro' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'clojure', 'Atom counter', 4, '(def counter (atom 0))

(defn increment! []
  (swap! counter inc))

(defn get-count []
  @counter)', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'clojure' AND title = 'Atom counter' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'clojure', 'Word frequency', 4, '(defn word-freq [text]
  (->> (clojure.string/split text #"\s+")
       (frequencies)))', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'clojure' AND title = 'Word frequency' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'clojure', 'Fibonacci lazy', 5, '(def fibs
  (lazy-seq
    (map first
      (iterate (fn [[a b]] [b (+ a b)]) [0 1]))))', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'clojure' AND title = 'Fibonacci lazy' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'clojure', 'Multimethod dispatch', 5, '(defmulti area :shape)

(defmethod area :circle [{:keys [radius]}]
  (* Math/PI radius radius))

(defmethod area :rect [{:keys [w h]}]
  (* w h))', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'clojure' AND title = 'Multimethod dispatch' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'clojure', 'Comp and partial', 5, '(def inc-and-double
  (comp (partial * 2) inc))

(defn transform [nums]
  (map inc-and-double nums))', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'clojure' AND title = 'Comp and partial' AND source_label = 'seed');

-- =============================================================================
-- JULIA (slug: julia) — 15 snippets
-- =============================================================================

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'julia', 'Add function', 1, 'function add(a, b)
    a + b
end', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'julia' AND title = 'Add function' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'julia', 'Square inline', 1, 'square(x) = x * x', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'julia' AND title = 'Square inline' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'julia', 'Greet function', 1, 'function greet(name::String)
    "Hello, $name!"
end', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'julia' AND title = 'Greet function' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'julia', 'Factorial', 2, 'function factorial(n::Int)
    n <= 1 ? 1 : n * factorial(n - 1)
end', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'julia' AND title = 'Factorial' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'julia', 'Sum array', 2, 'function mysum(arr::Vector{Int})
    total = 0
    for x in arr
        total += x
    end
    total
end', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'julia' AND title = 'Sum array' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'julia', 'Comprehension filter', 2, 'function evens(nums::Vector{Int})
    [x for x in nums if x % 2 == 0]
end', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'julia' AND title = 'Comprehension filter' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'julia', 'Multiple dispatch', 3, 'function describe(x::Int)
    "integer: $x"
end

function describe(x::Float64)
    "float: $x"
end

function describe(x::String)
    "string: $x"
end', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'julia' AND title = 'Multiple dispatch' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'julia', 'Struct definition', 3, 'struct Point
    x::Float64
    y::Float64
end

distance(a::Point, b::Point) = sqrt((a.x - b.x)^2 + (a.y - b.y)^2)', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'julia' AND title = 'Struct definition' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'julia', 'Fibonacci', 3, 'function fib(n::Int)
    a, b = 0, 1
    for _ in 1:n
        a, b = b, a + b
    end
    a
end', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'julia' AND title = 'Fibonacci' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'julia', 'Matrix multiply', 4, 'function matmul(A::Matrix{Float64}, B::Matrix{Float64})
    m, n = size(A)
    n2, p = size(B)
    C = zeros(Float64, m, p)
    for i in 1:m, j in 1:p, k in 1:n
        C[i, j] += A[i, k] * B[k, j]
    end
    C
end', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'julia' AND title = 'Matrix multiply' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'julia', 'Map and broadcast', 4, 'function transform(data::Vector{Float64})
    scaled = data .* 2.0
    shifted = scaled .+ 1.0
    map(x -> round(x; digits=2), shifted)
end', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'julia' AND title = 'Map and broadcast' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'julia', 'Sort by length', 4, 'function sort_by_length(words::Vector{String})
    sort(words; by=length, rev=true)
end', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'julia' AND title = 'Sort by length' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'julia', 'Parametric type', 5, 'struct Stack{T}
    items::Vector{T}
end

Stack{T}() where {T} = Stack{T}(T[])

function push!(s::Stack{T}, x::T) where {T}
    Base.push!(s.items, x)
end', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'julia' AND title = 'Parametric type' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'julia', 'Generator expression', 5, 'function stats(data::Vector{Float64})
    n = length(data)
    mean = sum(data) / n
    var = sum((x - mean)^2 for x in data) / (n - 1)
    (mean=mean, std=sqrt(var))
end', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'julia' AND title = 'Generator expression' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'julia', 'Abstract type hierarchy', 5, 'abstract type Shape end

struct Circle <: Shape
    radius::Float64
end

struct Rect <: Shape
    w::Float64
    h::Float64
end

area(c::Circle) = pi * c.radius^2
area(r::Rect) = r.w * r.h', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'julia' AND title = 'Abstract type hierarchy' AND source_label = 'seed');

-- =============================================================================
-- ASSEMBLY (slug: assembly-language) — 15 snippets
-- =============================================================================

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'assembly-language', 'Move registers', 1, 'mov rax, 42
mov rbx, rax
mov rcx, rbx', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'assembly-language' AND title = 'Move registers' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'assembly-language', 'Add two values', 1, 'mov rax, 10
mov rbx, 20
add rax, rbx', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'assembly-language' AND title = 'Add two values' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'assembly-language', 'Subtract values', 1, 'mov rax, 50
mov rbx, 15
sub rax, rbx', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'assembly-language' AND title = 'Subtract values' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'assembly-language', 'Compare and jump', 2, 'mov rax, 5
cmp rax, 10
jl less_than
mov rbx, 0
jmp done
less_than:
mov rbx, 1
done:', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'assembly-language' AND title = 'Compare and jump' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'assembly-language', 'Push and pop', 2, 'push rax
push rbx
push rcx
pop rcx
pop rbx
pop rax', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'assembly-language' AND title = 'Push and pop' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'assembly-language', 'Increment loop', 2, 'mov rcx, 0
loop_start:
inc rcx
cmp rcx, 10
jl loop_start', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'assembly-language' AND title = 'Increment loop' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'assembly-language', 'Multiply values', 3, 'mov rax, 7
mov rbx, 6
imul rax, rbx', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'assembly-language' AND title = 'Multiply values' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'assembly-language', 'Bitwise operations', 3, 'mov rax, 0xFF
and rax, 0x0F
or rax, 0x30
xor rbx, rbx', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'assembly-language' AND title = 'Bitwise operations' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'assembly-language', 'Data section', 3, 'section .data
msg db "Hello", 0
len equ $ - msg

section .text
global _start
_start:
mov rdi, 1
lea rsi, [msg]
mov rdx, len', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'assembly-language' AND title = 'Data section' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'assembly-language', 'Function call', 4, 'section .text
global _start
_start:
mov rdi, 5
call double_val
mov rbx, rax
jmp exit

double_val:
mov rax, rdi
add rax, rdi
ret

exit:
mov rax, 60
xor rdi, rdi
syscall', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'assembly-language' AND title = 'Function call' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'assembly-language', 'Conditional max', 4, 'mov rax, [val_a]
mov rbx, [val_b]
cmp rax, rbx
jge store_max
mov rax, rbx
store_max:
mov [result], rax', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'assembly-language' AND title = 'Conditional max' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'assembly-language', 'Stack frame', 4, 'my_func:
push rbp
mov rbp, rsp
sub rsp, 16
mov qword [rbp-8], rdi
mov rax, [rbp-8]
add rax, 1
leave
ret', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'assembly-language' AND title = 'Stack frame' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'assembly-language', 'Sum array loop', 5, 'mov rcx, 0
xor rax, rax
sum_loop:
cmp rcx, [arr_len]
jge sum_done
add rax, [arr + rcx*8]
inc rcx
jmp sum_loop
sum_done:', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'assembly-language' AND title = 'Sum array loop' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'assembly-language', 'Sys write call', 5, 'section .data
msg db "Hello, world!", 10
len equ $ - msg

section .text
global _start
_start:
mov rax, 1
mov rdi, 1
lea rsi, [msg]
mov rdx, len
syscall
mov rax, 60
xor rdi, rdi
syscall', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'assembly-language' AND title = 'Sys write call' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'assembly-language', 'BSS and shift', 5, 'section .bss
buffer resb 64

section .text
mov rax, 1
shl rax, 4
mov rbx, rax
shr rbx, 2
lea rdi, [buffer]
mov [rdi], rax
mov [rdi+8], rbx', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'assembly-language' AND title = 'BSS and shift' AND source_label = 'seed');

-- =============================================================================
-- POWERSHELL (slug: powershell) — 15 snippets
-- =============================================================================

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'powershell', 'Variable assignment', 1, '$name = "World"
$greeting = "Hello, $name!"
Write-Output $greeting', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'powershell' AND title = 'Variable assignment' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'powershell', 'Simple function', 1, 'function Add($a, $b) {
    return $a + $b
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'powershell' AND title = 'Simple function' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'powershell', 'Array basics', 1, '$nums = @(1, 2, 3, 4, 5)
$first = $nums[0]
$last = $nums[-1]
$count = $nums.Count', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'powershell' AND title = 'Array basics' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'powershell', 'If else', 2, 'function Test-Even($n) {
    if ($n % 2 -eq 0) {
        return $true
    } else {
        return $false
    }
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'powershell' AND title = 'If else' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'powershell', 'Pipeline filter', 2, '$evens = 1..20 | Where-Object { $_ % 2 -eq 0 }
$squares = $evens | ForEach-Object { $_ * $_ }', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'powershell' AND title = 'Pipeline filter' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'powershell', 'Hashtable', 2, '$config = @{
    Host = "localhost"
    Port = 8080
    Debug = $true
}
$config["Host"]', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'powershell' AND title = 'Hashtable' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'powershell', 'ForEach loop', 3, 'function Sum-Array($nums) {
    $total = 0
    foreach ($n in $nums) {
        $total += $n
    }
    return $total
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'powershell' AND title = 'ForEach loop' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'powershell', 'String operations', 3, '$text = "Hello, World!"
$upper = $text.ToUpper()
$replaced = $text -replace "World", "PowerShell"
$split = $text.Split(", ")', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'powershell' AND title = 'String operations' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'powershell', 'Switch statement', 3, 'function Get-StatusText($code) {
    switch ($code) {
        200 { "OK" }
        404 { "Not Found" }
        500 { "Server Error" }
        default { "Unknown" }
    }
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'powershell' AND title = 'Switch statement' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'powershell', 'Typed parameters', 4, 'function Get-Greeting {
    param(
        [Parameter(Mandatory)]
        [string]$Name,
        [int]$Times = 1
    )
    1..$Times | ForEach-Object {
        "Hello, $Name!"
    }
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'powershell' AND title = 'Typed parameters' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'powershell', 'Try catch', 4, 'function Divide($a, $b) {
    try {
        if ($b -eq 0) {
            throw "Division by zero"
        }
        return $a / $b
    } catch {
        Write-Error $_.Exception.Message
    }
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'powershell' AND title = 'Try catch' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'powershell', 'Custom object', 4, '$user = [PSCustomObject]@{
    Name  = "Alice"
    Email = "alice@example.com"
    Age   = 30
}
$user | Select-Object Name, Email', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'powershell' AND title = 'Custom object' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'powershell', 'Pipeline chain', 5, 'function Get-WordCount($text) {
    $text -split ''\s+'' |
        Group-Object |
        Sort-Object Count -Descending |
        Select-Object Name, Count
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'powershell' AND title = 'Pipeline chain' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'powershell', 'Class definition', 5, 'class Counter {
    [int]$Value = 0

    [void]Increment() {
        $this.Value++
    }

    [string]ToString() {
        return "Count: $($this.Value)"
    }
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'powershell' AND title = 'Class definition' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'powershell', 'Splatting call', 5, 'function Send-Request {
    param([string]$Uri, [string]$Method, [hashtable]$Headers)
    "$Method $Uri"
}

$params = @{
    Uri     = "https://api.example.com/data"
    Method  = "POST"
    Headers = @{ Authorization = "Bearer token" }
}
Send-Request @params', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'powershell' AND title = 'Splatting call' AND source_label = 'seed');

-- =============================================================================
-- F# (slug: fsharp) — 15 snippets
-- =============================================================================

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'fsharp', 'Add function', 1, 'let add a b = a + b', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'fsharp' AND title = 'Add function' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'fsharp', 'Square function', 1, 'let square x = x * x', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'fsharp' AND title = 'Square function' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'fsharp', 'Greet function', 1, 'let greet name =
    sprintf "Hello, %s!" name', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'fsharp' AND title = 'Greet function' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'fsharp', 'Pipe operator', 2, 'let result =
    [1; 2; 3; 4; 5]
    |> List.filter (fun x -> x % 2 = 0)
    |> List.map (fun x -> x * x)', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'fsharp' AND title = 'Pipe operator' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'fsharp', 'Factorial', 2, 'let rec factorial n =
    if n <= 1 then 1
    else n * factorial (n - 1)', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'fsharp' AND title = 'Factorial' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'fsharp', 'Tuple function', 2, 'let swap (a, b) = (b, a)

let minMax lst =
    (List.min lst, List.max lst)', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'fsharp' AND title = 'Tuple function' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'fsharp', 'Pattern match', 3, 'let describe n =
    match n with
    | 0 -> "zero"
    | x when x > 0 -> "positive"
    | _ -> "negative"', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'fsharp' AND title = 'Pattern match' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'fsharp', 'Record type', 3, 'type Person = {
    Name: string
    Age: int
}

let greetPerson p =
    sprintf "%s is %d years old" p.Name p.Age', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'fsharp' AND title = 'Record type' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'fsharp', 'List operations', 3, 'let sumOfSquares nums =
    nums
    |> List.map (fun x -> x * x)
    |> List.fold (+) 0', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'fsharp' AND title = 'List operations' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'fsharp', 'Discriminated union', 4, 'type Shape =
    | Circle of float
    | Rect of float * float

let area shape =
    match shape with
    | Circle r -> System.Math.PI * r * r
    | Rect (w, h) -> w * h', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'fsharp' AND title = 'Discriminated union' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'fsharp', 'Option handling', 4, 'let tryDivide a b =
    if b = 0 then None
    else Some (a / b)

let showResult opt =
    match opt with
    | Some v -> sprintf "Result: %d" v
    | None -> "Cannot divide by zero"', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'fsharp' AND title = 'Option handling' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'fsharp', 'Higher order', 4, 'let apply f x = f x
let compose f g x = f (g x)

let incThenDouble =
    compose (fun x -> x * 2) (fun x -> x + 1)', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'fsharp' AND title = 'Higher order' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'fsharp', 'Result type', 5, 'type Result<''T, ''E> =
    | Ok of ''T
    | Error of ''E

let parseAge s =
    match System.Int32.TryParse(s) with
    | true, n when n > 0 -> Ok n
    | _ -> Error "Invalid age"', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'fsharp' AND title = 'Result type' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'fsharp', 'Active pattern', 5, 'let (|Even|Odd|) n =
    if n % 2 = 0 then Even else Odd

let classify n =
    match n with
    | Even -> sprintf "%d is even" n
    | Odd -> sprintf "%d is odd" n', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'fsharp' AND title = 'Active pattern' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'fsharp', 'Computation expression', 5, 'let safeDiv a b =
    if b = 0 then None else Some (a / b)

let computation =
    let (>>=) m f =
        match m with
        | Some x -> f x
        | None -> None
    Some 100 >>= (fun x ->
    safeDiv x 5 >>= (fun y ->
    Some (y + 1)))', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'fsharp' AND title = 'Computation expression' AND source_label = 'seed');

-- =============================================================================
-- SHELL (slug: shell) — 15 snippets
-- =============================================================================

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'shell', 'Variable assignment', 1, 'name="world"
echo "Hello, $name"', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'shell' AND title = 'Variable assignment' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'shell', 'Read input', 1, 'printf "Enter name: "
read name
echo "Hello, $name"', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'shell' AND title = 'Read input' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'shell', 'Exit status check', 1, 'if [ $? -eq 0 ]; then
    echo "success"
else
    echo "failure"
fi', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'shell' AND title = 'Exit status check' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'shell', 'File existence test', 2, 'if [ -f "$1" ]; then
    echo "File exists"
elif [ -d "$1" ]; then
    echo "Directory exists"
else
    echo "Not found"
fi', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'shell' AND title = 'File existence test' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'shell', 'For loop', 2, 'for i in 1 2 3 4 5; do
    echo "Number: $i"
done', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'shell' AND title = 'For loop' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'shell', 'While counter', 2, 'i=1
while [ "$i" -le 10 ]; do
    echo "$i"
    i=$((i + 1))
done', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'shell' AND title = 'While counter' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'shell', 'Function definition', 3, 'greet() {
    name=${1:-"World"}
    echo "Hello, $name!"
}
greet "Alice"', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'shell' AND title = 'Function definition' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'shell', 'Case statement', 3, 'case "$1" in
    start)  echo "Starting...";;
    stop)   echo "Stopping...";;
    *)      echo "Usage: $0 {start|stop}";;
esac', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'shell' AND title = 'Case statement' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'shell', 'Pipe chain', 3, 'cat /etc/passwd | cut -d: -f1 | sort | head -5', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'shell' AND title = 'Pipe chain' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'shell', 'Redirect stderr', 4, 'exec 2>/tmp/errors.log
echo "stdout message"
echo "stderr message" >&2', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'shell' AND title = 'Redirect stderr' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'shell', 'Trap cleanup', 4, 'cleanup() {
    rm -f "$tmpfile"
    echo "Cleaned up"
}
trap cleanup EXIT
tmpfile=$(mktemp)', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'shell' AND title = 'Trap cleanup' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'shell', 'Read file lines', 4, 'while IFS= read -r line; do
    echo "Line: $line"
done < "$1"', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'shell' AND title = 'Read file lines' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'shell', 'Argument parsing', 5, 'while [ $# -gt 0 ]; do
    case "$1" in
        -v) verbose=1;;
        -o) shift; output="$1";;
        *)  files="$files $1";;
    esac
    shift
done', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'shell' AND title = 'Argument parsing' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'shell', 'Here document', 5, 'cat <<EOF > config.txt
host=$HOST
port=${PORT:-8080}
user=$(whoami)
EOF', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'shell' AND title = 'Here document' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'shell', 'Subshell pipeline', 5, 'total=0
find . -name "*.log" -print0 | while IFS= read -r -d '''' file; do
    lines=$(wc -l < "$file")
    echo "$file: $lines lines"
done', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'shell' AND title = 'Subshell pipeline' AND source_label = 'seed');

-- =============================================================================
-- BASH (slug: bash) — 15 snippets
-- =============================================================================

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'bash', 'Array declaration', 1, 'fruits=("apple" "banana" "cherry")
echo "${fruits[0]}"
echo "${#fruits[@]}"', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'bash' AND title = 'Array declaration' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'bash', 'String length', 1, 'str="Hello, World!"
echo "${#str}"', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'bash' AND title = 'String length' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'bash', 'Brace expansion', 1, 'mkdir -p project/{src,test,docs}
touch project/src/{main,util}.sh', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'bash' AND title = 'Brace expansion' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'bash', 'Substring extraction', 2, 'path="/home/user/docs/file.txt"
echo "${path##*/}"
echo "${path%/*}"', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'bash' AND title = 'Substring extraction' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'bash', 'Extended test', 2, 'if [[ "$str" =~ ^[0-9]+$ ]]; then
    echo "numeric"
elif [[ -z "$str" ]]; then
    echo "empty"
fi', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'bash' AND title = 'Extended test' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'bash', 'Array iteration', 2, 'names=("Alice" "Bob" "Carol")
for name in "${names[@]}"; do
    echo "Hello, $name"
done', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'bash' AND title = 'Array iteration' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'bash', 'Here string', 3, 'read -r first rest <<< "Hello World"
echo "First word: $first"
echo "Rest: $rest"', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'bash' AND title = 'Here string' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'bash', 'Associative array', 3, 'declare -A colors
colors[red]="#ff0000"
colors[green]="#00ff00"
for key in "${!colors[@]}"; do
    echo "$key: ${colors[$key]}"
done', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'bash' AND title = 'Associative array' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'bash', 'Process substitution', 3, 'diff <(sort file1.txt) <(sort file2.txt)', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'bash' AND title = 'Process substitution' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'bash', 'String replacement', 4, 'filename="photo_2024_raw.jpg"
echo "${filename/raw/final}"
echo "${filename//_/-}"', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'bash' AND title = 'String replacement' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'bash', 'Mapfile readarray', 4, 'mapfile -t lines < input.txt
echo "Total lines: ${#lines[@]}"
for line in "${lines[@]}"; do
    echo "> $line"
done', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'bash' AND title = 'Mapfile readarray' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'bash', 'Coprocess', 4, 'coproc BC { bc -l; }
echo "scale=4; 22/7" >&"${BC[1]}"
read -r result <&"${BC[0]}"
echo "Pi approx: $result"', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'bash' AND title = 'Coprocess' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'bash', 'Array slicing', 5, 'nums=(10 20 30 40 50 60)
slice=("${nums[@]:2:3}")
echo "${slice[@]}"
nums+=("70" "80")
unset ''nums[1]''
echo "${nums[@]}"', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'bash' AND title = 'Array slicing' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'bash', 'Nameref variable', 5, 'populate() {
    local -n ref=$1
    ref=("alpha" "beta" "gamma")
}
declare -a items
populate items
echo "${items[@]}"', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'bash' AND title = 'Nameref variable' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'bash', 'Extglob pattern', 5, 'shopt -s extglob
for f in !(*.log|*.tmp); do
    echo "Keep: $f"
done
shopt -u extglob', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'bash' AND title = 'Extglob pattern' AND source_label = 'seed');

-- =============================================================================
-- OBJECTIVE-C (slug: objective-c) — 15 snippets
-- =============================================================================

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'objective-c', 'String creation', 1, 'NSString *greeting = @"Hello, World!";
NSLog(@"%@", greeting);', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'objective-c' AND title = 'String creation' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'objective-c', 'Number boxing', 1, 'NSNumber *age = @25;
NSNumber *pi = @3.14;
NSLog(@"%@ %@", age, pi);', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'objective-c' AND title = 'Number boxing' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'objective-c', 'Array literal', 1, 'NSArray *colors = @[@"red", @"green", @"blue"];
NSLog(@"First: %@", colors[0]);', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'objective-c' AND title = 'Array literal' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'objective-c', 'String format', 2, 'NSString *name = @"Alice";
NSInteger score = 42;
NSString *msg = [NSString stringWithFormat:@"%@ scored %ld", name, (long)score];', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'objective-c' AND title = 'String format' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'objective-c', 'Dictionary literal', 2, 'NSDictionary *user = @{
    @"name": @"Bob",
    @"age": @30,
    @"active": @YES
};
NSLog(@"%@", user[@"name"]);', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'objective-c' AND title = 'Dictionary literal' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'objective-c', 'Fast enumeration', 2, 'NSArray *items = @[@"a", @"b", @"c"];
for (NSString *item in items) {
    NSLog(@"%@", item);
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'objective-c' AND title = 'Fast enumeration' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'objective-c', 'Method declaration', 3, '- (NSInteger)addA:(NSInteger)a toB:(NSInteger)b {
    return a + b;
}

- (BOOL)isEven:(NSInteger)n {
    return n % 2 == 0;
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'objective-c' AND title = 'Method declaration' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'objective-c', 'Mutable array', 3, 'NSMutableArray *stack = [NSMutableArray array];
[stack addObject:@"first"];
[stack addObject:@"second"];
[stack removeLastObject];
NSLog(@"%@", stack);', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'objective-c' AND title = 'Mutable array' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'objective-c', 'String methods', 3, 'NSString *path = @"/usr/local/bin/tool";
NSString *last = [path lastPathComponent];
NSString *upper = [last uppercaseString];
BOOL hasPrefix = [path hasPrefix:@"/usr"];', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'objective-c' AND title = 'String methods' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'objective-c', 'Block variable', 4, 'NSInteger (^square)(NSInteger) = ^(NSInteger n) {
    return n * n;
};
NSLog(@"%ld", (long)square(5));', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'objective-c' AND title = 'Block variable' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'objective-c', 'Protocol definition', 4, '@protocol Drawable <NSObject>
- (void)draw;
@optional
- (void)setColor:(NSString *)color;
@end', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'objective-c' AND title = 'Protocol definition' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'objective-c', 'Property synthesis', 4, '@interface Person : NSObject
@property (nonatomic, copy) NSString *name;
@property (nonatomic, assign) NSInteger age;
- (NSString *)greeting;
@end', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'objective-c' AND title = 'Property synthesis' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'objective-c', 'Category extension', 5, '@interface NSString (Reverse)
- (NSString *)reversedString;
@end

@implementation NSString (Reverse)
- (NSString *)reversedString {
    NSMutableString *rev = [NSMutableString string];
    for (NSInteger i = self.length - 1; i >= 0; i--) {
        [rev appendFormat:@"%c", [self characterAtIndex:i]];
    }
    return rev;
}
@end', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'objective-c' AND title = 'Category extension' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'objective-c', 'Block enumeration', 5, 'NSArray *nums = @[@1, @2, @3, @4, @5];
__block NSInteger sum = 0;
[nums enumerateObjectsUsingBlock:^(NSNumber *n, NSUInteger idx, BOOL *stop) {
    sum += n.integerValue;
}];
NSLog(@"Sum: %ld", (long)sum);', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'objective-c' AND title = 'Block enumeration' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'objective-c', 'Init pattern', 5, '- (instancetype)initWithName:(NSString *)name age:(NSInteger)age {
    self = [super init];
    if (self) {
        _name = [name copy];
        _age = age;
    }
    return self;
}', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'objective-c' AND title = 'Init pattern' AND source_label = 'seed');

-- =============================================================================
-- HASKELL (slug: haskell) — 15 snippets
-- =============================================================================

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'haskell', 'Add function', 1, 'add :: Int -> Int -> Int
add x y = x + y', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'haskell' AND title = 'Add function' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'haskell', 'Double value', 1, 'double :: Int -> Int
double x = x * 2', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'haskell' AND title = 'Double value' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'haskell', 'Max of two', 1, 'maxOf :: Ord a => a -> a -> a
maxOf x y = if x > y then x else y', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'haskell' AND title = 'Max of two' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'haskell', 'Factorial', 2, 'factorial :: Integer -> Integer
factorial 0 = 1
factorial n = n * factorial (n - 1)', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'haskell' AND title = 'Factorial' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'haskell', 'List sum', 2, 'sumList :: [Int] -> Int
sumList [] = 0
sumList (x:xs) = x + sumList xs', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'haskell' AND title = 'List sum' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'haskell', 'List comprehension', 2, 'evens :: [Int] -> [Int]
evens xs = [x | x <- xs, even x]', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'haskell' AND title = 'List comprehension' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'haskell', 'Fibonacci', 3, 'fib :: Int -> Int
fib 0 = 0
fib 1 = 1
fib n = fib (n - 1) + fib (n - 2)', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'haskell' AND title = 'Fibonacci' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'haskell', 'Map and filter', 3, 'doubleEvens :: [Int] -> [Int]
doubleEvens = map (* 2) . filter even', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'haskell' AND title = 'Map and filter' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'haskell', 'Guards clause', 3, 'bmi :: Double -> String
bmi x
  | x < 18.5  = "underweight"
  | x < 25.0  = "normal"
  | otherwise  = "overweight"', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'haskell' AND title = 'Guards clause' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'haskell', 'Data type', 4, 'data Shape = Circle Double | Rectangle Double Double

area :: Shape -> Double
area (Circle r) = pi * r * r
area (Rectangle w h) = w * h', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'haskell' AND title = 'Data type' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'haskell', 'Maybe handling', 4, 'safeDivide :: Double -> Double -> Maybe Double
safeDivide _ 0 = Nothing
safeDivide x y = Just (x / y)', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'haskell' AND title = 'Maybe handling' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'haskell', 'Quicksort', 4, 'qsort :: Ord a => [a] -> [a]
qsort [] = []
qsort (x:xs) = qsort smaller ++ [x] ++ qsort larger
  where smaller = [y | y <- xs, y <= x]
        larger  = [y | y <- xs, y > x]', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'haskell' AND title = 'Quicksort' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'haskell', 'Typeclass instance', 5, 'data Color = Red | Green | Blue

instance Show Color where
  show Red   = "red"
  show Green = "green"
  show Blue  = "blue"', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'haskell' AND title = 'Typeclass instance' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'haskell', 'Monad do notation', 5, 'greetUser :: IO ()
greetUser = do
  putStrLn "What is your name?"
  name <- getLine
  putStrLn ("Hello, " ++ name ++ "!")', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'haskell' AND title = 'Monad do notation' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'haskell', 'Fold accumulator', 5, 'frequencies :: Ord a => [a] -> [(a, Int)]
frequencies = map (\g -> (head g, length g)) . group . sort', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'haskell' AND title = 'Fold accumulator' AND source_label = 'seed');

-- =============================================================================
-- ELIXIR (slug: elixir) — 15 snippets
-- =============================================================================

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'elixir', 'Hello module', 1, 'defmodule Hello do
  def greet(name) do
    "Hello, #{name}!"
  end
end', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'elixir' AND title = 'Hello module' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'elixir', 'Pattern match', 1, '{:ok, value} = {:ok, 42}
[head | tail] = [1, 2, 3]
IO.puts(head)', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'elixir' AND title = 'Pattern match' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'elixir', 'Pipe operator', 1, '"hello world"
|> String.split()
|> Enum.map(&String.capitalize/1)
|> Enum.join(" ")', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'elixir' AND title = 'Pipe operator' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'elixir', 'Case expression', 2, 'case File.read("config.txt") do
  {:ok, content} -> String.trim(content)
  {:error, reason} -> "Error: #{reason}"
end', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'elixir' AND title = 'Case expression' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'elixir', 'Enum functions', 2, 'nums = [1, 2, 3, 4, 5]

evens = Enum.filter(nums, &(rem(&1, 2) == 0))
sum = Enum.sum(nums)
doubled = Enum.map(nums, &(&1 * 2))', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'elixir' AND title = 'Enum functions' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'elixir', 'Guard clauses', 2, 'defmodule Math do
  def abs(n) when n < 0, do: -n
  def abs(n), do: n

  def max(a, b) when a >= b, do: a
  def max(_, b), do: b
end', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'elixir' AND title = 'Guard clauses' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'elixir', 'Keyword list', 3, 'defmodule Config do
  def fetch(opts \\ []) do
    host = Keyword.get(opts, :host, "localhost")
    port = Keyword.get(opts, :port, 4000)
    "#{host}:#{port}"
  end
end', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'elixir' AND title = 'Keyword list' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'elixir', 'Recursive sum', 3, 'defmodule ListMath do
  def sum([]), do: 0
  def sum([head | tail]), do: head + sum(tail)

  def length([]), do: 0
  def length([_ | tail]), do: 1 + length(tail)
end', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'elixir' AND title = 'Recursive sum' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'elixir', 'Map operations', 3, 'user = %{name: "Alice", age: 30}
updated = Map.put(user, :email, "alice@example.com")
%{name: name} = updated
IO.puts(name)', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'elixir' AND title = 'Map operations' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'elixir', 'Struct definition', 4, 'defmodule User do
  defstruct [:name, :email, active: true]

  def new(name, email) do
    %__MODULE__{name: name, email: email}
  end
end', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'elixir' AND title = 'Struct definition' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'elixir', 'With expression', 4, 'with {:ok, data} <- fetch_data(url),
     {:ok, parsed} <- Jason.decode(data),
     %{"status" => "ok"} <- parsed do
  {:ok, parsed}
else
  _ -> {:error, :failed}
end', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'elixir' AND title = 'With expression' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'elixir', 'Tail recursion', 4, 'defmodule Factorial do
  def calc(n), do: calc(n, 1)

  defp calc(0, acc), do: acc
  defp calc(n, acc) when n > 0 do
    calc(n - 1, n * acc)
  end
end', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'elixir' AND title = 'Tail recursion' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'elixir', 'GenServer basic', 5, 'defmodule Counter do
  use GenServer

  def start_link(init) do
    GenServer.start_link(__MODULE__, init, name: __MODULE__)
  end

  def init(count), do: {:ok, count}

  def handle_call(:get, _from, count) do
    {:reply, count, count}
  end

  def handle_cast(:inc, count) do
    {:noreply, count + 1}
  end
end', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'elixir' AND title = 'GenServer basic' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'elixir', 'Protocol impl', 5, 'defprotocol Stringify do
  def to_str(data)
end

defimpl Stringify, for: Integer do
  def to_str(n), do: Integer.to_string(n)
end

defimpl Stringify, for: List do
  def to_str(list), do: Enum.join(list, ", ")
end', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'elixir' AND title = 'Protocol impl' AND source_label = 'seed');

INSERT INTO snippets (language, title, difficulty, code, source_label, is_active)
SELECT 'elixir', 'Spawn process', 5, 'pid = spawn(fn ->
  receive do
    {:greet, name} -> IO.puts("Hello, #{name}")
    :stop -> IO.puts("Stopping")
  end
end)

send(pid, {:greet, "World"})', 'seed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM snippets WHERE language = 'elixir' AND title = 'Spawn process' AND source_label = 'seed');

COMMIT;
