import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { addDoc, collection, doc, getDoc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebase';

const ProjectDetails = () => {
  const [project, setProject] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
  });

  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        navigate('/login');
        return;
      }

      if (id) {
        try {
          const docRef = doc(db, 'projects', id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists() && docSnap.data().ownerId === currentUser.uid) {
            const data = docSnap.data();
            setProject({
              name: data.name || '',
              description: data.description || '',
              startDate: data.startDate
                ? data.startDate.split('T')[0]
                : '',
              endDate: data.endDate ? data.endDate.split('T')[0] : '',
            });
          } else {
            navigate('/projects');
          }
        } catch (error) {
          console.error('Error fetching project', error);
        }
      }
    });

    return () => unsubscribe();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProject((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const currentUser = auth.currentUser;

    if (!currentUser) {
      navigate('/login');
      return;
    }

    try {
      if (id) {
        await updateDoc(doc(db, 'projects', id), {
          ...project,
          ownerId: currentUser.uid,
        });
      } else {
        await addDoc(collection(db, 'projects'), {
          ...project,
          ownerId: currentUser.uid,
        });
      }

      navigate('/projects');
    } catch (error) {
      console.error('Error saving project', error);
    }
  };

  return (
    <div className="container mt-4">
      <h1 className="text-center">
        {id ? 'Update Project' : ' Create Project'}
      </h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={project.name}
            className="form-control"
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <input
            type="text"
            id="description"
            name="description"
            value={project.description}
            className="form-control"
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="startDate">Start Date</label>
          <input
            type="date"
            id="startDate"
            name="startDate"
            value={project.startDate}
            className="form-control"
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="endDate">End Date</label>
          <input
            type="date"
            id="endDate"
            name="endDate"
            value={project.endDate}
            className="form-control"
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary">
          {id ? 'Update' : 'Create'}
        </button>
      </form>
    </div>
  );
};

export default ProjectDetails;
