import React, { useState, useEffect } from 'react';
import { Table, Row, Col, Modal, Spinner, Badge, Form } from 'react-bootstrap';
import { collection, onSnapshot, query, orderBy, doc, updateDoc, increment, addDoc, serverTimestamp, where } from 'firebase/firestore';
import { db } from '../firebase'; 
import { IoCart, IoEye, IoCheckmarkCircle, IoTimeOutline, IoCubeOutline, IoArrowBackOutline, IoAdd, IoTrash } from 'react-icons/io5';

export default function Pedidos({ setVistaActual }) {
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  
  // Estados para Modal de Detalle
  const [showModal, setShowModal] = useState(false);
  const [pedidoActivo, setPedidoActivo] = useState(null);
  const [procesando, setProcesando] = useState(false);

  // --- ESTADOS PARA NUEVO PEDIDO (MOSTRADOR) ---
  const [showModalNuevo, setShowModalNuevo] = useState(false);
  const [clientes, setClientes] = useState([]);
  const [inventario, setInventario] = useState([]);
  
  const [clienteSel, setClienteSel] = useState('');
  const [prodSel, setProdSel] = useState('');
  const [qtySel, setQtySel] = useState(1);
  const [carrito, setCarrito] = useState([]);

  // --- 1. ESCUCHAR DATOS EN TIEMPO REAL ---
  useEffect(() => {
    // Pedidos
    const qPedidos = query(collection(db, 'pedidos'), orderBy('createdAt', 'desc'));
    const unsubPedidos = onSnapshot(qPedidos, (snapshot) => {
      const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPedidos(lista);
      setCargando(false);
    });

    // Clientes (Para el select de mostrador)
    const qClientes = query(collection(db, 'usuarios'), where('rol', '==', 'cliente'));
    const unsubClientes = onSnapshot(qClientes, (snap) => {
      setClientes(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Inventario (Para el catálogo de venta)
    const qInventario = query(collection(db, 'inventario'));
    const unsubInventario = onSnapshot(qInventario, (snap) => {
      setInventario(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => { unsubPedidos(); unsubClientes(); unsubInventario(); };
  }, []);

  // --- 2. LÓGICA DEL CARRITO (MOSTRADOR) ---
  const agregarAlCarrito = () => {
    if (!prodSel || qtySel < 1) return;
    
    const producto = inventario.find(p => p.id === prodSel);
    if (!producto) return;

    if (qtySel > producto.stock) {
      alert(`Stock insuficiente. Solo hay ${producto.stock} unidades de ${producto.nombre} disponibles.`);
      return;
    }

    const nuevoItem = {
      id: producto.id,
      nombre: producto.nombre,
      precioVenta: producto.precioVenta,
      qty: parseInt(qtySel)
    };

    setCarrito([...carrito, nuevoItem]);
    setProdSel('');
    setQtySel(1);
  };

  const eliminarDelCarrito = (index) => {
    const nuevoCarrito = [...carrito];
    nuevoCarrito.splice(index, 1);
    setCarrito(nuevoCarrito);
  };

  const totalCarrito = carrito.reduce((acc, item) => acc + (item.precioVenta * item.qty), 0);

  const registrarVentaMostrador = async (estadoFinal) => {
    if (carrito.length === 0) return alert("Agrega al menos un producto al carrito.");
    setProcesando(true);

    try {
      let nombreC = "Público General";
      if (clienteSel) {
        const c = clientes.find(x => x.id === clienteSel);
        if (c) nombreC = c.nombre;
      }

      // Creamos el pedido en la BD (Idéntico a como lo hace la app)
      await addDoc(collection(db, 'pedidos'), {
        clienteNombre: nombreC,
        clienteId: clienteSel || 'publico_general',
        items: carrito,
        total: totalCarrito,
        estado: estadoFinal,
        createdAt: serverTimestamp(),
        origen: 'Mostrador'
      });

      // Si es entrega directa, descontamos el stock inmediatamente
      if (estadoFinal === 'Entregado') {
        const promesasStock = carrito.map(item => {
          const productRef = doc(db, 'inventario', item.id);
          return updateDoc(productRef, { stock: increment(-item.qty) });
        });
        await Promise.all(promesasStock);
      }

      setShowModalNuevo(false);
      setCarrito([]);
      setClienteSel('');
      setProdSel('');
    } catch (error) {
      console.error("Error al registrar venta:", error);
    } finally {
      setProcesando(false);
    }
  };

  // --- 3. MARCAR COMO ENTREGADO (PEDIDOS DE LA APP) ---
  const entregarPedido = async () => {
    if (!pedidoActivo) return;
    setProcesando(true);

    try {
      await updateDoc(doc(db, 'pedidos', pedidoActivo.id), { estado: 'Entregado' });

      // Descontar el stock de cada producto en la colección 'inventario'
      const promesasStock = pedidoActivo.items.map(item => {
        const productRef = doc(db, 'inventario', item.id);
        return updateDoc(productRef, { stock: increment(-item.qty) });
      });

      await Promise.all(promesasStock);
      setShowModal(false);
    } catch (error) {
      console.error("Error al entregar el pedido:", error);
      alert("Hubo un error al procesar la entrega.");
    } finally {
      setProcesando(false);
    }
  };

  const verDetalle = (pedido) => {
    setPedidoActivo(pedido);
    setShowModal(true);
  };

  return (
    <div className="animate__animated animate__fadeIn">
      {/* CABECERA */}
      <div className="glass-card mb-4">
        <div className="p-4 p-md-5 border-bottom d-flex justify-content-between align-items-center" style={{ borderColor: 'var(--border-light)' }}>
          <div className="d-flex align-items-center gap-3">
            <button 
              onClick={() => setVistaActual('inventario')} 
              className="btn btn-light shadow-sm border p-2 d-flex align-items-center justify-content-center"
              style={{ borderRadius: '10px' }}
            >
              <IoArrowBackOutline size={22} color="var(--text-dark)" />
            </button>
            <div>
              <h3 className="fw-bold m-0 d-flex align-items-center gap-2">
                <IoCart color="var(--accent)" /> Recepción de Pedidos
              </h3>
              <p className="text-muted m-0 mt-1" style={{fontSize: '14px'}}>
                Gestiona los apartados de la App y ventas de mostrador.
              </p>
            </div>
          </div>
          
          <button 
            onClick={() => setShowModalNuevo(true)} 
            className="btn text-white fw-bold px-4 py-2 d-flex align-items-center gap-2" 
            style={{backgroundColor: '#10B981', borderRadius: '8px'}}
          >
            <IoAdd size={20} /> Venta de Mostrador
          </button>
        </div>

        {/* TABLA PRINCIPAL */}
        <div className="p-0">
          {cargando ? (
             <div className="text-center py-5"><Spinner animation="border" style={{color: 'var(--accent)'}} /></div>
          ) : (
            <Table borderless hover responsive className="beauty-table m-0 align-middle">
              <thead>
                <tr>
                  <th>Cliente / Origen</th>
                  <th>Fecha de Registro</th>
                  <th>Total</th>
                  <th>Estado</th>
                  <th className="text-end">Acción</th>
                </tr>
              </thead>
              <tbody>
                {pedidos.map(pedido => (
                  <tr key={pedido.id}>
                    <td>
                      <span className="fw-bold d-block">{pedido.clienteNombre || 'Cliente Local'}</span>
                      <small className="text-muted d-flex align-items-center gap-1">
                        {pedido.origen === 'Mostrador' ? '🛍️ Mostrador' : '📱 App Móvil'} • {pedido.items?.length || 0} productos
                      </small>
                    </td>
                    <td>
                      <span className="text-muted">
                        {pedido.createdAt ? new Date(pedido.createdAt.toDate()).toLocaleDateString('es-MX', {
                          weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                        }) : 'Reciente'}
                      </span>
                    </td>
                    <td>
                      <span className="fw-bold" style={{color: '#D97706'}}>${pedido.total?.toFixed(2)}</span>
                    </td>
                    <td>
                      {pedido.estado === 'Entregado' ? (
                        <Badge bg="success" className="p-2"><IoCheckmarkCircle size={14} className="me-1"/> Entregado</Badge>
                      ) : (
                        <Badge bg="warning" text="dark" className="p-2"><IoTimeOutline size={14} className="me-1"/> {pedido.estado}</Badge>
                      )}
                    </td>
                    <td className="text-end">
                      <button onClick={() => verDetalle(pedido)} className="btn btn-sm btn-light border p-2">
                        <IoEye size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
                {pedidos.length === 0 && (
                  <tr><td colSpan="5" className="text-center py-5 text-muted">No hay pedidos recientes.</td></tr>
                )}
              </tbody>
            </Table>
          )}
        </div>
      </div>

      {/* --- MODAL: NUEVA VENTA MOSTRADOR --- */}
      <Modal show={showModalNuevo} onHide={() => {setShowModalNuevo(false); setCarrito([]);}} centered size="lg">
        <Modal.Header closeButton className="bg-light">
          <Modal.Title className="fw-bold">Punto de Venta (Mostrador)</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <Row>
            {/* IZQUIERDA: SELECCIÓN */}
            <Col md={7} className="border-end pe-4">
              <Form.Group className="mb-4">
                <Form.Label className="custom-label">Cliente (Opcional)</Form.Label>
                <Form.Select className="custom-input" value={clienteSel} onChange={e => setClienteSel(e.target.value)}>
                  <option value="">Venta al Público General</option>
                  {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </Form.Select>
              </Form.Group>

              <h6 className="fw-bold text-muted small mb-3">AGREGAR PRODUCTOS</h6>
              <Row className="gx-2 mb-3">
                <Col xs={8}>
                  <Form.Select className="custom-input" value={prodSel} onChange={e => setProdSel(e.target.value)}>
                    <option value="">Buscar producto en inventario...</option>
                    {inventario.map(p => (
                      <option key={p.id} value={p.id} disabled={p.stock < 1}>
                        {p.nombre} - ${p.precioVenta} {p.stock < 1 ? '(Agotado)' : `(Stock: ${p.stock})`}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
                <Col xs={4}>
                  <div className="d-flex gap-2">
                    <Form.Control type="number" min="1" className="custom-input" value={qtySel} onChange={e => setQtySel(e.target.value)} />
                    <button onClick={agregarAlCarrito} className="btn btn-dark fw-bold px-3"><IoAdd size={20}/></button>
                  </div>
                </Col>
              </Row>
            </Col>

            {/* DERECHA: CARRITO */}
            <Col md={5} className="ps-4 d-flex flex-column">
              <h6 className="fw-bold text-muted small mb-3 d-flex align-items-center gap-2"><IoCart/> CARRITO ACTUAL</h6>
              
              <div className="flex-grow-1 overflow-auto mb-3" style={{maxHeight: '200px'}}>
                {carrito.length === 0 ? (
                  <p className="text-muted small text-center mt-4">El carrito está vacío.</p>
                ) : (
                  carrito.map((item, idx) => (
                    <div key={idx} className="d-flex justify-content-between align-items-center bg-light p-2 rounded border mb-2 small">
                      <div className="text-truncate" style={{maxWidth: '120px'}}>
                        <Badge bg="secondary" className="me-2">{item.qty}x</Badge>
                        <span className="fw-bold">{item.nombre}</span>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        <span className="fw-bold text-success">${(item.precioVenta * item.qty).toFixed(2)}</span>
                        <button onClick={() => eliminarDelCarrito(idx)} className="btn btn-link text-danger p-0"><IoTrash size={16}/></button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-3 rounded mb-3 text-center" style={{ backgroundColor: '#FFFBEB', border: '1px solid #FDE68A' }}>
                <small className="fw-bold text-warning-emphasis d-block mb-1">TOTAL A COBRAR</small>
                <h3 className="fw-bold m-0 text-dark">${totalCarrito.toFixed(2)}</h3>
              </div>

              <div className="d-flex flex-column gap-2 mt-auto">
                <button 
                  onClick={() => registrarVentaMostrador('Pendiente de Recolección')} 
                  disabled={procesando || carrito.length === 0}
                  className="btn btn-outline-dark fw-bold py-2"
                >
                  Guardar como Pendiente (Apartado)
                </button>
                <button 
                  onClick={() => registrarVentaMostrador('Entregado')} 
                  disabled={procesando || carrito.length === 0}
                  className="btn text-white fw-bold py-3 d-flex justify-content-center align-items-center gap-2"
                  style={{backgroundColor: '#10B981', borderRadius: '10px'}}
                >
                  {procesando ? <Spinner size="sm" /> : <><IoCheckmarkCircle size={20}/> Cobrar y Entregar</>}
                </button>
              </div>
            </Col>
          </Row>
        </Modal.Body>
      </Modal>

      {/* MODAL ORIGINAL: DETALLE DEL PEDIDO (PARA PROCESAR LOS DE LA APP) */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
        <Modal.Header closeButton className="bg-light">
          <Modal.Title className="fw-bold">Detalle del Pedido</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {pedidoActivo && (
            <Row>
              <Col md={7} className="border-end pe-4">
                <h6 className="fw-bold text-muted mb-3 d-flex align-items-center gap-2">
                  <IoCubeOutline /> PRODUCTOS A PREPARAR
                </h6>
                <div className="d-flex flex-column gap-3 mb-4">
                  {pedidoActivo.items.map((item, idx) => (
                    <div key={idx} className="d-flex justify-content-between align-items-center p-3 bg-light rounded border">
                      <div className="d-flex align-items-center gap-3">
                        <Badge bg="secondary" className="fs-6 px-2">{item.qty}x</Badge>
                        <span className="fw-bold text-dark">{item.nombre}</span>
                      </div>
                      <span className="text-muted fw-bold">${(item.precioVenta * item.qty).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </Col>

              <Col md={5} className="ps-4">
                <div className="p-4 rounded mb-4" style={{ backgroundColor: '#FFFBEB', border: '1px solid #FDE68A' }}>
                  <h6 className="fw-bold text-warning-emphasis mb-1">CLIENTE</h6>
                  <p className="fs-5 fw-bold mb-3 text-dark">{pedidoActivo.clienteNombre}</p>
                  
                  <h6 className="fw-bold text-warning-emphasis mb-1">TOTAL A COBRAR EN CAJA</h6>
                  <p className="display-6 fw-bold m-0" style={{color: '#D97706'}}>${pedidoActivo.total?.toFixed(2)}</p>
                </div>

                {pedidoActivo.estado !== 'Entregado' ? (
                  <button 
                    onClick={entregarPedido} 
                    className="btn w-100 text-white fw-bold py-3 d-flex align-items-center justify-content-center gap-2" 
                    style={{backgroundColor: '#10B981', borderRadius: '12px'}}
                    disabled={procesando}
                  >
                    {procesando ? <Spinner size="sm" /> : <><IoCheckmarkCircle size={22} /> Cobrado y Entregado</>}
                  </button>
                ) : (
                  <div className="text-center p-3 border rounded text-success fw-bold bg-light">
                    Este pedido ya fue completado.
                  </div>
                )}
              </Col>
            </Row>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
}