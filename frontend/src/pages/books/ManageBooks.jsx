import React, { useEffect, useState, useRef } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const genreOptions = [
  'Roman', 'Science-fiction', 'Fantastique', 'Policier', 'Biographie', 'Histoire', 'Jeunesse', 'Poésie', 'Essai', 'Autre',
  'Aventure', 'Drame', 'Humour', 'Classique', 'Théâtre', 'Philosophie', 'Psychologie', 'Religion', 'Sociologie', 'Cuisine',
  'Voyage', 'Art', 'Musique', 'Informatique', 'Manga', 'BD', 'Santé', 'Sport', 'Nature', 'Animaux', 'Économie', 'Politique',
  'Sciences', 'Technologie', 'Éducation', 'Entreprise', 'Dictionnaire', 'Guide', 'Loisirs', 'Spiritualité', 'Érotique',
  'LGBTQ+', 'Féminisme', 'Guerre', 'Médical', 'Paranormal', 'Western', 'Chick-lit', 'Young Adult', 'New Adult',
  'Roman graphique', 'Littérature étrangère', 'Littérature française'
];

const defaultCover = '/images/books/default-cover.png';

const ManageBooks = () => {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: '', author: '', genre: '', price: '', description: '', stock: 0, image: '' });
  const [imagePreview, setImagePreview] = useState(defaultCover);
  const [imageFile, setImageFile] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef();

  // Fetch all books
  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async (query = '') => {
    setLoading(true);
    const url = query ? `/api/books/search?query=${encodeURIComponent(query)}` : '/api/books';
    const res = await fetch(url);
    const data = await res.json();
    setBooks(data);
    setLoading(false);
  };

  // Handle search
  const handleSearch = e => {
    e.preventDefault();
    fetchBooks(search);
  };

  // Handle add book form
  const handleFormChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleImageChange = e => {
    const file = e.target.files[0];
    setImageFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = evt => setImagePreview(evt.target.result);
      reader.readAsDataURL(file);
    } else {
      setImagePreview(defaultCover);
    }
  };

  const handleDrop = e => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      fileInputRef.current.files = e.dataTransfer.files;
      handleImageChange({ target: { files: e.dataTransfer.files } });
    }
  };

  const uploadBookCover = async file => {
    const formData = new FormData();
    formData.append('image', file);
    const res = await fetch('/api/books/upload-cover', { method: 'POST', body: formData });
    if (!res.ok) throw new Error('Erreur lors de l\'upload de la couverture');
    const data = await res.json();
    return data.imageUrl;
  };

  const handleAddBook = async e => {
    e.preventDefault();
    let imageUrl = '';
    if (imageFile) {
      try {
        imageUrl = await uploadBookCover(imageFile);
      } catch (err) {
        setError(err.message);
        return;
      }
    }
    const bookData = { ...form, image: imageUrl };
    const res = await fetch('/api/books', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookData)
    });
    const data = await res.json();
    if (res.ok) {
      setForm({ title: '', author: '', genre: '', price: '', description: '', stock: 0, image: '' });
      setImagePreview(defaultCover);
      setImageFile(null);
      fetchBooks();
      setError(null);
      alert('Livre ajouté avec succès');
    } else {
      setError(data.message || 'Erreur lors de l\'ajout du livre');
    }
  };

  // Helper for book image
  const getBookImageUrl = image => {
    if (!image || image.trim() === '') return defaultCover;
    if (image.startsWith('/') || image.startsWith('http')) return image;
    return '/images/books/' + image;
  };

  // Delete book
  const deleteBook = async id => {
    if (!window.confirm('Supprimer ce livre ?')) return;
    const res = await fetch(`/api/books/${id}`, { method: 'DELETE' });
    if (res.ok) {
      fetchBooks();
    } else {
      alert('Erreur lors de la suppression du livre');
    }
  };

  return (
    <>
      <Navbar />
      <div className="container py-5">
        <div className="row g-4">
          {/* Add Book Form */}
          <div className="col-lg-5">
            <div className="card p-4 shadow-sm">
              <h3 className="section-title"><i className="bi bi-plus-circle me-2"></i>Ajouter un Nouveau Livre</h3>
              <form onSubmit={handleAddBook} autoComplete="off">
                <div className="mb-3">
                  <label htmlFor="title" className="form-label">Titre</label>
                  <input type="text" className="form-control" id="title" name="title" required value={form.title} onChange={handleFormChange} placeholder="Ex: Le Petit Prince" />
                </div>
                <div className="mb-3">
                  <label htmlFor="author" className="form-label">Auteur</label>
                  <input type="text" className="form-control" id="author" name="author" required value={form.author} onChange={handleFormChange} placeholder="Ex: Antoine de Saint-Exupéry" />
                </div>
                <div className="mb-3">
                  <label htmlFor="genre" className="form-label">Genre</label>
                  <select className="form-control" id="genre" name="genre" required value={form.genre} onChange={handleFormChange}>
                    <option value="">-- Choisir un genre --</option>
                    {genreOptions.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div className="mb-3">
                  <label htmlFor="price" className="form-label">Prix (€)</label>
                  <input type="number" className="form-control" id="price" name="price" step="0.01" required value={form.price} onChange={handleFormChange} placeholder="Ex: 12.99" />
                </div>
                <div className="mb-3">
                  <label htmlFor="description" className="form-label">Description</label>
                  <textarea className="form-control" id="description" name="description" rows="2" value={form.description} onChange={handleFormChange} placeholder="Brève description..."></textarea>
                </div>
                <div className="mb-3">
                  <label htmlFor="stock" className="form-label">Stock</label>
                  <input type="number" className="form-control" id="stock" name="stock" min="0" value={form.stock} onChange={handleFormChange} />
                </div>
                <div className="mb-3">
                  <label htmlFor="image" className="form-label">Image de couverture</label>
                  <div id="dropZone" style={{border:'2px dashed #6366f1',borderRadius:'0.5rem',padding:'1.5rem',textAlign:'center',cursor:'pointer',background:'#f8fafc',transition:'background 0.2s'}}
                    onClick={() => fileInputRef.current.click()}
                    onDragOver={e => {e.preventDefault();e.currentTarget.style.background='#e0e7ff';}}
                    onDragLeave={e => {e.preventDefault();e.currentTarget.style.background='#f8fafc';}}
                    onDrop={handleDrop}
                  >
                    <span id="dropZoneText"><i className="bi bi-cloud-arrow-up fs-3"></i><br />Glissez-déposez une image ici ou cliquez pour sélectionner</span>
                    <input type="file" className="form-control" id="image" name="image" accept="image/*" style={{display:'none'}} ref={fileInputRef} onChange={handleImageChange} />
                    <div className="mt-2">
                      <img id="imagePreview" src={imagePreview} alt="Aperçu" style={{maxWidth:'100px',maxHeight:'130px',borderRadius:'0.3rem',boxShadow:'0 2px 8px #0001',display:'block',margin:'auto'}} />
                    </div>
                  </div>
                </div>
                {error && <div className="alert alert-danger">{error}</div>}
                <button type="submit" className="btn btn-primary w-100"><i className="bi bi-plus-lg me-1"></i>Ajouter le Livre</button>
              </form>
            </div>
          </div>
          {/* Book List & Search */}
          <div className="col-lg-7">
            <div className="card p-4 shadow-sm mb-4">
              <h3 className="section-title"><i className="bi bi-search me-2"></i>Rechercher des Livres</h3>
              <form onSubmit={handleSearch} className="mb-0">
                <div className="input-group">
                  <input type="text" className="form-control" id="searchQuery" placeholder="Titre, auteur ou genre..." value={search} onChange={e => setSearch(e.target.value)} />
                  <button type="submit" className="btn btn-primary"><i className="bi bi-search"></i> Rechercher</button>
                </div>
              </form>
            </div>
            <div className="card p-4 shadow-sm">
              <h3 className="section-title"><i className="bi bi-book-half me-2"></i>Liste des Livres</h3>
              <div className="table-responsive">
                <table className="table table-striped align-middle table-hover">
                  <thead>
                    <tr>
                      <th scope="col"><i className="bi bi-book"></i> Titre</th>
                      <th scope="col"><i className="bi bi-person"></i> Auteur</th>
                      <th scope="col"><i className="bi bi-tags"></i> Genre</th>
                      <th scope="col"><i className="bi bi-currency-euro"></i> Prix</th>
                      <th scope="col"><i className="bi bi-box"></i> Stock</th>
                      <th scope="col"><i className="bi bi-image"></i> Couverture</th>
                      <th scope="col"><i className="bi bi-gear"></i> Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan="7" className="text-center">Chargement...</td></tr>
                    ) : books.length === 0 ? (
                      <tr><td colSpan="7" className="text-center alert alert-info">Aucun livre trouvé.</td></tr>
                    ) : (
                      books.map(book => (
                        <tr key={book._id}>
                          <td>{book.title}</td>
                          <td>{book.author}</td>
                          <td><span className="badge bg-info bg-gradient text-dark">{book.genre}</span></td>
                          <td><span className="fw-bold text-success">{book.price}</span></td>
                          <td>{book.stock > 5 ? <span className="badge bg-success">{book.stock}</span> : book.stock > 0 ? <span className="badge bg-warning text-dark">{book.stock}</span> : <span className="badge bg-danger">Rupture</span>}</td>
                          <td><img src={getBookImageUrl(book.image)} alt="Couverture" style={{width:'48px',height:'64px',objectFit:'cover',borderRadius:'0.3rem',boxShadow:'0 2px 8px #0001'}} onError={e => {e.target.onerror=null;e.target.src=defaultCover;}} /></td>
                          <td>
                            {/* Edit and Delete actions (edit modal not implemented here) */}
                            {/* <button type="button" className="btn btn-sm btn-primary me-1" title="Modifier"><i className="bi bi-pencil-square"></i></button> */}
                            <button onClick={() => deleteBook(book._id)} className="btn btn-sm btn-danger me-1" title="Supprimer"><i className="bi bi-trash"></i></button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
      {/* Inline styles for the page, as in the EJS */}
      <style>{`
        body { background: linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%); min-height: 100vh; }
        .card { border-radius: 1.25rem; box-shadow: 0 4px 24px rgba(0,0,0,0.07); }
        .form-label { font-weight: 500; color: #4f46e5; }
        .btn-primary { background: linear-gradient(90deg, #6366f1 0%, #3b82f6 100%); border: none; }
        .btn-primary:hover { background: linear-gradient(90deg, #3b82f6 0%, #6366f1 100%); }
        .btn-info { background: linear-gradient(90deg, #06b6d4 0%, #3b82f6 100%); border: none; color: #fff; }
        .btn-info:hover { background: linear-gradient(90deg, #3b82f6 0%, #06b6d4 100%); color: #fff; }
        .table thead { background: linear-gradient(90deg, #6366f1 0%, #06b6d4 100%); color: #fff; }
        .table-striped>tbody>tr:nth-of-type(odd)>* { background-color: #f1f5f9; }
        .section-title { color: #3b82f6; font-weight: 700; margin-bottom: 1rem; letter-spacing: 1px; }
        .input-group .form-control:focus { box-shadow: 0 0 0 0.2rem rgba(99,102,241,.25); border-color: #6366f1; }
        @media (max-width: 767px) { .card { margin-bottom: 1.5rem; } .table-responsive { font-size: 0.95rem; } }
      `}</style>
    </>
  );
};

export default ManageBooks;
