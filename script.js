// Global data storage
let gameData = {
    categories: null,
    names: null,
    tiers: null,
    security: null,
    storyElements: null
};

// Application state
let state = {
    city: '',
    target: null,
    selectedCategories: {}
};

// Load all JSON data files
async function loadData() {
    try {
        const [categories, names, tiers, security, storyElements] = await Promise.all([
            fetch('data/categories.json').then(r => r.json()),
            fetch('data/names.json').then(r => r.json()),
            fetch('data/tiers.json').then(r => r.json()),
            fetch('data/security.json').then(r => r.json()),
            fetch('data/story-elements.json').then(r => r.json())
        ]);

        gameData.categories = categories;
        gameData.names = names;
        gameData.tiers = tiers;
        gameData.security = security;
        gameData.storyElements = storyElements;

        // Initialize selected categories (all true by default)
        Object.keys(gameData.categories).forEach(key => {
            state.selectedCategories[key] = true;
        });

        initializeUI();
    } catch (error) {
        console.error('Error loading data:', error);
        document.body.innerHTML = '<div style="color: red; padding: 20px;">Error loading data files. Please ensure all JSON files are present in the data/ directory.</div>';
    }
}

// Initialize the UI
function initializeUI() {
    renderCategoryCheckboxes();
    setupEventListeners();
    updateButtonState();
}

// Render category checkboxes
function renderCategoryCheckboxes() {
    const container = document.getElementById('categoryCheckboxes');
    container.innerHTML = '';

    Object.keys(gameData.categories).forEach(category => {
        const label = document.createElement('label');
        label.className = 'checkbox-label';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'checkbox';
        checkbox.checked = state.selectedCategories[category];
        checkbox.dataset.category = category;
        
        const span = document.createElement('span');
        span.className = state.selectedCategories[category] ? 'checkbox-text checkbox-text-active' : 'checkbox-text checkbox-text-inactive';
        span.textContent = category;
        
        label.appendChild(checkbox);
        label.appendChild(span);
        container.appendChild(label);
    });
}

// Setup event listeners
function setupEventListeners() {
    // Category checkboxes
    document.getElementById('categoryCheckboxes').addEventListener('change', function(e) {
        if (e.target.type === 'checkbox') {
            const category = e.target.dataset.category;
            state.selectedCategories[category] = e.target.checked;
            renderCategoryCheckboxes();
            updateButtonState();
            updateWarning();
        }
    });

    // City input
    const cityInput = document.getElementById('cityInput');
    cityInput.addEventListener('input', function() {
        state.city = this.value;
        updateButtonState();
    });

    cityInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            generateTarget();
        }
    });

    // Generate button
    document.getElementById('genBtn').addEventListener('click', generateTarget);
}

// Update button disabled state
function updateButtonState() {
    const genBtn = document.getElementById('genBtn');
    const allOff = Object.values(state.selectedCategories).every(v => !v);
    
    if (!state.city.trim() || allOff) {
        genBtn.setAttribute('disabled', 'disabled');
    } else {
        genBtn.removeAttribute('disabled');
    }
}

// Update warning display
function updateWarning() {
    const warningBox = document.getElementById('warningBox');
    const allOff = Object.values(state.selectedCategories).every(v => !v);
    
    if (allOff) {
        warningBox.innerHTML = '<div class="warning">Warning: No target categories selected. Please choose at least one.</div>';
    } else {
        warningBox.innerHTML = '';
    }
}

// Random selection helper
function random(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

// Generate name based on city
function generateName(city) {
    const cityLower = city.toLowerCase().trim();
    const region = gameData.names.cityMapping[cityLower] || 'english';
    const namePool = gameData.names[region];
    const firstName = random(namePool.first);
    const lastName = random(namePool.last);
    return `${firstName} ${lastName}`;
}

// Get weighted tier
function getWeightedTier() {
    const pool = [];
    gameData.tiers.tiers.forEach(tier => {
        for (let i = 0; i < tier.weight; i++) {
            pool.push(tier);
        }
    });
    return random(pool);
}

// Get difficulty for tier
function getDifficultyForTier(tier) {
    const tierData = gameData.tiers.tiers.find(t => t.tier === tier);
    return random(tierData.difficultyRange);
}

// Generate associate
function generateAssociate(primaryCelebrity, primaryTier) {
    const associateData = gameData.categories.Associates;
    const relationship = random(associateData.relationships);
    const role = random(associateData.roles);
    
    const associateTier = gameData.tiers.associateTierMap[primaryTier];
    const associateFame = gameData.tiers.tiers.find(t => t.tier === associateTier);
    
    return {
        relationship,
        role,
        primaryCelebrity,
        fame: associateFame
    };
}

// Generate target
function generateTarget() {
    if (!state.city.trim()) return;
    
    const availableCategories = Object.keys(gameData.categories).filter(cat => state.selectedCategories[cat]);
    
    if (availableCategories.length === 0) {
        alert('Please select at least one target category.');
        return;
    }
    
    const category = random(availableCategories);
    const isAssociate = category === 'Associates';
    
    let target;
    const fame = getWeightedTier();
    const difficulty = getDifficultyForTier(fame.tier);
    
    if (isAssociate) {
        // Generate primary celebrity first
        const nonAssociateCategories = Object.keys(gameData.categories).filter(cat => cat !== 'Associates');
        const primaryCategory = random(nonAssociateCategories);
        const primaryRole = random(gameData.categories[primaryCategory].roles);
        const primaryName = generateName(state.city);
        
        const associateInfo = generateAssociate(primaryName, fame.tier);
        const name = generateName(state.city);
        const location = random(gameData.categories.Associates.locations);
        const security = random(gameData.security);
        
        target = {
            name,
            role: associateInfo.role,
            category: 'Associates',
            location: `${location} - ${state.city}`,
            security,
            fame: associateInfo.fame,
            isAssociate: true,
            relationship: associateInfo.relationship,
            primaryCelebrity: associateInfo.primaryCelebrity,
            primaryRole: primaryRole,
            difficulty: getDifficultyForTier(associateInfo.fame.tier)
        };
    } else {
        const role = random(gameData.categories[category].roles);
        const location = random(gameData.categories[category].locations);
        const security = random(gameData.security);
        const name = generateName(state.city);
        
        target = {
            name,
            role,
            category,
            location: `${location} - ${state.city}`,
            security,
            fame,
            isAssociate: false,
            difficulty
        };
    }
    
    target.hook = random(gameData.storyElements.hooks);
    target.complication = random(gameData.storyElements.complications);
    
    state.target = target;
    renderTarget();
}

// Render target display
function renderTarget() {
    const container = document.getElementById('targetDisplay');
    const t = state.target;
    
    if (!t) {
        container.innerHTML = '';
        return;
    }
    
    let stars = '';
    for (let i = 0; i < t.difficulty; i++) stars += '★';
    for (let i = t.difficulty; i < 5; i++) stars += '☆';
    
    const associateHTML = t.isAssociate ? `
        <div class="associate-box">
            <div class="associate-text"><strong>${t.relationship}</strong> ${t.primaryCelebrity}</div>
            <div class="associate-subtext">(${t.primaryRole})</div>
        </div>
    ` : '';
    
    const timeStart = Math.floor(Math.random() * 4) + 21;
    const timeEnd = Math.floor(Math.random() * 4) + 1;
    
    container.innerHTML = `
        <div class="card">
            <div class="target-grid">
                <div>
                    <div class="target-name">${t.name}</div>
                    ${associateHTML}
                    <div class="info-row"><span class="info-label">Role:</span> ${t.role}</div>
                    <div class="info-row"><span class="info-label">Location:</span> ${t.location}</div>
                    <div class="info-row"><span class="info-label">Fame Tier:</span> ${t.fame.tier}-List</div>
                    <div class="fame-box">${t.fame.description}</div>
                    <div class="info-row"><span class="info-label">Security:</span> ${t.security.icon} ${t.security.level} (${t.security.description})</div>
                    <div class="info-row"><span class="info-label">Difficulty:</span> <span class="stars">${stars}</span></div>
                </div>
                <div>
                    <h3 class="story-section-title">Story Elements</h3>
                    <div class="story-box">
                        <h4 class="story-title">Current Situation</h4>
                        <p class="story-text">${t.hook}</p>
                    </div>
                    <div class="complication-box">
                        <h4 class="complication-title">Potential Complication</h4>
                        <p class="complication-text">${t.complication}</p>
                    </div>
                    <div class="opportunity-box">
                        <h4 class="opportunity-title">Feeding Opportunity</h4>
                        <p class="opportunity-text">Target likely alone between <strong>${timeStart}:00-${timeEnd}:00</strong> when security is lightest.</p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', loadData);