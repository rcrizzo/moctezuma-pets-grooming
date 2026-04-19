import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  doc, 
  updateDoc, 
  deleteDoc 
} from 'firebase/firestore';
import { 
  Form, 
  Button, 
  Row, 
  Col, 
  Card, 
  Badge, 
  Modal, 
  InputGroup 
} from 'react-bootstrap';
import { IoSearch, IoPaw, IoCreate, IoTrash, IoFitness, IoColorWand } from 'react-icons/io5';

const Mascotas = () => {
  const [mascotas, setMascotas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [showEdit, setShowEdit] = useState(false);
  const [perfilAEditar, setPerfilAEditar] = useState(null);

  // Estado del formulario de registro
  const [nuevaMascota, setNuevaMascota] = useState({
    nombre: '',
    duenoId: '',
    duenoNombre: '',
    raza: '',
    talla: 'Mediano', // Mini, Chico, Mediano, Grande, Gigante
    tipoPelo: 'Pelo Corto', // Pelo Corto, Pelo Largo
    peso: '',
    etiquetas: []
  });

  const etiquetasDisponibles = [
    'Tranquilo', 'Nervioso', 'Agresivo', 'Pelo Largo', 
    'Pelo Corto', 'Alergias', 'Geriátrico', 'Requiere Bozal', 'Discapacidad'
  ];

  const tallasDisponibles = ['Mini', 'Chico', 'Mediano', 'Grande', 'Gigante'];

  useEffect(() => {
    // Escuchar mascotas
    const qMascotas = query(collection(db, "mascotas"));
    const unsubMascotas = onSnapshot(qMascotas, (snapshot) => {
      setMascotas(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Escuchar clientes para el select
    const qClientes = query(collection(db, "clientes"));
    const unsubClientes = onSnapshot(qClientes, (snapshot) => {
      setClientes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubMascotas();
      unsubClientes();
    };
  }, []);

  const handleGuardarMascota = async (e) => {
    e.preventDefault();
    if (!nuevaMascota.nombre || !nuevaMascota.duenoId) return alert("Nombre y Dueño son obligatorios");

    try {
      await addDoc(collection(db, "mascotas"), {
        ...nuevaMascota,
        peso: parseFloat(nuevaMascota.peso) || 0,
        fechaRegistro: new Date().toISOString()
      });
      setNuevaMascota({ nombre: '', duenoId: '', duenoNombre: '', raza: '', talla: 'Mediano', tipoPelo: 'Pelo Corto', peso: '', etiquetas: [] });
    } catch (error) {
      console.error("Error al registrar mascota:", error);
    }
  };

  const handleActualizarMascota = async () => {
    try {
      const docRef = doc(db, "mascotas", perfilAEditar.id);
      await updateDoc(docRef, {
        ...perfilAEditar,
        peso: parseFloat(perfilAEditar.peso) || 0
      });
      setShowEdit(false);
    } catch (error) {
      console.error("Error al actualizar:", error);
    }
  };

  const toggleEtiqueta = (tag, isEdit = false) => {
    if (isEdit) {
      const tags = perfilAEditar.etiquetas.includes(tag)
        ? perfilAEditar.etiquetas.filter(t => t !== tag)
        : [...perfilAEditar.etiquetas, tag];
      setPerfilAEditar({ ...perfilAEditar, etiquetas: tags });
    } else {
      const tags = nuevaMascota.etiquetas.includes(tag)
        ? nuevaMascota.etiquetas.filter(t => t !== tag)
        : [...nuevaMascota.etiquetas, tag];
      setNuevaMascota({ ...nuevaMascota, etiquetas: tags });
    }
  };

  const filteredMascotas = mascotas.filter(m => 
    m.nombre.toLowerCase().includes(busqueda.toLowerCase()) || 
    m.duenoNombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      <Row className="g-4">
        {/* FORMULARIO DE REGISTRO */}
        <Col lg={4}>
          <div className="glass-card p-4">
            <h4 className="fw-bold mb-1">Registro de Perfil</h4>
            <p className="text-muted small mb-4">Añade una nueva mascota al sistema con sus detalles logísticos.</p>

            <Form onSubmit={handleGuardarMascota}>
              <Form.Group className="mb-3">
                <Form.Label className="custom-label">Dueño (Cliente)</Form.Label>
                <Form.Select 
                  className="custom-input"
                  value={nuevaMascota.duenoId}
                  onChange={(e) => {
                    const selected = clientes.find(c => c.id === e.target.value);
                    setNuevaMascota({...nuevaMascota, duenoId: e.target.value, duenoNombre: selected ? selected.nombre : ''});
                  }}
                >
                  <option value="">Selecciona un cliente...</option>
                  {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="custom-label">Nombre de la Mascota</Form.Label>
                <Form.Control 
                  className="custom-input"
                  placeholder="Ej. Rocky"
                  value={nuevaMascota.nombre}
                  onChange={(e) => setNuevaMascota({...nuevaMascota, nombre: e.target.value})}
                />
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="custom-label">Talla / Tamaño</Form.Label>
                    <Form.Select 
                      className="custom-input"
                      value={nuevaMascota.talla}
                      onChange={(e) => setNuevaMascota({...nuevaMascota, talla: e.target.value})}
                    >
                      {tallasDisponibles.map(t => <option key={t} value={t}>{t}</option>)}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="custom-label">Tipo de Pelo</Form.Label>
                    <Form.Select 
                      className="custom-input"
                      value={nuevaMascota.tipoPelo}
                      onChange={(e) => setNuevaMascota({...nuevaMascota, tipoPelo: e.target.value})}
                    >
                      <option value="Pelo Corto">Pelo Corto</option>
                      <option value="Pelo Largo">Pelo Largo</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label className="custom-label">Peso Actual (Kg)</Form.Label>
                <InputGroup>
                  <Form.Control 
                    type="number"
                    step="0.1"
                    className="custom-input"
                    placeholder="0.0"
                    value={nuevaMascota.peso}
                    onChange={(e) => setNuevaMascota({...nuevaMascota, peso: e.target.value})}
                  />
                  <InputGroup.Text style={{backgroundColor: 'white', borderRadius: '0 10px 10px 0', borderLeft: 'none'}}>kg</InputGroup.Text>
                </InputGroup>
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label className="custom-label">Etiquetas de Comportamiento</Form.Label>
                <div className="d-flex flex-wrap gap-2">
                  {etiquetasDisponibles.map(tag => (
                    <Badge 
                      key={tag}
                      bg={nuevaMascota.etiquetas.includes(tag) ? "warning" : "light"}
                      text={nuevaMascota.etiquetas.includes(tag) ? "white" : "dark"}
                      className="p-2 cursor-pointer border"
                      style={{ cursor: 'pointer', fontWeight: '500' }}
                      onClick={() => toggleEtiqueta(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </Form.Group>

              <Button type="submit" className="w-100 fw-bold py-3" style={{backgroundColor: 'var(--accent)', border: 'none', borderRadius: '12px'}}>
                Guardar Perfil
              </Button>
            </Form>
          </div>
        </Col>

        {/* LISTADO DE MASCOTAS */}
        <Col lg={8}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h3 className="fw-bold m-0">Base de Datos</h3>
            <div className="position-relative" style={{width: '300px'}}>
              <IoSearch className="position-absolute" style={{top: '14px', left: '16px', color: 'var(--text-muted)'}} />
              <Form.Control 
                className="custom-input ps-5"
                placeholder="Buscar mascota o dueño..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
          </div>

          <Row className="g-3">
            {filteredMascotas.map(m => (
              <Col md={6} key={m.id}>
                <Card className="glass-card border-0 h-100 shadow-sm hover-up">
                  <Card.Body className="p-4">
                    <div className="d-flex align-items-start justify-content-between mb-3">
                      <div className="d-flex align-items-center gap-3">
                        <div className="bg-light p-3 rounded-circle text-muted">
                          <IoPaw size={24} />
                        </div>
                        <div>
                          <h5 className="fw-bold m-0">{m.nombre}</h5>
                          <p className="text-muted small m-0">Dueño: {m.duenoNombre}</p>
                        </div>
                      </div>
                      <Badge bg="info" className="p-2">{m.talla}</Badge>
                    </div>

                    <div className="mb-3 d-flex gap-3 text-muted small">
                       <span><IoFitness /> {m.peso || 0} kg</span>
                       <span><IoColorWand /> {m.tipoPelo}</span>
                    </div>

                    <div className="d-flex flex-wrap gap-1 mb-4">
                      {m.etiquetas?.map(tag => (
                        <Badge key={tag} bg="light" text="dark" className="fw-normal border" style={{fontSize: '10px'}}>
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="d-flex gap-2 pt-3 border-top">
                      <Button 
                        variant="link" 
                        className="p-0 text-warning text-decoration-none fw-bold small"
                        onClick={() => { setPerfilAEditar(m); setShowEdit(true); }}
                      >
                        <IoCreate className="me-1" /> Editar Datos
                      </Button>
                      <Button 
                        variant="link" 
                        className="p-0 text-danger text-decoration-none fw-bold ms-auto small"
                        onClick={async () => { if(confirm("¿Eliminar perfil?")) await deleteDoc(doc(db, "mascotas", m.id)); }}
                      >
                        <IoTrash />
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Col>
      </Row>

      {/* MODAL DE EDICIÓN */}
      <Modal show={showEdit} onHide={() => setShowEdit(false)} centered size="md">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold">Editar Perfil de Mascota</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {perfilAEditar && (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label className="custom-label">Dueño (No editable)</Form.Label>
                <Form.Control className="custom-input bg-light" value={perfilAEditar.duenoNombre} disabled />
              </Form.Group>

              <Row>
                <Col md={8}>
                  <Form.Group className="mb-3">
                    <Form.Label className="custom-label">Nombre</Form.Label>
                    <Form.Control 
                      className="custom-input"
                      value={perfilAEditar.nombre}
                      onChange={(e) => setPerfilAEditar({...perfilAEditar, nombre: e.target.value})}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label className="custom-label">Peso (kg)</Form.Label>
                    <Form.Control 
                      type="number"
                      step="0.1"
                      className="custom-input"
                      value={perfilAEditar.peso}
                      onChange={(e) => setPerfilAEditar({...perfilAEditar, peso: e.target.value})}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="custom-label">Talla</Form.Label>
                    <Form.Select 
                      className="custom-input"
                      value={perfilAEditar.talla}
                      onChange={(e) => setPerfilAEditar({...perfilAEditar, talla: e.target.value})}
                    >
                      {tallasDisponibles.map(t => <option key={t} value={t}>{t}</option>)}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="custom-label">Tipo de Pelo</Form.Label>
                    <Form.Select 
                      className="custom-input"
                      value={perfilAEditar.tipoPelo}
                      onChange={(e) => setPerfilAEditar({...perfilAEditar, tipoPelo: e.target.value})}
                    >
                      <option value="Pelo Corto">Pelo Corto</option>
                      <option value="Pelo Largo">Pelo Largo</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-4">
                <Form.Label className="custom-label">Etiquetas</Form.Label>
                <div className="d-flex flex-wrap gap-2">
                  {etiquetasDisponibles.map(tag => (
                    <Badge 
                      key={tag}
                      bg={perfilAEditar.etiquetas.includes(tag) ? "warning" : "light"}
                      text={perfilAEditar.etiquetas.includes(tag) ? "white" : "dark"}
                      className="p-2 cursor-pointer border"
                      onClick={() => toggleEtiqueta(tag, true)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </Form.Group>

              <div className="d-flex gap-2">
                <Button variant="outline-danger" className="fw-bold px-4 border-0" onClick={() => setShowEdit(false)}>Cancelar</Button>
                <Button className="ms-auto fw-bold px-4" style={{backgroundColor: 'var(--accent)', border: 'none'}} onClick={handleActualizarMascota}>
                  Actualizar Perfil
                </Button>
              </div>
            </Form>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Mascotas;