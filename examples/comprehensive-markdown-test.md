
# Markdown Syntax Test

This document tests all common Markdown syntax elements to ensure proper rendering.

## 1. Text Formatting

*Italic text* and _also italic_

**Bold text** and __also bold__

***Bold and italic*** and ___also bold and italic___

~~Strikethrough text~~

`Inline code` with backticks

> Blockquote text
> 
> Multiple lines in a blockquote
> 
>> Nested blockquote

## 2. Lists

### Unordered Lists

* Item 1
* Item 2
  * Nested item 2.1
  * Nested item 2.2
* Item 3

- Alternative item 1
- Alternative item 2

+ Another alternative 1
+ Another alternative 2

### Ordered Lists

1. First item
2. Second item
   1. Nested item 2.1
   2. Nested item 2.2
3. Third item

### Task Lists

- [x] Completed task
- [ ] Incomplete task
- [x] Another completed task

## 3. Links

[Basic link to GitHub](https://github.com)

[Link with title](https://github.com "GitHub's Homepage")

Auto-link: <https://github.com>

Email link: <example@example.com>

Reference style [link][1]

[1]: https://github.com "GitHub"

## 4. Images

![Alt text for image](https://via.placeholder.com/150 "Image title")

Reference style ![image][img1]

[img1]: https://via.placeholder.com/150 "A placeholder image"

## 5. Code Blocks

```javascript
// JavaScript code block
function greet(name) {
  console.log(`Hello, ${name}!`);
}
greet('world');
```

```python
# Python code block
def greet(name):
    print(f"Hello, {name}!")
    
greet("world")
```

```csharp
// C# code block
public class Hello {
    public static void Main() {
        string name = "world";
        Console.WriteLine($"Hello, {name}!");
    }
}
```

```java
// Java code block
public class Hello {
    public static void main(String[] args) {
        String name = "world";
        System.out.println("Hello, " + name + "!");
    }
}
```

```html
<!-- HTML code block -->
<div class="container">
  <h1>Hello, world!</h1>
  <p>This is an HTML example.</p>
</div>
```

```css
/* CSS code block */
.container {
  margin: 0 auto;
  padding: 20px;
  background-color: #f5f5f5;
}
```

## 6. Tables

| Header 1 | Header 2 | Header 3 |
|----------|----------|----------|
| Cell 1   | Cell 2   | Cell 3   |
| Cell 4   | Cell 5   | Cell 6   |

| Left-aligned | Center-aligned | Right-aligned |
|:-------------|:--------------:|-------------:|
| Left         | Center         | Right        |
| Text         | Text           | Text         |

## 7. Horizontal Rules

---

***

___

## 8. HTML in Markdown

<div style="color: blue;">
  <p>This is an HTML block in Markdown.</p>
  <ul>
    <li>Item 1</li>
    <li>Item 2</li>
  </ul>
</div>

## 9. Escape Characters

\* Escaped asterisk

\# Escaped hash

\[ Escaped bracket

## 10. Footnotes

Here's a sentence with a footnote. [^1]

[^1]: This is the footnote content.

## 11. Definition Lists

Term 1
: Definition 1

Term 2
: Definition 2a
: Definition 2b

## 12. Abbreviations

*[HTML]: Hyper Text Markup Language
*[W3C]: World Wide Web Consortium

The HTML specification is maintained by the W3C.

## 13. Superscript and Subscript

Superscript: X^2^

Subscript: H~2~O

## 14. Emoji

:smile: :heart: :thumbsup:

## 15. Highlighting

==Highlighted text==
