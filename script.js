

async function getData() {
    const filename = "statistics.json";
    try {
        const response = await fetch(filename);
        if (!response.ok) throw new Error(`Response status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error(error.message);
        return null;
    }
}

function addRow(row, statsTable) {
    const newRow = statsTable.insertRow(-1); 

    // 1. Statistic Name
    const cell1 = newRow.insertCell(0);
    cell1.innerHTML = row.statistic;

    // 2. Description Cell (Now using the visibility toggle approach)
    const cell2 = newRow.insertCell(1);
    const words = row.description.split(" ");
    const shortDesc = words.slice(0, 20).join(" ");
    const remainingDesc = words.slice(20).join(" ");

    // Baseline short text stays visible
    cell2.appendChild(document.createTextNode(shortDesc));

    // Remaining text goes into a hidden span (with a leading space)
    const descSpan = document.createElement('span');
    descSpan.style.display = 'none';
    descSpan.textContent = remainingDesc ? ` ${remainingDesc}` : '';
    cell2.appendChild(descSpan);

    // Attach unified button if there actually is text to expand
    if (remainingDesc) {
        const btn1 = createExpandButton(descSpan);
        cell2.appendChild(btn1);
    }

    // 3. Formula Cell (Using the exact same visibility toggle approach)
    const cell3 = newRow.insertCell(2);
    
    // Core formula stays visible
    const textFormula = document.createTextNode(row.formula)
    textFormula.className = "form-scrollable"
    cell3.appendChild(textFormula); 
    

    // Annotation goes into a hidden span
    const formulaSpan = document.createElement('span');
    formulaSpan.style.display = 'none';
    formulaSpan.style.whiteSpace = 'pre-line';
    formulaSpan.style.marginLeft = '15px'; 
    formulaSpan.textContent = row.formulaAnnotation ? `\n${row.formulaAnnotation}` : '';
    cell3.appendChild(formulaSpan);

    // Attach unified button if there is an annotation to expand
    if (row.formulaAnnotation) {
        const btn2 = createExpandButton(formulaSpan);
        cell3.appendChild(btn2);
    }
}

// A reusable toggle button function
function createExpandButton(hiddenSpan) {
    const btn = document.createElement('button');
    btn.className = 'expand-button';
    btn.textContent = '⌄';
    
    let isExpanded = false;

    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        isExpanded = !isExpanded;
        
        // Toggle visibility of the hidden span
        hiddenSpan.style.display = isExpanded ? 'inline' : 'none';
        // Toggle button arrow
        btn.textContent = isExpanded ? '⌃' : '⌄';
    });
    
    return btn;
}

function createHelpButton(headerName) {
    const btn = document.getElementById(`${headerName}-help-button`)
}

async function initializeTable() {

    const statsDict = await getData();

    if (statsDict && Array.isArray(statsDict)) {
        let statsTable = document.querySelector("#main-table tbody");

        statsDict.forEach(row => addRow(row, statsTable));

        if (window.MathJax?.typesetPromise) {
            MathJax.typesetPromise([statsTable]).catch(err => console.error(err));
        }

        
    }
}

function liveSearch(text) {
    const table = document.getElementById("main-table");
    if (!table) return; 
    
    const query = text.toLowerCase();

    for (let i = 1; i < table.rows.length; i++) {
        let row = table.rows[i];
        let rowText;

        if (row.cells[0]) {
            rowText = row.cells[0].textContent.toLowerCase(6);
        } else { 
            continue; 
        }
        
        if (rowText.includes(query)) {
            row.style.display = ""; 
        } else {
            row.style.display = "none";
        }
    }
}

function toggleSearchHelpBox() {
    const helpPopup = document.getElementById("search-help-box");
    let isDisplayed = helpPopup.style.display == "block";
    helpPopup.style.display = isDisplayed ? "none": "block";
}

function eventHelpHandle(headerName) {
    const headerButton = document.getElementById(`${headerName.toLowerCase()}-help-button`);
    const headerPopup = document.getElementById(`${headerName.toLowerCase()}-help-box`)

    headerButton.addEventListener('click', () => {
        let isDisplayed = headerPopup.style.display == "block";
        headerPopup.style.display = isDisplayed ? "none": "block";
    });

}

// Initialization and event handling

initializeTable();

const searchInputEL = document.getElementById("search-input");

if (searchInputEL) {
    searchInputEL.addEventListener('input', (event) => {
        liveSearch(event.target.value);
    });
}

const searchHelpButton = document.getElementById("search-help-button");

if (searchHelpButton) { 
    searchHelpButton.addEventListener("click", toggleSearchHelpBox); 
}

let statsTable = document.getElementById("main-table");

for (const header of statsTable.rows[0].cells) {
  eventHelpHandle(header.firstChild.textContent.trim());
}