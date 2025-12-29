// lib/utils.ts
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"


// Combines class names intelligently, Used by all Shadcn components. // This function is a utility to safely build Tailwind class strings by combining conditional classes and resolving conflicts.
// Real example :-
// cn(
//   "p-2 text-sm",
//   isActive && "p-4 text-lg",
//   isDisabled && "opacity-50"
// )                             -> Output : "p-4 text-lg opacity-50"
export function cn(...inputs: ClassValue[]) {       // cn -> className     // ...inputs → accepts any number of class values and ClassValue (from clsx) can be : string, object, array.
                                                // string → "p-4"  and  object → { "bg-red-500": isError }  and  array → ["p-2", isActive && "p-4"]  and  falsy → ignored automatically              
  return twMerge(clsx(inputs))                // This line does two things in order: Removes false, null, undefined  and  Understands Tailwind utility conflicts and keeps only the winning class.
                                            // Example: clsx("p-2", isActive && "p-4") → "p-2 p-4"  and  twMerge("p-2 p-4 p-2") → "p-4" (resolves conflicts, keeps last)
}      // Basically, clsx take messy conditional classes → clean them → twMerge resolve Tailwind conflicts → return one correct string.


// Format date to readable string.       // Example => formatDate(new Date('2025-03-15'))  -> output: "Mar 15, 2025"
// This function formats a JavaScript Date object into a human-readable string using the browser’s internationalization API.
export function formatDate(date: Date): string {    // Takes a Date object and Returns a string
  return new Intl.DateTimeFormat('en-US', {       // Uses the Intl API (built-in, fast, locale-aware) and 'en-US' → US English formatting rules
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)            // Formats the given Date object using those rules
}


// Truncate text with ellipsis          // Example => truncate("Tailwind is awesome", 10)  -> output: "Tailwind i..."
// This function shortens long text and adds ... at the end if it exceeds a given length.
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text        // If the text is already short enough → don’t touch it
  return text.substring(0, length) + '...'        // Cut the text from index 0 to length and Append ... to show it was shortened
}