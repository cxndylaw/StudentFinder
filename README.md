# Student Finder - Simple Client-Only Version

A zero-backend, privacy-first student data search tool. Upload CSV → Search → Export. Everything runs in your browser.

## ✨ Features

✅ **No Backend** - Pure React app, runs entirely in browser  
✅ **No Database** - Data stored locally (memory + localStorage)  
✅ **100% Private** - Your data never leaves your computer  
✅ **CSV Upload** - Drop your CSV, it's parsed instantly  
✅ **Multiple Search** - By ID, Name, Email, or Faculty  
✅ **Export Results** - Download filtered data as CSV  
✅ **Offline Ready** - Works without internet  
✅ **GitHub Pages Ready** - Deploy free on Cloudflare + GitHub Pages  

## 🚀 Quick Start

### Local Development

```bash
# Install dependencies
npm install

# Start dev server
npm start
```

Then open `http://localhost:3000`

### Deploy to GitHub Pages + Cloudflare

1. **Create GitHub Repository**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/student-finder.git
   git branch -M main
   git push -u origin main
   ```

2. **Update GitHub Pages Settings**
   - Go to repo → Settings → Pages
   - Source: Deploy from branch
   - Branch: `gh-pages` (created automatically)
   - Save

3. **Update package.json**
   ```json
   "homepage": "https://students.yourdomain.com"
   ```

4. **Update GitHub Actions Workflow**
   Edit `.github/workflows/deploy.yml`:
   ```yaml
   - name: Deploy to GitHub Pages
     uses: peaceiris/actions-gh-pages@v3
     with:
       github_token: ${{ secrets.GITHUB_TOKEN }}
       publish_dir: ./build
       cname: students.yourdomain.com  # ← Change this
   ```

5. **Point Cloudflare Domain**
   - Go to Cloudflare → DNS
   - Add CNAME record:
     ```
     students  CNAME  yourusername.github.io
     ```
   - Wait a few minutes for DNS to propagate

6. **Enable GitHub Pages Custom Domain**
   - Go to repo → Settings → Pages
   - Custom domain: `students.yourdomain.com`
   - Enforce HTTPS: ✓
   - Save

## 📝 How to Use

### Step 1: Prepare CSV
Your CSV must have these columns:
```
Student ID, Given Name, Family Name, Gender, Citizenship, Address, Faculty, Org, Course, Major, Mobile, Home Phone, Curtin Email, Personal Email, Year Admitted, Semester Admitted, First Nations, Completed Credits, CWA
```

### Step 2: Upload
- Click upload area or drag CSV file
- Wait for "Loaded X students"

### Step 3: Search
Choose search type:
- **By ID**: `12345678`
- **By Name**: `John Smith`
- **By Email**: `john@curtin.edu.au`
- **By Faculty**: `1403`

### Step 4: Export
Click "📥 Export CSV" to download results

## 💾 Data Storage

**In-Memory**: While using the app  
**localStorage**: Automatically saved in browser  
**On Disk**: Only when you export CSV  

Data stays 100% local. Never sent to any server.

## 📦 File Structure

```
student-finder-simple/
├── public/
│   └── index.html
├── src/
│   ├── App.js          (Main component)
│   ├── App.css         (Styling)
│   ├── index.js
│   └── index.css
├── .github/
│   └── workflows/
│       └── deploy.yml  (GitHub Actions)
├── package.json
└── README.md
```

## 🛠️ Technologies

- **React 18** - UI framework
- **PapaParse** - CSV parsing
- **React Scripts** - Build tool

## 🚀 Deployment Options

### Free Option: GitHub Pages + Cloudflare
- Host on GitHub Pages (free)
- Use Cloudflare domain (free)
- Auto-deploy on every push
- See setup above

### Alternative: Netlify (Also Free)
```bash
npm run build
# Drag build folder to netlify.com
```

## 🔒 Privacy

✓ No backend server  
✓ No database  
✓ No cookies/tracking  
✓ Data never leaves your device  
✓ Fully open source  

## ⚡ Performance

- Instant CSV upload (no server)
- Instant search (no API calls)
- Instant export (client-side)
- Works offline
- ~1MB total size

## 🎨 Customization

### Change Colors
Edit `src/App.css`:
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
/* Change #667eea and #764ba2 to your colors */
```

### Change App Title
Edit `src/App.js`:
```javascript
<h1>📊 Student Finder</h1>
/* Change this text */
```

### Add More Columns
Edit `src/App.js` in the `handleFileUpload` function to map more CSV columns.

## 🐛 Troubleshooting

### CSV Not Uploading
- Check column names match exactly
- Ensure CSV is UTF-8 encoded
- Try with smaller file first

### Search Returns Nothing
- Check spelling
- Search is case-insensitive (should work)
- Try a different search type

### Export Not Working
- Check you have search results
- Try different browser
- Check browser allows downloads

### Deployment Issues

**GitHub Actions failing?**
- Check branch name (main vs master)
- Verify CNAME entry in deploy.yml
- Check GitHub token has permissions

**Domain not pointing?**
- Wait 5-10 minutes for DNS
- Check Cloudflare DNS is correct
- Clear browser cache

**GitHub Pages not deploying?**
- Enable GitHub Pages in Settings
- Check branch is set to gh-pages
- Look at Actions tab for errors

## 📱 Mobile Support

✓ Responsive design  
✓ Touch-friendly buttons  
✓ Works on all modern browsers  

## 🤝 Contributing

Feel free to fork and customize!

## 📄 License

MIT - Use freely

---

**Questions?** Check the troubleshooting section or review the code - it's simple and well-commented!

## Quick Commands

```bash
# Local development
npm start

# Build for production
npm run build

# Deploy (if using gh-pages)
npm run deploy
```

That's it! Your student finder is ready to go. 🎉
# StudentFinder
