import React, { useState } from 'react';
import Papa from 'papaparse';
import './App.css';


function App() {
  const [students, setStudents] = useState([]);
  const [results, setResults] = useState([]);
  const [searchType, setSearchType] = useState('id');
  const [searchValue, setSearchValue] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const [filters, setFilters] = useState({
    faculty: '',
    citizenship: '',
    gender: '',
    course: '',
    yearAdmittedToCourse: '',
    firstNations: ''
  });

  const [currentPage, setCurrentPage] = useState(1);
  const resultsPerPage = 20;
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showToast, setShowToast] = useState(false);
  

  // Handle CSV upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > 50) {
      setMessage(`File too large (${fileSizeMB.toFixed(1)}MB). Max 50MB.`);
      return;
    }

    setLoading(true);
    setProgress(0);
    setMessage(`Uploading ${file.name} (${fileSizeMB.toFixed(1)}MB)...`);

    console.log('Starting file upload:', file.name, 'Size:', fileSizeMB.toFixed(1), 'MB');

    // Use a timeout to prevent hanging
    const timeout = setTimeout(() => {
      console.error('File parsing timeout');
      setMessage('File parsing took too long. Try a smaller file or check format.');
      setLoading(false);
    }, 60000); // 60 second timeout

    Papa.parse(file, {
      skipEmptyLines: true,
      dynamicTyping: false,
      header: false,
      complete: (results) => {
        clearTimeout(timeout);
        console.log('Parse complete. Rows:', results.data.length, 'Errors:', results.errors.length);

        if (results.errors.length > 0) {
          console.warn('CSV parsing errors:', results.errors);
        }

        const data = results.data
          .map((row, idx) => {
            try {
              // Skip first row if it looks like a header
              const values = Array.isArray(row) ? row : Object.values(row);
              
              // Check if this looks like a header row
              if (idx === 0 && (values[0]?.toLowerCase().includes('student') || values[0]?.toLowerCase().includes('stu'))) {
                console.log('Skipping header row');
                return null;
              }
              
              if (!values[0]) return null; // Skip empty rows
              
              return {
                stuId: String(values[0] || '').trim(),
                givenName: String(values[3] || '').trim(),
                familyName: String(values[4] || '').trim(),
                gender: String(values[7] || '').trim(),
                citizenship: String(values[9] || '').trim(),
                address: String(values[11] || '').trim(),
                faculty: String(values[18] || '').trim(),
                org: String(values[20] || '').trim(),
                course: String(values[23] || '').trim(),
                major: String(values[61] || '').trim(),
                mobile: String(values[values.length - 3] || '').trim(),
                homePhone: String(values[values.length - 4] || '').trim(),
                curtinEmail: String(values[values.length - 2] || '').trim(),
                personalEmail: String(values[values.length - 1] || '').trim(),
                yearAdmittedToCourse: String(values[24] || '').trim(),
                sprdAdmittedToCourse: String(values[25] || '').trim(),
                firstNations: normalizeFirstNations(String(values[10] || '').trim()),
                completedCredits: String(values[45] || '').trim(),
                cwa: String(values[39] || '').trim()
              };
            } catch (err) {
              console.error('Error parsing row', idx, ':', err);
              return null;
            }
          })
          .filter(s => s && s.stuId);

        console.log('Valid rows:', data.length);

        if (data.length === 0) {
          setMessage('No valid student records found. Check CSV format.');
          setLoading(false);
          setProgress(0);
          return;
        }

        setStudents(data);
        setResults([]);
        setMessage(`Loaded ${data.length} students (${fileSizeMB.toFixed(1)}MB)`);
        setProgress(100);

        // Save to localStorage
        try {
          localStorage.setItem('studentData', JSON.stringify(data));
          console.log('Data saved to localStorage');
        } catch (err) {
          console.error('localStorage save failed:', err);
          setMessage(`Loaded ${data.length} students but couldn't save to cache`);
        }

        setTimeout(() => {
          setLoading(false);
          setProgress(0);
        }, 1000);
      },
      error: (error) => {
        clearTimeout(timeout);
        console.error('Parse error:', error);
        setMessage(`Error: ${error.message || 'Failed to parse CSV'}`);
        setLoading(false);
        setProgress(0);
      }
    });
  };

  // Load from localStorage on mount
  React.useEffect(() => {
    const saved = localStorage.getItem('studentData');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setStudents(parsed);
        setMessage(`Loaded ${parsed.length} students from cache`);
      } catch (e) {
        console.error('Error loading from localStorage:', e);
      }
    }
  }, []);

  // Search functions
  const handleFilterChange = (field, value) => {
    setCurrentPage(1);
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Search and filter combined
  const handleSearch = () => {
    setCurrentPage(1);
    let found = [...students];

    // Apply text search first
    if (searchValue.trim()) {
      switch (searchType) {
        case 'id':
          found = found.filter(s => s.stuId.toLowerCase() === searchValue.toLowerCase());
          break;
        case 'name':
          const [first, last] = searchValue.split(' ').filter(Boolean);
          found = found.filter(s =>
            s.givenName.toLowerCase().includes((first || '').toLowerCase()) &&
            s.familyName.toLowerCase().includes((last || '').toLowerCase())
          );
          break;
        case 'email':
          found = found.filter(s =>
            s.curtinEmail.toLowerCase() === searchValue.toLowerCase() ||
            s.personalEmail.toLowerCase() === searchValue.toLowerCase()
          );
          break;
        default:
          break;
      }
    }

    // Apply filters
    if (filters.faculty) found = found.filter(s => s.faculty === filters.faculty);
    if (filters.citizenship) found = found.filter(s => s.citizenship === filters.citizenship);
    if (filters.gender) found = found.filter(s => s.gender === filters.gender);
    if (filters.course) found = found.filter(s => s.course.split('(')[0].trim() === filters.course);
    if (filters.yearAdmittedToCourse) found = found.filter(s => s.yearAdmittedToCourse === filters.yearAdmittedToCourse);
    if (filters.firstNations) found = found.filter(s => s.firstNations === filters.firstNations);

    if (found.length === 0) {
      setMessage('No students found');
      setResults([]);
    } else {
      setMessage(`Found ${found.length} student${found.length !== 1 ? 's' : ''}`);
      setResults(found);
    }
  };

  // Helper function to normalize firstNations values
  const normalizeFirstNations = (value) => {
    if (!value) return '';
    const lowerValue = value.toLowerCase();
    if (lowerValue === 'not answered' || lowerValue === 'not entered') {
      return 'Not Answered/Entered';
    }
    return value;
  };

  // Export to CSV
  const handleExport = () => {
    if (results.length === 0) {
      setMessage('No results to export');
      return;
    }

    try {
      const headers = ['Student ID', 'Given Name', 'Family Name', 'Gender', 'Citizenship', 'Address', 'Faculty', 'Org', 'Course', 'Major', 'Mobile', 'Home Phone', 'Curtin Email', 'Personal Email', 'Year Admitted', 'Semester Admitted', 'First Nations', 'Completed Credits', 'CWA'];

      const rows = results.map(s => [
        s.stuId, s.givenName, s.familyName, s.gender, s.citizenship, s.address,
        s.faculty, s.org, s.course, s.major, s.mobile, s.homePhone,
        s.curtinEmail, s.personalEmail, s.yearAdmittedToCourse, s.sprdAdmittedToCourse,
        s.firstNations, s.completedCredits, s.cwa
      ]);

      const csv = [
        headers.join(','),
        ...rows.map(row => row.map(cell => {
          const str = String(cell || '');
          return str.includes(',') || str.includes('"') ? `"${str.replace(/"/g, '""')}"` : str;
        }).join(','))
      ].join('\n');

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `students_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setMessage('Downloaded CSV');
    } catch (err) {
      console.error('Export error:', err);
      setMessage('Error exporting CSV: ' + err.message);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleClearCache = () => {
    localStorage.removeItem('studentData');
    setStudents([]);
    setResults([]);
    setMessage('Cache cleared');
  };

  const getSortedResults = () => {
    const sorted = [...results];
    
    switch(sortBy) {
      case 'name':
        sorted.sort((a, b) => {
          const nameA = `${a.givenName} ${a.familyName}`.toLowerCase();
          const nameB = `${b.givenName} ${b.familyName}`.toLowerCase();
          return sortOrder === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
        });
        break;
      case 'id':
        sorted.sort((a, b) => {
          const idA = parseInt(a.stuId) || 0;
          const idB = parseInt(b.stuId) || 0;
          return sortOrder === 'asc' ? idA - idB : idB - idA;
        });
        break;
      case 'date':
        sorted.sort((a, b) => {
          const yearA = parseInt(a.yearAdmittedToCourse) || 0;
          const yearB = parseInt(b.yearAdmittedToCourse) || 0;
          return sortOrder === 'asc' ? yearA - yearB : yearB - yearA;
        });
        break;
      default:
        break;
    }
    
    return sorted;
  };

  const showCopyToast = () => {
  setShowToast(true);
  setTimeout(() => setShowToast(false), 2000);
};

  return (
    <div className="App">
      <header className="header">
        <h1>Student Finder</h1>
        <p>Upload CSV, search, export</p>
      </header>

      {showToast && <div className="toast">Copied to clipboard!</div>}

      <div className="container">
        {/* Upload Section */}
        <div className="section">
          <h2>Step 1: Upload CSV</h2>
          <div className="upload-box">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              id="file-input"
              disabled={loading}
            />
            <label htmlFor="file-input">
              {loading ? 'Processing...' : 'Click to select CSV or drag & drop'}
            </label>
            {loading && progress > 0 && (
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: progress + '%' }}>
                  {Math.round(progress)}%
                </div>
              </div>
            )}
            {students.length > 0 && (
              <div className="loaded">
                {students.length} students loaded
                <button onClick={handleClearCache} className="btn-clear">Clear</button>
              </div>
            )}
          </div>
        </div>

        {/* Search Section */}
        {students.length > 0 && (
          <div className="section">
            <h2>Step 2: Search & Filter</h2>
            <div className="search-controls">
              <select value={searchType} onChange={(e) => setSearchType(e.target.value)}>
                <option value="id">Search by ID</option>
                <option value="name">Search by Name</option>
                <option value="email">Search by Email</option>
              </select>

              <input
                type="text"
                placeholder={
                  searchType === 'id' ? 'e.g., 12345678' :
                  searchType === 'name' ? 'e.g., John Smith' :
                  'e.g., john@curtin.edu.au'
                }
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyPress={handleKeyPress}
              />

              <button onClick={handleSearch} className="btn-search">
                Search
              </button>
            </div>

            <h3 style={{marginTop: '20px', marginBottom: '15px'}}>Filter Results</h3>
            <div className="search-controls">
              <select onChange={(e) => handleFilterChange('faculty', e.target.value)}>
                <option value="">All Faculties</option>
                {[...new Set(students.map(s => s.faculty))].filter(val => val && !/^[A-Z_]+$/.test(val)).sort().map(fac => (
                  <option key={fac} value={fac}>{fac}</option>
                ))}
              </select>

              <select onChange={(e) => handleFilterChange('citizenship', e.target.value)}>
                <option value="">All Citizenship</option>
                {[...new Set(students.map(s => s.citizenship))].filter(val => val && !/^[A-Z_]+$/.test(val)).sort().map(cit => (
                  <option key={cit} value={cit}>{cit}</option>
                ))}
              </select>

              <select onChange={(e) => handleFilterChange('gender', e.target.value)}>
                <option value="">All Gender</option>
                {[...new Set(students.map(s => s.gender))].filter(val => val && !val.includes('_')).sort().map(gen => (
                  <option key={gen} value={gen}>{gen}</option>
                ))}
              </select>

              <select onChange={(e) => handleFilterChange('course', e.target.value)}>
                <option value="">All Courses</option>
                {[...new Set(students.map(s => {
                  const mainCourse = s.course.split('(')[0].trim();
                  return mainCourse;
                }))].filter(val => val && !/^[A-Z_]+$/.test(val)).sort().map(crs => (
                  <option key={crs} value={crs}>{crs}</option>
                ))}
              </select>

              <select onChange={(e) => handleFilterChange('yearAdmittedToCourse', e.target.value)}>
                <option value="">All Years</option>
                {[...new Set(students.map(s => s.yearAdmittedToCourse))].filter(val => val && !/^[A-Z_]+$/.test(val)).sort().reverse().map(yr => (
                  <option key={yr} value={yr}>{yr}</option>
                ))}
              </select>

              <select onChange={(e) => handleFilterChange('firstNations', e.target.value)}>
                <option value="">All First Nations</option>
                {[...new Set(students.map(s => s.firstNations))].filter(val => val && !/^[A-Z_]+$/.test(val)).sort().map(fn => (
                  <option key={fn} value={fn}>{fn}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Message */}
        {message && (
          <div className="message">
            {message}
          </div>
        )}

        {/* Results Section */}
        {results.length > 0 && (
          <div className="section">
            <div className="results-header">
              <h2>Results ({results.length})</h2>
              <button onClick={handleExport} className="btn-export">
                Export CSV
              </button>
            </div>

            <div style={{marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center'}}>
              <span style={{color: '#666', fontWeight: '500'}}>Sort by:</span>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                style={{padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer'}}
              >
                <option value="name">Name</option>
                <option value="id">Student ID</option>
                <option value="date">Start Date</option>
              </select>
              <button 
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                style={{
                  padding: '8px 15px',
                  background: '#333',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  transition: 'all 0.3s ease'
                }}
              >
                {sortOrder === 'asc' ? '↑ A-Z' : '↓ Z-A'}
              </button>
            </div>

            <div className="results-list">
              {getSortedResults().slice((currentPage - 1) * resultsPerPage, currentPage * resultsPerPage).map((student, idx) => (
                <ResultCard key={idx} student={student} onCopy={showCopyToast} />
              ))}
            </div>

            {results.length > resultsPerPage && (
              <div className="pagination">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="btn-pagination"
                >
                  Previous
                </button>
                <span className="page-info">
                  Page {currentPage} of {Math.ceil(results.length / resultsPerPage)}
                </span>
                <button 
                  onClick={() => setCurrentPage(prev => Math.min(Math.ceil(results.length / resultsPerPage), prev + 1))}
                  disabled={currentPage === Math.ceil(results.length / resultsPerPage)}
                  className="btn-pagination"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ResultCard({ student, onCopy }) {
  const [expanded, setExpanded] = useState(false);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    onCopy();
  };

  const fullName = `${student.givenName} ${student.familyName}`;

  return (
    <div className="result-card">
      <div className="card-header" onClick={() => setExpanded(!expanded)}>
        <div className="header-content">
          <div className="name-and-id">
            <strong
              className="student-name"
              onClick={(e) => { e.stopPropagation(); handleCopy(fullName); }}
            >
              {fullName}
            </strong>
            <span
              className="card-id"
              onClick={(e) => { e.stopPropagation(); handleCopy(student.stuId); }}
            >
              ID: {student.stuId}
            </span>
          </div>
        </div>
        <div className="card-meta">
          <span className="badge">{student.faculty}</span>
          <span className="expand">{expanded ? '▼' : '▶'}</span>
        </div>
      </div>

      {expanded && (
        <div className="card-details">
          <Detail label="Email" value={student.curtinEmail || student.personalEmail} onCopy={handleCopy} />
          <Detail label="Gender" value={student.gender} onCopy={handleCopy} />
          <Detail label="Citizenship" value={student.citizenship} onCopy={handleCopy} />
          <Detail label="Address" value={student.address} onCopy={handleCopy} />
          <Detail label="Organization" value={student.org} onCopy={handleCopy} />
          <Detail label="Course" value={student.course} onCopy={handleCopy} />
          <Detail label="Major" value={student.major} onCopy={handleCopy} />
          <Detail label="Mobile" value={student.mobile} onCopy={handleCopy} />
          <Detail label="Home Phone" value={student.homePhone} onCopy={handleCopy} />
          <Detail label="Year Admitted" value={student.yearAdmittedToCourse} onCopy={handleCopy} />
          <Detail label="Semester" value={student.sprdAdmittedToCourse} onCopy={handleCopy} />
          <Detail label="Completed Credits" value={student.completedCredits} onCopy={handleCopy} />
          <Detail label="CWA" value={student.cwa} onCopy={handleCopy} />
        </div>
      )}
    </div>
  );
}

function Detail({ label, value, onCopy }) {
  return (
    <div className="detail">
      <span className="label">{label}:</span>
      {value ? (
        <span className="value" onClick={() => onCopy(value)}>
          {value}
        </span>
      ) : (
        <span className="value">-</span>
      )}
    </div>
  );
}

export default App;