import './Layout.css'
import { NavLink, Outlet } from 'react-router-dom'

const menuItems = [
  { to: '/tienda', label: 'Tienda', icon: '▣' },
  { to: '/servicios', label: 'Servicios', icon: '◫' },
  { to: '/clientes', label: 'Clientes', icon: '◎' },
]

function Layout() {
  return (
    <div className="app-shell">
      <aside className="layout-sidebar">
        <div className="layout-sidebar__container">
          <div className="logo">
            <div className="logo-icon">+</div>
            <div>
              <strong>NovaCRM</strong>
              <span>Analytics</span>
            </div>
          </div>

          <nav className="layout-nav">
            {menuItems.map(({ to, label, icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `nav-item ${isActive ? 'active' : ''}`
                }
              >
                <span>{icon}</span>
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>

      <main className="layout-main">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout
