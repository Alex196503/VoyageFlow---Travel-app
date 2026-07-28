//In React Router v7, every page route must export a `meta()` function to change the browser tab title. Instead of copying and pasting the same array
//structure across every single page, this helper generates the correct format instantly.
export function getMeta(
  title: string,
  description = "Welcome to Voyage Flow"
) {
  return [
    { title: `${title} | Voyage Flow` },
    { name: "description", content: description }
  ]
}
