# codeHtml.html

```markup
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Toggle Background</title>
</head>
<body>
    <button onclick="toggleBackground()">Toggle Background</button>

    <script>
        function toggleBackground() {
            // Check the current background color and toggle
            if (document.body.style.backgroundColor === 'lightblue') {
                document.body.style.backgroundColor = 'white';
            } else {
                document.body.style.backgroundColor = 'lightblue';
            }
        }
    </script>
</body>
</html>

```