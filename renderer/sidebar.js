function createSidebar() {
    const sidebarHTML = `
        <div id="sidebar">
            <ul>
                <li class="has-submenu">
                    <a href="#">Services</a>
                    <ul class="submenu">
                        <li><a href="barangay-clearance.html">Barangay Clearance</a></li>
                        <li><a href="warrant-booking.html">Warrant Booking</a></li>
                    </ul>
                </li>
                <li><a href="index.html">Dashboard</a></li>
            </ul>
        </div>
    `;
    
    // Insert the sidebar into the placeholder
    document.getElementById("sidebar-container").innerHTML = sidebarHTML;
}

// Run function when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", createSidebar);

document.addEventListener('click', (event) => {
    const clickedMenu = event.target.closest('.has-submenu');

    // Close all submenus first
    document.querySelectorAll('.submenu').forEach(submenu => {
        if (!clickedMenu || submenu !== clickedMenu.querySelector('.submenu')) {
            submenu.style.display = 'none';
        }
    });

    // Toggle the clicked submenu
    if (clickedMenu) {
        const submenu = clickedMenu.querySelector('.submenu');
        if (submenu) {
            submenu.style.display = submenu.style.display === 'none' || submenu.style.display === '' 
                ? 'block' 
                : 'none';
        }
    }
});

