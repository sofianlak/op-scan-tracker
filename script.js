async function fetchNextChapterDate() {
    try {
        const response = await fetch('http://localhost:3000/api/next-chapter'); // Replace with your API
        const data = await response.json();
        document.getElementById('chapter-date').textContent = data.date;
    } catch (error) {
        document.getElementById('chapter-date').textContent = 'Error fetching next chapter date.';
        console.error('Error:', error);
    }
}

fetchNextChapterDate();