function createSidebar() {
    const sidebarHTML = `
        <div id="sidebar">
            <h2>Barangay System</h2>
            <ul>
                <li><a href="index.html">Dashboard</a></li>
                <li><a href="barangay-clearance.html">Barangay Clearance</a></li>
            </ul>
        </div>
    `;
    
    // Insert the sidebar into the placeholder
    document.getElementById("sidebar-container").innerHTML = sidebarHTML;
}

// Run function when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", createSidebar);

