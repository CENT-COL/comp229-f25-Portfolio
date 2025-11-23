import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, deleteDoc, doc, getDocs, query, where } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebase';

const ProjectsList = () => {
  const [projects, setProjects] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        navigate('/login');
        return;
      }

      const fetchProjects = async () => {
        try {
          const projectsRef = collection(db, 'projects');
          const q = query(projectsRef, where('ownerId', '==', currentUser.uid));
          const snapshot = await getDocs(q);

          const fetchedProjects = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
          }));

          setProjects(fetchedProjects);
        } catch (error) {
          console.error(`Error fetching projects: ${error.message}`);
        }
      };

      fetchProjects();
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleDelete = async (projectId) => {
    const user = auth.currentUser;

    if (!user) {
      navigate('/login');
      return;
    }

    try {
      await deleteDoc(doc(db, 'projects', projectId));
      setProjects((prev) => prev.filter((project) => project.id !== projectId));
    } catch (error) {
      console.error(`Error deleting project: ${error.message}`);
    }
  };

  return (
    <div className="container mt-4">
      <h1 className="text-center">Projects</h1>
      <button
        className="btn btn-primary mb-3"
        onClick={() => navigate('/project-details')}
      >
        Create New Project
      </button>

      {projects.length > 0 ? (
        <>
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr key={project.id}>
                  <td>{project.name}</td>
                  <td>{project.description}</td>
                  <td>
                    {project.startDate
                      ? new Date(project.startDate).toLocaleDateString()
                      : '-'}
                  </td>
                  <td>
                    {project.endDate
                      ? new Date(project.endDate).toLocaleDateString()
                      : '-'}
                  </td>
                  <td>
                    <button
                      className="btn btn-secondary mr-2"
                      onClick={() => navigate(`/project-details/${project.id}`)}
                    >
                      Update
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDelete(project.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      ) : (
        <>
          <p className="text-center">No projects available</p>
        </>
      )}
    </div>
  );
};

export default ProjectsList;
