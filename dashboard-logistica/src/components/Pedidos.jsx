import React, { useState, useEffect } from 'react';
import { Table, Row, Col, Modal, Spinner, Badge } from 'react-bootstrap';
import { collection, onSnapshot, query, orderBy, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../firebase'; // Ajusta la ruta si es necesario
import { IoCart, IoEye, IoCheckmarkCircle, IoTimeOutline, IoCubeOutline, IoArrowBackOutline } from 'react-icons/io5';

// Recibimos la función setVistaActual para la navegación
export default function Pedidos({ setVistaActual }) {
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  
  // Estados para el Modal
  const [showModal, setShowModal] = useState(false);
  const [pedidoActivo, setPedidoActivo] = useState(null);
  const [procesando, setProcesando] = useState(false);

  // --- 1. ESCUCHAR LOS PEDIDOS EN TIEMPO REAL ---
  useEffect(() => {
    // Traemos los pedidos ordenados por el más reciente
    const q = query(collection(db, 'pedidos'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPedidos(lista);
      setCargando(false);
    });

    return () => unsubscribe();
  }, []);

  // --- 2. MARCAR COMO ENTREGADO Y DESCONTAR STOCK ---
  const entregarPedido = async () => {
    if (!pedidoActivo) return;
    setProcesando(true);

    try {
      // A. Actualizar el estado del pedido a 'Entregado'
      await updateDoc(doc(db, 'pedidos', pedidoActivo.id), {
        estado: 'Entregado'
      });

      // B. Descontar el stock de cada producto en la colección 'inventario'
      const promesasStock = pedidoActivo.items.map(item => {
        const productRef = doc(db, 'inventario', item.id);
        // increment() con número negativo resta esa cantidad al campo actual
        return updateDoc(productRef, {
          stock: increment(-item.qty)
        });
      });

      // Esperamos a que todo el stock se descuente
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
        <div className="p-4 p-md-5 border-bottom d-flex align-items-center gap-3" style={{ borderColor: 'var(--border-light)' }}>
          {/* BOTÓN PARA REGRESAR AL INVENTARIO */}
          <button 
            onClick={() => setVistaActual('inventario')} 
            className="btn btn-light shadow-sm border p-2 d-flex align-items-center justify-content-center"
            style={{ borderRadius: '10px' }}
          >
            <IoArrowBackOutline size={22} color="var(--text-dark)" />
          </button>
          
          <div>
            <h3 className="fw-bold m-0 d-flex align-items-center gap-2">
              <IoCart color="var(--accent)" /> Recepción de Pedidos (App)
            </h3>
            <p className="text-muted m-0 mt-1" style={{fontSize: '14px'}}>
              Gestiona los apartados que los clientes realizan desde su teléfono.
            </p>
          </div>
        </div>

        {/* TABLA PRINCIPAL */}
        <div className="p-0">
          {cargando ? (
             <div className="text-center py-5"><Spinner animation="border" style={{color: 'var(--accent)'}} /></div>
          ) : (
            <Table borderless hover responsive className="beauty-table m-0 align-middle">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Fecha de Apartado</th>
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
                      <small className="text-muted">{pedido.items?.length || 0} productos</small>
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

      {/* MODAL DE DETALLE DEL PEDIDO */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
        <Modal.Header closeButton className="bg-light">
          <Modal.Title className="fw-bold">Detalle del Pedido</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {pedidoActivo && (
            <Row>
              {/* Columna Izquierda: Productos */}
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

              {/* Columna Derecha: Resumen y Cobro */}
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