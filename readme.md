# Rosa's Ventrue Feeding Generator

A Vampire: The Masquerade 5th Edition tool for generating famous feeding targets for Ventrue characters.

## Features

- **11 Target Categories**: Music, Film & TV, Comedy, Politics, Business & Tech, Sports, Culture & Academia, Royalty, Crime, Social Media, and Associates
- **Weighted Celebrity Tiers**: A-List (5%), B-List (10%), C-List (25%), D-List (30%), Z-List (30%)
- **Tier-Based Difficulty**: Higher-tier celebrities have more challenging security
- **Culturally Appropriate Names**: Names match the city's region
- **Associates System**: Generate family/friends of celebrities (2 tiers lower)
- **Story Elements**: Hooks and complications for each target

## File Structure
```
├── index.html
├── styles.css
├── script.js
├── README.md
└── data/
    ├── categories.json
    ├── names.json
    ├── security.json
    ├── tiers.json
    └── story-elements.json
```

## Installation

1. Clone or download this repository
2. Open `index.html` in a web browser
3. **Note**: Due to CORS restrictions, you may need to run a local server:
```bash
   python -m http.server 8000
   # or
   npx http-server
```

## Editing Data

All game data is stored in JSON files in the `data/` directory for easy editing:

- **categories.json**: Target types, roles, and locations
- **names.json**: Name pools by region and city mappings
- **tiers.json**: Celebrity tier weights and difficulty ranges
- **security.json**: Security level definitions
- **story-elements.json**: Hooks and complications

## Usage

1. Select target categories appropriate for your scene
2. Enter a city name
3. Click "Find Target" to generate a feeding target
4. Use the generated target in your V:tM chronicle

## License

This is a fan-made tool for Vampire: The Masquerade 5th Edition. All V:tM content is © White Wolf Publishing/Paradox Interactive.