import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

function DashboardPage() {
  const [projects, setProjects] = useState([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await api.get('/api/projects/')
        setProjects(response.data)
      } catch {
        setError('Failed to load projects. Please log in again.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProjects()
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    navigate('/login', { replace: true })
  }

  return (
    <main className="dashboard-page">
      <div className="dashboard-header">
        <h1>Your Projects</h1>
        <button type="button" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {isLoading && <p>Loading projects…</p>}
      {error && <p className="error-message">{error}</p>}

      {!isLoading && !error && (
        <ul className="project-list">
          {projects.length === 0 && <li>No projects yet.</li>}
          {projects.map((project) => (
            <li key={project.id} className="project-card">
              <h2>{project.title}</h2>
              <p>{project.description}</p>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}

export default DashboardPage
