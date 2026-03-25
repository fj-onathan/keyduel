import { apiGet } from './api'

export type PracticeSnippet = {
  title: string
  language: string
  difficulty: number
  code: string
}

export const practiceSnippets: PracticeSnippet[] = [
  {
    title: 'Sum of slice',
    language: 'go',
    difficulty: 1,
    code: `func sum(nums []int) int {
\ttotal := 0
\tfor _, n := range nums {
\t\ttotal += n
\t}
\treturn total
}`,
  },
  {
    title: 'Max of two',
    language: 'go',
    difficulty: 1,
    code: `func max(a int, b int) int {
\tif a > b {
\t\treturn a
\t}
\treturn b
}`,
  },
  {
    title: 'Fibonacci',
    language: 'go',
    difficulty: 2,
    code: `func fibonacci(n int) int {
\tif n <= 1 {
\t\treturn n
\t}
\ta, b := 0, 1
\tfor i := 2; i <= n; i++ {
\t\ta, b = b, a+b
\t}
\treturn b
}`,
  },
  {
    title: 'Reverse string',
    language: 'go',
    difficulty: 2,
    code: `func reverse(s string) string {
\trunes := []rune(s)
\tfor i, j := 0, len(runes)-1; i < j; i, j = i+1, j-1 {
\t\trunes[i], runes[j] = runes[j], runes[i]
\t}
\treturn string(runes)
}`,
  },
  {
    title: 'Binary search',
    language: 'go',
    difficulty: 3,
    code: `func binarySearch(nums []int, target int) int {
\tlo, hi := 0, len(nums)-1
\tfor lo <= hi {
\t\tmid := lo + (hi-lo)/2
\t\tif nums[mid] == target {
\t\t\treturn mid
\t\t} else if nums[mid] < target {
\t\t\tlo = mid + 1
\t\t} else {
\t\t\thi = mid - 1
\t\t}
\t}
\treturn -1
}`,
  },
  {
    title: 'FizzBuzz',
    language: 'go',
    difficulty: 2,
    code: `func fizzBuzz(n int) []string {
\tresult := make([]string, 0, n)
\tfor i := 1; i <= n; i++ {
\t\tswitch {
\t\tcase i%15 == 0:
\t\t\tresult = append(result, "FizzBuzz")
\t\tcase i%3 == 0:
\t\t\tresult = append(result, "Fizz")
\t\tcase i%5 == 0:
\t\t\tresult = append(result, "Buzz")
\t\tdefault:
\t\t\tresult = append(result, fmt.Sprint(i))
\t\t}
\t}
\treturn result
}`,
  },
  {
    title: 'isPalindrome',
    language: 'javascript',
    difficulty: 1,
    code: `function isPalindrome(str) {
  const clean = str.toLowerCase();
  let left = 0;
  let right = clean.length - 1;
  while (left < right) {
    if (clean[left] !== clean[right]) {
      return false;
    }
    left++;
    right--;
  }
  return true;
}`,
  },
  {
    title: 'Array flat',
    language: 'javascript',
    difficulty: 2,
    code: `function flatten(arr) {
  const result = [];
  for (const item of arr) {
    if (Array.isArray(item)) {
      result.push(...flatten(item));
    } else {
      result.push(item);
    }
  }
  return result;
}`,
  },
  {
    title: 'Debounce',
    language: 'typescript',
    difficulty: 3,
    code: `function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}`,
  },
  {
    title: 'Map implementation',
    language: 'typescript',
    difficulty: 2,
    code: `function map<T, U>(
  arr: T[],
  fn: (item: T, index: number) => U
): U[] {
  const result: U[] = [];
  for (let i = 0; i < arr.length; i++) {
    result.push(fn(arr[i], i));
  }
  return result;
}`,
  },
  {
    title: 'Merge sort',
    language: 'go',
    difficulty: 4,
    code: `func mergeSort(arr []int) []int {
\tif len(arr) <= 1 {
\t\treturn arr
\t}
\tmid := len(arr) / 2
\tleft := mergeSort(arr[:mid])
\tright := mergeSort(arr[mid:])
\treturn merge(left, right)
}

func merge(a, b []int) []int {
\tresult := make([]int, 0, len(a)+len(b))
\ti, j := 0, 0
\tfor i < len(a) && j < len(b) {
\t\tif a[i] <= b[j] {
\t\t\tresult = append(result, a[i])
\t\t\ti++
\t\t} else {
\t\t\tresult = append(result, b[j])
\t\t\tj++
\t\t}
\t}
\tresult = append(result, a[i:]...)
\tresult = append(result, b[j:]...)
\treturn result
}`,
  },
  {
    title: 'HTTP handler',
    language: 'go',
    difficulty: 3,
    code: `func handleUsers(w http.ResponseWriter, r *http.Request) {
\tif r.Method != http.MethodGet {
\t\thttp.Error(w, "method not allowed", http.StatusMethodNotAllowed)
\t\treturn
\t}
\tw.Header().Set("Content-Type", "application/json")
\tjson.NewEncoder(w).Encode(map[string]string{
\t\t"status": "ok",
\t})
}`,
  },
  {
    title: 'Linked list node',
    language: 'go',
    difficulty: 3,
    code: `type Node struct {
\tVal  int
\tNext *Node
}

func (n *Node) Append(val int) {
\tcurr := n
\tfor curr.Next != nil {
\t\tcurr = curr.Next
\t}
\tcurr.Next = &Node{Val: val}
}

func (n *Node) Len() int {
\tcount := 0
\tfor curr := n; curr != nil; curr = curr.Next {
\t\tcount++
\t}
\treturn count
}`,
  },
  {
    title: 'Promise.all',
    language: 'typescript',
    difficulty: 4,
    code: `function promiseAll<T>(promises: Promise<T>[]): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const results: T[] = new Array(promises.length);
    let count = 0;
    if (promises.length === 0) {
      resolve(results);
      return;
    }
    promises.forEach((p, i) => {
      p.then((value) => {
        results[i] = value;
        count++;
        if (count === promises.length) {
          resolve(results);
        }
      }).catch(reject);
    });
  });
}`,
  },
  {
    title: 'Event emitter',
    language: 'typescript',
    difficulty: 3,
    code: `class EventEmitter {
  private listeners = new Map<string, Set<Function>>();

  on(event: string, fn: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(fn);
  }

  off(event: string, fn: Function): void {
    this.listeners.get(event)?.delete(fn);
  }

  emit(event: string, ...args: unknown[]): void {
    for (const fn of this.listeners.get(event) ?? []) {
      fn(...args);
    }
  }
}`,
  },
]

export function getRandomSnippet(exclude?: PracticeSnippet): PracticeSnippet {
  const pool = exclude ? practiceSnippets.filter((s) => s !== exclude) : practiceSnippets
  return pool[Math.floor(Math.random() * pool.length)]
}

type SnippetResponse = {
  id: string
  language: string
  title: string
  difficulty: number
  code: string
}

/** Fetch a random snippet from the API. Falls back to a local snippet on failure. */
export async function fetchRandomSnippet(exclude?: PracticeSnippet): Promise<PracticeSnippet> {
  try {
    const data = await apiGet<SnippetResponse>('/snippets/random')
    if (data.code) {
      return {
        title: data.title || 'Untitled',
        language: data.language || 'unknown',
        difficulty: data.difficulty || 2,
        code: data.code,
      }
    }
  } catch {
    // API unavailable — fall through to local
  }
  return getRandomSnippet(exclude)
}
