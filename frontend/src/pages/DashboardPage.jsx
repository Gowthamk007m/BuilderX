import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

function DashboardPage() {
  const [projects, setProjects] = useState([])
  const [prompt, setPrompt] = useState('')
  const [generatedProject, setGeneratedProject] = useState(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
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

  const handleGenerateProject = async (event) => {
    event.preventDefault()
    setError('')
    setGeneratedProject(null)
    setIsGenerating(true)

    try {
      const response = await api.post('/api/generate-project/', { prompt })
      setGeneratedProject(response.data)
      setProjects((prevProjects) => [response.data, ...prevProjects])
      setPrompt('')
    } catch {
      setError('Failed to generate project. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const renderFeatureList = (featureList) => {
    if (!Array.isArray(featureList) || featureList.length === 0) {
      return <p className="project-features-empty">No generated features.</p>
    }

    return (
      <ul className="feature-list">
        {featureList.map((feature, index) => (
          <li key={`${feature}-${index}`}>{feature}</li>
        ))}
      </ul>
    )
  }

  return (
    <main className="dashboard-page">
      <div className="dashboard-header">
        <h1>Your Projects</h1>
        <button type="button" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <form className="generate-form" onSubmit={handleGenerateProject}>
        <label htmlFor="prompt">Generate project from prompt</label>
        <textarea
          id="prompt"
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          placeholder="Example: Build a personal finance tracker for freelancers"
          required
          rows={4}
        />
        <button type="submit" disabled={isGenerating}>
          {isGenerating ? 'Generating…' : 'Generate Project'}
        </button>
      </form>

      {generatedProject && (
        <section className="generated-result">
          <h2>Latest Generated Project</h2>
          <article className="project-card">
            <h3>{generatedProject.title}</h3>
            <p>{generatedProject.description}</p>
            {renderFeatureList(generatedProject.feature_list)}
          </article>
        </section>
      )}

      {isLoading && <p>Loading projects…</p>}
      {error && <p className="error-message">{error}</p>}

      {!isLoading && !error && (
        <ul className="project-list">
          {projects.length === 0 && <li>No projects yet.</li>}
          {projects.map((project) => (
            <li key={project.id} className="project-card">
              <h2>{project.title}</h2>
              <p>{project.description}</p>
              {renderFeatureList(project.feature_list)}
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}

export default DashboardPage
