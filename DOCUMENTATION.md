# Personal Writing Website - Complete Documentation

Welcome to your new personal writing space! This document is a complete guide to understanding how this website works, what each file does, and how you can manage it without needing a deep background in coding.

---

## 1. The Core Concept: A "Static" Website

This is a **Static Website**. Every page you visit corresponds to an actual `.html` file inside your project folder. We chose this approach for three reasons:
1. **Permanence**: Static files last forever. They don't break when a database updates.
2. **Speed & Security**: Without a database, there is nothing for hackers to break into, and pages load instantly.
3. **Free Hosting**: Because it's just files, you can host it completely for free on platforms like GitHub Pages.

To make the website feel seamless and magical, we added a small Javascript "brain" that acts as a Seamless Router and Typewriter engine.

---

## 2. Project Structure Breakdown

```text
writing_website/
│
├── DOCUMENTATION.md       <-- (You are reading this file right now!)
├── README.md              <-- GitHub repository description
├── index.html             <-- The Home Page
├── writings.html          <-- The Index of all writings
├── about.html             <-- The About Page
│
├── css/                   <-- Folder for Design & Styling
│   └── styles.css
│
├── js/                    <-- Folder for the "Brain"
│   ├── config.js          <-- Your configuration (Name, Title, Popup message)
│   ├── writings-data.js   <-- The master database of your writings
│   └── main.js            <-- The central engine (Router, Typewriter, Dark Mode)
│
└── writings/              <-- Folder for your actual content files
    ├── A letter to the reader.html
    ├── graveyard.html
    └── ... (all your articles)
```

---

## 3. File by File Breakdown

### The Main Pages (HTML files)
- **`index.html`**: Your Home Page. Shows a poetic introduction and a link to start reading. It also contains the hidden "Welcome Gift" popup that appears the very first time someone visits.
- **`writings.html`**: The library page. Displays a chronological list of every writing you've published.
- **`about.html`**: Your bio and purpose.

### The Content Folder (`writings/`)
- **`Your Article Title.html`**: These are the actual pages people read. 
  - **Why this way?** If someone is reading "Milk and Chocolate", they are literally looking at `Milk and Chocolate.html`. You paste your raw text into these files, and the `main.js` engine automatically formats them into beautiful paragraphs and runs the typewriter animation.

### The Design Folder (`css/`)
- **`styles.css`**: Controls the look of the *entire* website. It defines the warm off-white background, elegant typography, responsive mobile design, and Dark Mode.

### The "Brain" Folder (`js/`)
- **`config.js`**: Your master settings file. Contains your name, site title, and the special birthday popup message. 
- **`writings-data.js`**: The master list of your writings. This file automatically updates the links on the Home Page, the Writings index, and the Next/Previous buttons on individual articles.
- **`main.js`**: You never have to touch this file! It contains the Seamless SPA Router (so pages transition without refreshing), the Typewriter Engine, the Dark Mode logic, and the formatting engine.

---

## 4. Step-by-Step Guides

### How to edit your Name, Site Title, or Welcome Message
1. Open the `js/` folder and open `config.js`.
2. Change the text inside the quotation marks (e.g. `authorName: "Khadija Rukhsar"`).
3. Save the file. The website updates automatically everywhere.

### How to add a new writing
1. Go to the `writings/` folder. Copy an existing file (like `graveyard.html`) and paste it. Rename the file to your new title (e.g. `My New Story.html`).
2. Open `My New Story.html`, scroll down to `<div class="writing-content">`, and replace the text with your new story. Do not use `<p>` tags; just paste raw text with blank lines between paragraphs.
3. Open `js/writings-data.js`. Go to the bottom of the list, add a comma to the previous entry, and add your new entry:
   `{ file: "My New Story.html", title: "My New Story" }`
4. The site will automatically add it to your lists and hook up the Next/Previous buttons!

### How the Animation Button works
In the footer, there is an `Anim` toggle with 3 modes:
- **`Anim: ONCE`** (Default): The typewriter animation only plays on the *first* article a visitor opens, to preserve the surprise.
- **`Anim: ALWAYS`**: The typewriter plays on every single article.
- **`Anim: OFF`**: Disables the typewriter completely.

