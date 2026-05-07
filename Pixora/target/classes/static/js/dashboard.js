// Dashboard JavaScript - Pixora

// Authentication check - run immediately
(function() {
    const token = localStorage.getItem("token");
    
    // Redirect to login if no token found
    if (!token) {
        alert("No authentication token found, redirecting to login");
        window.location.href = "/login.html";
        return;
    }
    
    // Optional: Basic token validation (check if it's not empty)
    if (token.trim() === "") {
        alert("Invalid authentication token, redirecting to login");
        localStorage.removeItem("token"); // Clear invalid token
        window.location.href = "/login.html";
        return;
    }
    
    alert("Authentication token validated successfully");
})();

// Global variables
let photosData = [];
let currentViewMode = 'grid';
let filteredPhotos = [];
let currentPage = 1;
let pageSize = 12;
let isLoading = false;
let hasMorePhotos = true;
let totalPhotos = 0;
let currentTab = 'photos';
let peopleData = [];
let searchTimeout = null;
let searchButton = null;

// Theme toggle functionality (shared with other pages)
function toggleTheme() {
    const html = document.documentElement;
    const themeIcon = document.getElementById('theme-icon');
    
    if (html.getAttribute('data-theme') === 'dark') {
        html.removeAttribute('data-theme');
        themeIcon.className = 'fas fa-moon';
        localStorage.setItem('theme', 'light');
    } else {
        html.setAttribute('data-theme', 'dark');
        themeIcon.className = 'fas fa-sun';
        localStorage.setItem('theme', 'dark');
    }
}

// Mobile menu toggle
function toggleMobileMenu() {
    const navMenu = document.querySelector('.nav-menu');
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    
    if (navMenu.style.display === 'flex') {
        navMenu.style.display = 'none';
        mobileToggle.innerHTML = '<i class="fas fa-bars"></i>';
    } else {
        navMenu.style.display = 'flex';
        navMenu.style.position = 'absolute';
        navMenu.style.top = '70px';
        navMenu.style.left = '0';
        navMenu.style.right = '0';
        navMenu.style.background = 'var(--glass-bg)';
        navMenu.style.flexDirection = 'column';
        navMenu.style.padding = '20px';
        navMenu.style.borderBottom = '1px solid var(--glass-border)';
        navMenu.style.backdropFilter = 'blur(10px)';
        mobileToggle.innerHTML = '<i class="fas fa-times"></i>';
    }
}

// Logout function
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        // Clear any stored session data
        localStorage.removeItem('userToken');
        localStorage.removeItem('userData');
        
        // Redirect to login page
        window.location.href = 'login.html';
    }
}

// Fetch photos from API with pagination
async function fetchPhotosPage(page = 0, size = pageSize, append = false) {
    try {
        if (isLoading) return;
        isLoading = true;
        
        if (!append) {
            showLoadingState();
        } else {
            showScrollLoadingState();
        }
        
        // Try multiple approaches to fetch data
        let data = null;
        let fetchSuccess = false;
        
        // Method 1: Direct API call with pagination
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`/api/photos?page=${page}&size=${size}`, {
                method: 'GET',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                data = await response.json();
                fetchSuccess = true;
                console.log(`Successfully fetched page ${page} from API`);
            } else {
                console.log('API returned non-OK status:', response.status);
            }
        } catch (corsError) {
            console.log('CORS error or network error:', corsError.message);
        }
        
        // If API fails, show error state
        if (!fetchSuccess) {
            throw new Error('API server not reachable. Please ensure the backend server is running on ');
        }
        
        if (fetchSuccess && data) {
            // Handle response structure: array of objects with id and image fields
            let newPhotos = [];
            if (Array.isArray(data)) {
                // Direct array response with photo objects
                newPhotos = data.map(item => ({
                    id: item.id,
                    originalImage: item.image,
                    faceImagePath: null, // Will be populated if face data is available
                    personName: null, // Will be populated if person data is available
                    tags: [] // Will be populated if tags are available
                }));
                hasMorePhotos = data.length === size;
                totalPhotos = newPhotos.length;
            } else if (data.content && Array.isArray(data.content)) {
                // Paginated response with content field
                newPhotos = data.content.map(item => ({
                    id: item.id,
                    originalImage: item.image,
                    faceImagePath: null,
                    personName: null,
                    tags: []
                }));
                hasMorePhotos = !data.last;
                totalPhotos = data.totalElements || data.total || newPhotos.length;
            } else if (data.data && Array.isArray(data.data)) {
                // Response with data field
                newPhotos = data.data.map(item => ({
                    id: item.id,
                    originalImage: item.image,
                    faceImagePath: null,
                    personName: null,
                    tags: []
                }));
                hasMorePhotos = newPhotos.length === size;
                totalPhotos = newPhotos.length;
            } else {
                // Fallback: treat as single object or array
                newPhotos = [data].filter(item => item && item.id).map(item => ({
                    id: item.id,
                    originalImage: item.image,
                    faceImagePath: null,
                    personName: null,
                    tags: []
                }));
                hasMorePhotos = false;
                totalPhotos = newPhotos.length;
            }
            
            if (!append) {
                // Initial load - replace all photos
                photosData = newPhotos;
                currentPage = page;
            } else {
                // Append mode - add to existing photos
                photosData = [...photosData, ...newPhotos];
                currentPage = page;
            }
            
            filteredPhotos = [...photosData];
            
            if (!append) {
                hideLoadingState();
            } else {
                hideScrollLoadingState();
            }
            
            updateStats();
            renderPhotos();
            
        } else {
            throw new Error('Unable to fetch photos from any source');
        }
        
    } catch (error) {
        console.error('Error fetching photos:', error);
        if (!append) {
            showErrorState(`Unable to connect to the photo server. ${error.message}`);
        } else {
            hideScrollLoadingState();
            showErrorMessage(`Failed to load more photos: ${error.message}`);
        }
    } finally {
        isLoading = false;
    }
}

// Fetch photos from API with CORS handling and fallback (legacy function)
async function fetchPhotos() {
    // Reset pagination state for fresh load
    currentPage = 1;
    hasMorePhotos = true;
    await fetchPhotosPage(1, pageSize, false);
}


// Show loading state
function showLoadingState() {
    document.getElementById('loadingState').style.display = 'block';
    document.getElementById('errorState').style.display = 'none';
    document.getElementById('photosTab').style.display = 'none';
    document.getElementById('peopleTab').style.display = 'none';
}

// Hide loading state
function hideLoadingState() {
    document.getElementById('loadingState').style.display = 'none';
    document.getElementById('errorState').style.display = 'none';
    
    // Show the active tab
    if (currentTab === 'photos') {
        document.getElementById('photosTab').style.display = 'block';
        document.getElementById('peopleTab').style.display = 'none';
    } else {
        document.getElementById('photosTab').style.display = 'none';
        document.getElementById('peopleTab').style.display = 'block';
    }
}

// Show error state
function showErrorState(message) {
    document.getElementById('loadingState').style.display = 'none';
    document.getElementById('errorState').style.display = 'block';
    document.getElementById('photosTab').style.display = 'none';
    document.getElementById('peopleTab').style.display = 'none';
    document.getElementById('errorMessage').textContent = message;
}

// Show scroll loading state
function showScrollLoadingState() {
    // Create or update scroll loading indicator
    let scrollLoader = document.getElementById('scrollLoadingState');
    if (!scrollLoader) {
        scrollLoader = document.createElement('div');
        scrollLoader.id = 'scrollLoadingState';
        scrollLoader.className = 'scroll-loading-state';
        scrollLoader.innerHTML = `
            <div class="scroll-loading-spinner"></div>
            <p>Loading more photos...</p>
        `;
        document.getElementById('photosGrid').appendChild(scrollLoader);
    }
    scrollLoader.style.display = 'block';
}

// Hide scroll loading state
function hideScrollLoadingState() {
    const scrollLoader = document.getElementById('scrollLoadingState');
    if (scrollLoader) {
        scrollLoader.style.display = 'none';
    }
}

// Show error message for scroll
function showErrorMessage(message) {
    // Create or update error message
    let errorMsg = document.getElementById('scrollErrorMessage');
    if (!errorMsg) {
        errorMsg = document.createElement('div');
        errorMsg.id = 'scrollErrorMessage';
        errorMsg.className = 'scroll-error-message';
        document.getElementById('photosGrid').appendChild(errorMsg);
    }
    errorMsg.textContent = message;
    errorMsg.style.display = 'block';
    
    // Hide after 3 seconds
    setTimeout(() => {
        errorMsg.style.display = 'none';
    }, 3000);
}

// Infinite scroll detection
function setupInfiniteScroll() {
    const photosGrid = document.getElementById('photosGrid');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && hasMorePhotos && !isLoading) {
                // Load next page when user scrolls near bottom
                loadMorePhotos();
            }
        });
    }, {
        root: null,
        rootMargin: '200px', // Start loading 200px before reaching bottom
        threshold: 0.1
    });
    
    // Create sentinel element for scroll detection
    const sentinel = document.createElement('div');
    sentinel.id = 'scrollSentinel';
    sentinel.className = 'scroll-sentinel';
    photosGrid.appendChild(sentinel);
    
    // Observe the sentinel
    observer.observe(sentinel);
}

// Load more photos
async function loadMorePhotos() {
    if (!hasMorePhotos || isLoading) return;
    
    const nextPage = currentPage + 1;
    console.log(`Loading page ${nextPage}`);
    await fetchPhotosPage(nextPage, pageSize, true);
}

// Fetch photos by person name
async function fetchPhotosByPerson(personName) {
    try {
        showLoadingState();
        
        const token = localStorage.getItem("token");
        const response = await fetch(`/api/photos/by-person?personName=${encodeURIComponent(personName)}`, {
            method: 'GET',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log(`Successfully fetched photos for ${personName}:`, data);
            
            // Handle response structure
            let personPhotos = [];
            if (Array.isArray(data)) {
                personPhotos = data.map(item => ({
                    id: item.id,
                    originalImage: item.image,
                    faceImagePath: null,
                    personName: personName,
                    tags: []
                }));
            } else if (data.content && Array.isArray(data.content)) {
                personPhotos = data.content.map(item => ({
                    id: item.id,
                    originalImage: item.image,
                    faceImagePath: null,
                    personName: personName,
                    tags: []
                }));
            } else if (data.data && Array.isArray(data.data)) {
                personPhotos = data.data.map(item => ({
                    id: item.id,
                    originalImage: item.image,
                    faceImagePath: null,
                    personName: personName,
                    tags: []
                }));
            }
            
            photosData = personPhotos;
            filteredPhotos = [...photosData];
            
            hideLoadingState();
            renderPhotos();
            
        } else {
            throw new Error(`Failed to fetch photos for ${personName}`);
        }
        
    } catch (error) {
        console.error('Error fetching photos by person:', error);
        showErrorState(`Unable to fetch photos for ${personName}. ${error.message}`);
    }
}

// Fetch all face images from faces API
async function fetchAllFaces() {
    try {
        showLoadingState();
        
        const token = localStorage.getItem("token");
        const response = await fetch('/api/photos/faces', {
            method: 'GET',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('Successfully fetched all faces:', data);
            
            // Handle response structure
            let facePhotos = [];
            if (Array.isArray(data)) {
                facePhotos = data.map(item => ({
                    id: item.id,
                    originalImage: item.image,
                    faceImagePath: item.image, // Use image as faceImagePath for faces
                    personName: item.personName || 'Unknown Person',
                    tags: item.tags || []
                }));
            } else if (data.content && Array.isArray(data.content)) {
                facePhotos = data.content.map(item => ({
                    id: item.id,
                    originalImage: item.image,
                    faceImagePath: item.image,
                    personName: item.personName || 'Unknown Person',
                    tags: item.tags || []
                }));
            } else if (data.data && Array.isArray(data.data)) {
                facePhotos = data.data.map(item => ({
                    id: item.id,
                    originalImage: item.image,
                    faceImagePath: item.image,
                    personName: item.personName || 'Unknown Person',
                    tags: item.tags || []
                }));
            }
            
            photosData = facePhotos;
            filteredPhotos = [...photosData];
            
            hideLoadingState();
            renderPhotos();
            
        } else {
            throw new Error('Failed to fetch all face images');
        }
        
    } catch (error) {
        console.error('Error fetching all faces:', error);
        showErrorState(`Unable to fetch all face images. ${error.message}`);
    }
}

// Switch between tabs
function switchTab(tabName) {
    // Update active tab button
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tab === tabName) {
            btn.classList.add('active');
        }
    });
    
    // Update active tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
        content.style.display = 'none';
    });
    
    const activeTab = document.getElementById(tabName + 'Tab');
    if (activeTab) {
        activeTab.classList.add('active');
        activeTab.style.display = 'block';
    }
    
    currentTab = tabName;
    
    // Load content for the active tab
    if (tabName === 'people') {
        renderFaceGallery();
    }
}

// Group photos by person
function groupPhotosByPerson() {
    const peopleMap = new Map();
    
    photosData.forEach(photo => {
        const personName = photo.personName && photo.personName.trim() !== '' 
            ? photo.personName 
            : 'Unknown Person';
        
        if (!peopleMap.has(personName)) {
            peopleMap.set(personName, {
                name: personName,
                photos: [],
                faceImage: null
            });
        }
        
        const person = peopleMap.get(personName);
        person.photos.push(photo);
        
        // Use face image as avatar if available
        if (!person.faceImage && photo.faceImagePath && photo.faceImagePath.trim() !== '') {
            person.faceImage = `http://localhost:8080${photo.faceImagePath}`;
        }
    });
    
    return Array.from(peopleMap.values()).sort((a, b) => {
        // Sort by photo count (descending), then by name
        if (b.photos.length !== a.photos.length) {
            return b.photos.length - a.photos.length;
        }
        return a.name.localeCompare(b.name);
    });
}

// Load people tab content
function loadPeopleTab() {
    const peopleGrid = document.getElementById('peopleGrid');
    const noPeopleMessage = document.getElementById('noPeopleMessage');
    const peopleCount = document.getElementById('peopleCount');
    
    // Fetch all face images from faces API
    fetchAllFaces();
}

// Render face gallery view
function renderFaceGallery() {
    const peopleGrid = document.getElementById('peopleGrid');
    const noPeopleMessage = document.getElementById('noPeopleMessage');
    const peopleCount = document.getElementById('peopleCount');
    
    // Clear existing content
    peopleGrid.innerHTML = '';
    
    if (photosData.length === 0) {
        noPeopleMessage.style.display = 'block';
        peopleCount.innerHTML = '<span>0 people identified</span>';
        return;
    }
    
    noPeopleMessage.style.display = 'none';
    
    // Count unique people
    const uniquePeople = new Map();
    photosData.forEach(photo => {
        if (photo.personName && photo.personName !== 'Unknown Person') {
            uniquePeople.set(photo.personName, (uniquePeople.get(photo.personName) || 0) + 1);
        }
    });
    
    peopleCount.innerHTML = `<span>${uniquePeople.size} ${uniquePeople.size === 1 ? 'person' : 'people'} identified</span>`;
    
    // Create face gallery grid
    photosData.forEach(photo => {
        const photoCard = createPhotoCard(photo);
        peopleGrid.appendChild(photoCard);
    });
}

// Create a person card element
function createPersonCard(person) {
    const card = document.createElement('div');
    card.className = 'people-card';
    card.onclick = () => showPersonPhotos(person);
    
    // Get preview photos (up to 9)
    const previewPhotos = person.photos.slice(0, 9);
    const previewHtml = previewPhotos.map(photo => {
        let imageSrc = '';
        if (photo.faceImagePath && photo.faceImagePath.trim() !== '') {
            imageSrc = `http://localhost:8080${photo.faceImagePath}`;
        } else if (photo.originalImage && photo.originalImage.trim() !== '') {
            imageSrc = `http://localhost:8080${photo.originalImage}`;
        } else {
            imageSrc = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200"%3E%3Crect fill="%23252528" width="300" height="200"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%2371717a" font-family="Arial" font-size="14"%3ENo Image Available%3C/text%3E%3C/svg%3E';
        }
        
        return `<img src="${imageSrc}" alt="${person.name}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 300 200\"%3E%3Crect fill=\"%23252528\" width=\"300\" height=\"200\"/%3E%3Ctext x=\"50%25\" y=\"50%25\" text-anchor=\"middle\" dy=\".3em\" fill=\"%2371717a\" font-family=\"Arial\" font-size=\"14\"%3EImage Not Found%3C/text%3E%3C/svg%3E'">`;
    }).join('');
    
    // Get avatar (either face image or initials)
    let avatarHtml = '';
    if (person.faceImage) {
        avatarHtml = `<img src="${person.faceImage}" alt="${person.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
    } else {
        const initials = person.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
        avatarHtml = initials;
    }
    
    card.innerHTML = `
        <div class="people-header">
            <div class="people-avatar">${avatarHtml}</div>
        </div>
        <div class="people-info">
            <h3 class="people-name">${person.name}</h3>
            <p class="people-photo-count">${person.photos.length} ${person.photos.length === 1 ? 'photo' : 'photos'}</p>
            <div class="people-preview">
                ${previewHtml}
            </div>
        </div>
    `;
    
    return card;
}

// Show photos for a specific person
function showPersonPhotos(person) {
    // Switch to photos tab and filter by person name
    switchTab('photos');
    
    // Set search filter to person name
    const searchInput = document.getElementById('searchInput');
    searchInput.value = person.name;
    filterPhotos();
}

// Show person photos in modal (from people tab)
function showPersonPhotos(person) {
    // Create modal for person photos
    const modal = document.createElement('div');
    modal.className = 'person-modal';
    modal.innerHTML = `
        <div class="person-modal-content">
            <div class="person-modal-header">
                <h3>${person.name}</h3>
                <p>${person.photos.length} photos</p>
                <button class="modal-close-btn" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="person-modal-grid">
                ${person.photos.slice(0, 12).map(photo => `
                    <div class="person-photo-card">
                        <img src="http://localhost:8080${photo.originalImage}" alt="${person.name}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 300 200\"%3E%3Crect fill=\"%23252528\" width=\"300\" height=\"200\"/%3E%3Ctext x=\"50%25\" y=\"50%25\" text-anchor=\"middle\" dy=\".3em\" fill=\"%2371717a\" font-family=\"Arial\" font-size=\"14\"%3EImage Not Found%3C/text%3E%3C/svg%3E'">
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    // Add modal to page
    document.body.appendChild(modal);
    
    // Close modal when clicking outside
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// Update dashboard statistics
function updateStats() {
    // Stats section has been removed, but we keep this function for compatibility
    // The stats are now shown in the people tab header
}

// Render photos in the grid
function renderPhotos() {
    const photosGrid = document.getElementById('photosGrid');
    
    // Only render if we're on the photos tab
    if (currentTab !== 'photos') return;
    
    // Clear existing content but preserve scroll elements
    const scrollLoader = document.getElementById('scrollLoadingState');
    const scrollSentinel = document.getElementById('scrollSentinel');
    const scrollError = document.getElementById('scrollErrorMessage');
    
    photosGrid.innerHTML = '';
    
    if (filteredPhotos.length === 0) {
        photosGrid.innerHTML = `
            <div class="no-photos">
                <i class="fas fa-images"></i>
                <h3>No photos found</h3>
                <p>Try adjusting your search or refresh to see all photos.</p>
            </div>
        `;
        return;
    }
    
    // Render photo cards
    filteredPhotos.forEach(photo => {
        const photoCard = createPhotoCard(photo);
        photosGrid.appendChild(photoCard);
    });
    
    // Re-append scroll elements if they existed
    if (scrollLoader) {
        photosGrid.appendChild(scrollLoader);
    }
    if (scrollError) {
        photosGrid.appendChild(scrollError);
    }
    if (scrollSentinel) {
        photosGrid.appendChild(scrollSentinel);
    }
}

// Create a photo card element
function createPhotoCard(photo) {
    const card = document.createElement('div');
    card.className = 'photo-card';
    card.onclick = () => showPhotoModal(photo);

    // Handle image display
    let imageSrc = '';
    let imageAlt = 'Photo';

    if (photo.originalImage && photo.originalImage.trim() !== '') {
        // Use image field from API response (prepend backend server URL)
        imageSrc = `http://localhost:8080${photo.originalImage}`;
        imageAlt = 'Photo';
    } else {
        // Placeholder image
        imageSrc = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200"%3E%3Crect fill="%23252528" width="300" height="200"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%2371717a" font-family="Arial" font-size="14"%3ENo Image Available%3C/text%3E%3C/svg%3E';
        imageAlt = 'No image available';
    }

    
    // Handle person name
    const personName = photo.personName && photo.personName.trim() !== '' 
        ? photo.personName 
        : 'Not identified';
    
    // Handle tags for overlay
    const overlayTagsHtml = photo.tags && Array.isArray(photo.tags) 
        ? photo.tags.map(tag => `<span class="overlay-tag">${tag.tag}</span>`).join('')
        : '';
    
    // Handle tags for bottom info
    const tagsHtml = photo.tags && Array.isArray(photo.tags) 
        ? photo.tags.map(tag => `<span class="tag">${tag.tag}</span>`).join('')
        : '';
    
    // Face preview thumbnail
    let facePreviewHtml = '';
    // Note: faceImagePath is currently null due to API structure
    // This will be updated when face data is available from API
    if (false) { // Disabled until face data is available
        facePreviewHtml = `
            <div class="face-preview">
                <img src="http://localhost:8080${photo.faceImagePath}" alt="Face preview" onerror="this.parentElement.style.display='none'">
            </div>
        `;
    }
    
    card.innerHTML = `
        <div class="photo-image-container">
            <img class="photo-image" src="${imageSrc}" alt="${imageAlt}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 300 200\"%3E%3Crect fill=\"%23252528\" width=\"300\" height=\"200\"/%3E%3Ctext x=\"50%25\" y=\"50%25\" text-anchor=\"middle\" dy=\".3em\" fill=\"%2371717a\" font-family=\"Arial\" font-size=\"14\"%3EImage Not Found%3C/text%3E%3C/svg%3E'">
            ${facePreviewHtml}
            
            <!-- Hover Overlay -->
            <div class="photo-overlay">
                <div class="overlay-tags">${overlayTagsHtml}</div>
                <div class="overlay-info">
                    <div class="overlay-person">${personName}</div>
                    <div class="overlay-id">ID: ${photo.id}</div>
                </div>
            </div>
        </div>
        
        <!-- Bottom Info -->
        <div class="photo-info">
            <div class="photo-id">ID: ${photo.id}</div>
            <div class="photo-path">${photo.originalImage || 'No path'}</div>
            <div class="photo-person ${personName === 'Not identified' ? 'not-identified' : ''}">${personName}</div>
            <div class="tags-list">${tagsHtml}</div>
        </div>
    `;
    
    return card;
}

// Show photo modal
function showPhotoModal(photo) {
    const modal = document.getElementById('photoModal');
    const modalImage = document.getElementById('modalImage');
    const modalId = document.getElementById('modalId');
    const modalPath = document.getElementById('modalPath');
    const modalPerson = document.getElementById('modalPerson');
    const modalTags = document.getElementById('modalTags');
    
    // Set image source
    let imageSrc = '';
    if (photo.originalImage && photo.originalImage.trim() !== '') {
        // Use originalImage field from API response
        imageSrc = `http://localhost:8080${photo.originalImage}`;
    } else {
        imageSrc = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200"%3E%3Crect fill="%23252528" width="300" height="200"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%2371717a" font-family="Arial" font-size="14"%3ENo Image Available%3C/text%3E%3C/svg%3E';
    }
    
    modalImage.src = imageSrc;
    modalId.textContent = photo.id;
    modalPath.textContent = photo.originalImage || 'No path available';
    modalPerson.textContent = photo.personName && photo.personName.trim() !== '' ? photo.personName : 'Not identified';
    
    // Set tags
    if (photo.tags && Array.isArray(photo.tags)) {
        modalTags.innerHTML = photo.tags.map(tag => `<span class="tag">${tag.tag}</span>`).join('');
    } else {
        modalTags.innerHTML = '<span class="tag">No tags</span>';
    }
    
    // Show modal with animation
    modal.classList.add('active');
    
    // Handle image loading error
    modalImage.onerror = function() {
        this.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200"%3E%3Crect fill="%23252528" width="300" height="200"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%2371717a" font-family="Arial" font-size="14"%3EImage Not Found%3C/text%3E%3C/svg%3E';
    };
}

// Close photo modal
function closePhotoModal() {
    const modal = document.getElementById('photoModal');
    modal.classList.remove('active');
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('photoModal');
    if (event.target === modal) {
        closePhotoModal();
    }
}

// Set view mode (grid or list)
function setViewMode(mode) {
    currentViewMode = mode;
    const photosGrid = document.getElementById('photosGrid');
    const viewButtons = document.querySelectorAll('.view-btn');
    
    // Update button states
    viewButtons.forEach(btn => {
        if (btn.dataset.view === mode) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // Update grid class
    if (mode === 'list') {
        photosGrid.classList.add('list-view');
    } else {
        photosGrid.classList.remove('list-view');
    }
}

// Debounced search function to reduce API calls
function debouncedSearch() {
    // Clear any existing timeout
    if (searchTimeout) {
        clearTimeout(searchTimeout);
    }
    
    // Set new timeout to trigger search after user stops typing
    searchTimeout = setTimeout(() => {
        executeSearch();
    }, 500); // 500ms delay after user stops typing
}

// Execute the actual search
function executeSearch() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    
    if (!searchTerm) {
        filteredPhotos = [...photosData];
        renderPhotos();
    } else {
        // Check if search term looks like a person name (no special characters, mostly letters)
        const looksLikePersonName = /^[a-zA-Z\s]+$/.test(searchTerm) && searchTerm.length > 2;
        
        if (looksLikePersonName) {
            // Use person-based search API for person names
            fetchPhotosByPerson(searchTerm);
        } else {
            // Use local filtering for tag/ID/path searches
            filteredPhotos = photosData.filter(photo => {
                // Search in tags, person name, ID, and path
                const tagMatch = photo.tags && photo.tags.some(tag => 
                    tag.tag && tag.tag.toLowerCase().includes(searchTerm)
                );
                
                const personMatch = photo.personName && photo.personName.toLowerCase().includes(searchTerm);
                
                const idMatch = photo.id.toString().includes(searchTerm);
                
                const pathMatch = photo.originalImage && photo.originalImage.toLowerCase().includes(searchTerm);
                
                return tagMatch || personMatch || idMatch || pathMatch;
            });
            
            renderPhotos();
        }
    }
}

// Filter photos based on search input (now debounced)
function filterPhotos() {
    debouncedSearch();
}

// Refresh photos
function refreshPhotos() {
    // Reset pagination state
    currentPage = 0;
    hasMorePhotos = true;
    isLoading = false;
    fetchPhotos();
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Load saved theme
    const savedTheme = localStorage.getItem('theme');
    const themeIcon = document.getElementById('theme-icon');
    
    if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        themeIcon.className = 'fas fa-sun';
    }
    
    // Initialize search button reference
    searchButton = document.getElementById('searchButton');
    
    // Initialize tabs
    switchTab('photos');
    
    // Fetch photos on page load
    fetchPhotos().then(() => {
        // Setup infinite scroll after initial photos are loaded
        setupInfiniteScroll();
    });
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Escape key closes modal
        if (e.key === 'Escape') {
            closePhotoModal();
        }
        
        // Ctrl/Cmd + K focuses search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            document.getElementById('searchInput').focus();
        }
        
        // Ctrl/Cmd + R refreshes photos
        if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
            e.preventDefault();
            refreshPhotos();
        }
    });
    
    // Add smooth scroll behavior
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
});

// Add styles for no photos message
const noPhotosStyle = document.createElement('style');
noPhotosStyle.textContent = `
    .no-photos {
        text-align: center;
        padding: 60px 20px;
        color: var(--text-secondary);
    }
    
    .no-photos i {
        font-size: 64px;
        margin-bottom: 20px;
        opacity: 0.5;
    }
    
    .no-photos h3 {
        font-size: 24px;
        margin-bottom: 12px;
        color: var(--text-primary);
    }
    
    .no-photos p {
        font-size: 16px;
        max-width: 400px;
        margin: 0 auto;
    }
`;
document.head.appendChild(noPhotosStyle);

// Add mobile menu styles dynamically
const mobileMenuStyle = document.createElement('style');
mobileMenuStyle.textContent = `
    @media (max-width: 768px) {
        .nav-menu {
            display: none !important;
        }
    }
    
    @media (min-width: 769px) {
        .nav-menu {
            display: flex !important;
            position: static !important;
            background: none !important;
            flex-direction: row !important;
            padding: 0 !important;
            border: none !important;
            backdrop-filter: none !important;
        }
    }
`;
document.head.appendChild(mobileMenuStyle);
