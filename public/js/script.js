const API_URL = window.location.origin;

async function fetchNextChapterDate() {
    try {
        const response = await fetch(`${API_URL}/api/next-chapter`);
        const data = await response.json();
        if (data.success) {
            document.getElementById('chapter-date').textContent = data.raw_date;
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        document.getElementById('chapter-date').textContent = 'Error fetching next chapter date.';
        console.error('Error:', error);
    }
}

fetchNextChapterDate();