// Select the button
var button = document.getElementById('toggleButton');

// Add a click event listener
button.addEventListener('click', function () {
    // Check the current background color and toggle
    if (document.body.style.backgroundColor === 'lightblue') {
        document.body.style.backgroundColor = 'white';
    } else {
        document.body.style.backgroundColor = 'lightblue';
    }
});
