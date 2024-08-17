import { NavBar } from "./NavBar";

export function Layout({ selectedNavBarButton, sideBarContent, mainContent }) {
    return (
        <div className="layout-container">
            {/* Left sidebar-menu */}
            <NavBar selected={selectedNavBarButton} />

            <div className="content-container">
                {/* Sidebar content */}
                {sideBarContent && (
                    <aside className="sidebar">
                        <div className="sidebar-content">
                            {sideBarContent}
                        </div>
                    </aside>
                )}

                {/* Main content */}
                <main className={`main-content ${!sideBarContent ? 'full-width' : ''}`}>
                    {mainContent}
                </main>
            </div>
        </div>
    );
}
