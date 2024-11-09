// Set the current year in the footer
document.getElementById("year").textContent = new Date().getFullYear();

// Function to parse course name and week from query parameters
function getCourseAndWeekFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const courseName = urlParams.get('course');
    const week = urlParams.get('week');
    return { courseName, week };
}

// Function to create a card element with hover effects and animations
function createCard(href, text, additionalClasses = '', icon = null) {
    const card = document.createElement("a");
    card.href = href;
    card.className = `
        block p-6 w-full
        bg-white hover:bg-gradient-to-br hover:from-teal-50 hover:to-blue-50
        shadow-md hover:shadow-xl
        rounded-xl
        transition-all duration-300 ease-in-out
        transform hover:-translate-y-1
        text-center text-teal-700 hover:text-teal-900
        font-medium
        border border-transparent hover:border-teal-100
        ${additionalClasses}
    `;

    const title = document.createElement("h2");
    title.className = "text-xl font-bold mb-2";
    title.textContent = text.replace(/-/g, ' ');
    card.appendChild(title);

    if (icon) {
        const iconWrapper = document.createElement('div');
        iconWrapper.className = 'mt-2 text-teal-500 group-hover:text-teal-600 opacity-75 group-hover:opacity-100 transition-opacity';
        iconWrapper.innerHTML = icon;
        card.appendChild(iconWrapper);
    }

    return card;
}

// Function to fetch video data from JSON and display relevant information
async function loadVideoData() {
    try {
        const response = await fetch('/data/res.json');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const jsonData = await response.json();

        const { courseName, week } = getCourseAndWeekFromURL();
        if (!courseName) {
            displayAvailableCourses(jsonData);
        } else if (courseName && !week) {
            displayAvailableWeeks(jsonData, courseName);
        } else if (courseName && week) {
            displayVideoLinks(jsonData, courseName, week);
        }
    } catch (error) {
        console.error("Error fetching the JSON file:", error);
        showNotFound();
    }
}

// Function to display available courses
function displayAvailableCourses(jsonData) {
    const contentDiv = document.getElementById("content");
    const notFoundMessage = document.getElementById("not-found");
    document.getElementById("page-title").textContent = "Available Courses";
    notFoundMessage.classList.add('hidden');

    const grid = document.createElement('div');
    grid.className = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl';

    const courses = Object.keys(jsonData);
    courses.forEach(course => {
        const weekCount = Object.keys(jsonData[course]).length;
        const courseCard = createCard(
            `?course=${course}`,
            course,
            'group',
            `
            <svg class="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <p class="text-sm text-teal-600">${weekCount} ${weekCount === 1 ? 'Week' : 'Weeks'} Available</p>
            `
        );
        grid.appendChild(courseCard);
    });

    contentDiv.appendChild(grid);
}

// Function to display available weeks for a course
function displayAvailableWeeks(jsonData, courseName) {
    const formattedCourseName = courseName.toLowerCase().replace(/\s+/g, '-');
    const contentDiv = document.getElementById("content");
    const notFoundMessage = document.getElementById("not-found");

    if (jsonData[formattedCourseName]) {
        document.getElementById("page-title").textContent = `${courseName.toLocaleUpperCase().replace(/-/g, ' ')}`;
        notFoundMessage.classList.add('hidden');

        const grid = document.createElement('div');
        grid.className = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl mb-8';

        const weeks = Object.keys(jsonData[formattedCourseName]);
        weeks.forEach(week => {
            const videoCount = Object.keys(jsonData[formattedCourseName][week]).length;
            const weekCard = createCard(
                `?course=${formattedCourseName}&week=${week}`,
                week,
                'group',
                `
                <svg class="w-10 h-10 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <p class="text-sm text-teal-600">${videoCount} ${videoCount === 1 ? 'Video' : 'Videos'} Available</p>
                `
            );
            grid.appendChild(weekCard);
        });

        contentDiv.appendChild(grid);

        // Back button
        const backButton = document.createElement("a");
        backButton.href = `/`;
        backButton.className = `
            inline-flex items-center justify-center
            px-6 py-3
            bg-gradient-to-r from-teal-600 to-teal-700
            hover:from-teal-700 hover:to-teal-800
            text-white
            rounded-lg
            transition-all duration-300
            shadow-md hover:shadow-lg
            transform hover:-translate-y-0.5
        `;
        backButton.innerHTML = `
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
            </svg>
            Back to Courses
        `;
        contentDiv.appendChild(backButton);
    } else {
        showNotFound();
    }
}

// Function to display video links for a specific course and week
function displayVideoLinks(jsonData, courseName, week) {
    const formattedCourseName = courseName.toLowerCase().replace(/\s+/g, '-');
    const formattedWeek = week.toLowerCase().replace(/\s+/g, '-');
    const contentDiv = document.getElementById("content");
    const notFoundMessage = document.getElementById("not-found");

    if (jsonData[formattedCourseName] && jsonData[formattedCourseName][formattedWeek]) {
        document.getElementById("page-title").textContent = `${courseName.toLocaleUpperCase().replace(/-/g, ' ')} - ${week.replace(/-/g, ' ')}`;
        notFoundMessage.classList.add('hidden');

        const grid = document.createElement('div');
        grid.className = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl mb-8';

        const videos = jsonData[formattedCourseName][formattedWeek];
        for (const videoName in videos) {
            const videoLink = videos[videoName];
            const videoButton = createCard(
                videoLink,
                videoName,
                'group',
                `
                <svg class="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                `
            );
            videoButton.target = "_blank";
            grid.appendChild(videoButton);
        }

        contentDiv.appendChild(grid);

        // Back button
        const backButton = document.createElement("a");
        backButton.href = `?course=${formattedCourseName}`;
        backButton.className = `
            inline-flex items-center justify-center
            px-6 py-3
            bg-gradient-to-r from-teal-600 to-teal-700
            hover:from-teal-700 hover:to-teal-800
            text-white
            rounded-lg
            transition-all duration-300
            shadow-md hover:shadow-lg
            transform hover:-translate-y-0.5
        `;
        backButton.innerHTML = `
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
            </svg>
            Back to Weeks
        `;
        contentDiv.appendChild(backButton);
    } else {
        showNotFound();
    }
}

// Function to display a 404 message if the course or week is not found
function showNotFound() {
    const notFoundMessage = document.getElementById("not-found");
    const contentDiv = document.getElementById("content");
    document.getElementById("page-title").textContent = "404 - Not Found";
    notFoundMessage.classList.remove('hidden');
    contentDiv.innerHTML = '';
}

// Load video data on page load
loadVideoData();
