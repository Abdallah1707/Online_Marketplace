import { Outlet } from 'react-router-dom'
import TopNav from './TopNav'
import './Layout.css'

export default function Layout({ setIsAuthenticated }) {
  return (
    <div className="layout">
      <TopNav setIsAuthenticated={setIsAuthenticated} />
      <main className="layout__content">
        <Outlet />
      </main>
    </div>
  )
}
